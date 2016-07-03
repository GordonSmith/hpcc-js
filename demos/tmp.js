﻿"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "grid-list", "src/common/Utility", "src/layout/Surface", "src/layout/Grid", "src/other/Persist", "src/other/PropertyEditor", "src/tree/CirclePacking", "test/Factory"], factory);
    }
}(this, function (d3, GridList, Utility, Surface, Grid, Persist, PropertyEditor, Dendrogram, testFactory) {
    function Main() {
    }
//    Main.prototype = Object.create();
    Main.prototype.constructor = Main;

    Main.prototype.init = function () {
        this.showSpinner();
        this.initWidgetMenu();
        this.initWidgetMenuOld();
        this.initFileMenu();
        this.initGrid();
        this.initToolbar();
        this.loadWidget("src/chart/Column");
    };

    Main.prototype.initWidgetMenu = function () {
        var context = this;
        var categories = d3.select("#widgetDropDownUL").selectAll("li").data(d3.map(testFactory.categories).entries());
        var catLI = categories.enter().append("li")
            .attr("class", "pure-menu-item pure-menu-has-children pure-menu-allow-hover")
        ;
        catLI.append("a")
            .attr("href", "#")
            .attr("class", "pure-menu-link")
            .text(function (d) { return d.key; })
        ;
        var catUL = catLI.append("ul")
            .attr("class", "pure-menu-children")
        ;
        var widgets = catUL.selectAll("li").data(function (d) {
            var retVal = [];
            for (var key in d.value) {
                var value = [];
                for (var key2 in d.value[key]) {
                    value.push({
                        key: key2,
                        value: d.value[key][key2]
                    });
                }
                retVal.push({
                    key: key,
                    value: value
                });
            }
            return retVal;
        });
        var widgetsLI = widgets.enter().append("li")
            .attr("class", "pure-menu-item pure-menu-has-children pure-menu-allow-hover")
        ;
        widgetsLI
            .append("a")
            .attr("href", "#")
            .attr("class", "pure-menu-link")
            .text(function (d) { return d.key; })
        ;
        var tests = widgetsLI.append("ul")
            .attr("class", "pure-menu-children")
            .selectAll("li").data(function (d) { return d.value; })
        ;
        tests.enter().append("li")
            .attr("class", "pure-menu-item")
            .append("a")
            .attr("href", "#")
            .attr("class", "pure-menu-link")
            .text(function (d) { return d.key; })
            .on("click", function (d) {
                context.loadWidget(d.value.widgetPath, d.key);
                d3.select(d3.select("#widgetDropDown").parentNode)
                    .classed("pure-menu-active", false);
                ;
            })
        ;
        d3.select(d3.select("#widgetDropDown").parentNode)
            .classed("pure-menu-active", true);
        ;
    };

    Main.prototype.initWidgetMenuOld = function () {
        var context = this;
        var categoryOptions = d3.select("#widgetSelect").selectAll("li").data(d3.map(testFactory.categories).entries());
        categoryOptions.enter().append("li")
            .attr("value", function (d, idx) { return idx; })
            .text(function (d) { return d.key; })
            .append("ul")
            .attr("class", "widgetMenu")
            .each(function (d, idx) {
                var widgetOptions = d3.select(this).selectAll("li").data(d3.map(d.value).entries());
                widgetOptions.enter().append("li")
                    .attr("value", function (d, idx) { return idx; })
                    .text(function (d) { return d.key; })
                    .each(function (d) {
                        var element = d3.select(this);
                        if (d3.keys(d.value).length === 1) {
                            element
                                .on("click", function (d) {
                                    context.loadWidget(d3.map(d.value).values()[0].widgetPath);
                                    d3.select("#widgetSelect").classed("hide", true);
                                })
                            ;
                        } else {
                            var sampleOptions = element.append("ul")
                                .attr("class", "widgetMenu")
                            ;
                            var sampleTest = sampleOptions.selectAll("li").data(d3.map(d.value).entries());
                            sampleTest.enter().append("li")
                                .text(function (d) { return d.key; })
                                .on("click", function (d) {
                                    context.loadWidget(d.value.widgetPath, d.key);
                                    d3.select("#widgetSelect").classed("hide", true);
                                })
                            ;
                        }
                    })
                ;
            })
        ;
    };

    Main.prototype.initFileMenu = function () {
        var context = this;
        var fileOpenInput = d3.select("#fileOpenInput")
            .on("change", function () {
                context.showSpinner();
                for (var i = 0, f; f = this.files[i]; i++) {
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            console.log('e readAsText = ', e);
                            console.log('e readAsText target = ', e.target);
                            try {
                                var json = JSON.parse(e.target.result);
                                switch (context._openMode) {
                                    case "theme":
                                        Persist.applyTheme(context._currWidget, json, function () {
                                            context._currWidget.render();
                                        });
                                        break;
                                    default:
                                        Persist.create(json, function (widget) {
                                            context.showWidget(widget);
                                        });
                                }
                            } catch (ex) {
                                alert('ex when trying to parse json = ' + ex);
                            }
                        }
                    })(f);
                    reader.readAsText(f);
                }
            })
        ;
        d3.select("#fileOpen")
            .on("click", function () {
                d3.event.preventDefault();
                context.closeFileMenu();
                d3.select("#fileOpenInput").property("accept", ".persist,.json");
                context._openMode = "persist";
                fileOpenInput.node().click();
            })
        ;
        d3.select("#fileSave")
            .on("click", function () {
                d3.event.preventDefault();
                var text = JSON.stringify(Persist.serializeToObject(context._currWidget, null, true), null, "  ");
                Utility.downloadBlob("JSON", text, context._currWidget.classID(), "persist");
                context.closeFileMenu();
            })
        ;
        d3.select("#themeOpen")
            .on("click", function () {
                d3.event.preventDefault();
                context.closeFileMenu();
                d3.select("#fileOpenInput").property("accept", ".theme,.json");
                context._openMode = "theme";
                fileOpenInput.node().click();
            })
        ;
        d3.select("#themeSave")
            .on("click", function () {
                d3.event.preventDefault();
                var text = JSON.stringify(Persist.serializeThemeToObject(context._currWidget), null, "  ");
                Utility.downloadBlob("JSON", text, null, "theme");
                context.closeFileMenu();
            })
        ;
        d3.select("#themeReset")
            .on("click", function () {
                d3.event.preventDefault();
                Persist.removeTheme(context._currWidget, function () {
                    context._currWidget.render();
                });
                context.closeFileMenu();
            })
        ;
    };

    Main.prototype.closeFileMenu = function () {
        var layout = document.querySelector('.mdl-layout');
        layout.MaterialLayout.toggleDrawer();
    };

    Main.prototype.initGrid = function () {
        this._propEditor = new PropertyEditor()
            .target("properties")
            .show_settings(true);
            
        ;
        this._propEditor.onChange = Surface.prototype.debounce(function (widget, propID) {
            if (propID === "columns") {
            } else if (propID === "data") {
            } else {
                //displaySerialization();
                //displaySerializationText();
                //displayThemeText();
            }
        }, 500);

        this._main = new Grid()
            .target("surface")
            .surfacePadding(0)
            .surfaceBorderWidth(0)
        ;
    };

    Main.prototype.initToolbar = function () {
        var context = this;
        this._toggleDesign = d3.select("#switch-design")
            .on("click", function () {
                context.showProperties();
            })
        ;
        this.showProperties();
    };

    Main.prototype.showSpinner = function (show) {
        show = arguments.length ? arguments[0] : true;
        d3.select("#surface")
            .style("opacity", 0)
        ;
        if (!show) {
            d3.select("#surface").transition().duration(750)
                .style("opacity", 1)
            ;
        }
        d3.select("#spinner")
            .classed("is-active", show)
        ;
    };

    Main.prototype.loadWidget = function (widgetPath, widgetTest, params) {
        this.showSpinner();
        var context = this;
        var func = widgetTest ? testFactory.widgets[widgetPath][widgetTest].factory : d3.map(testFactory.widgets[widgetPath]).values()[0].factory;
        func(function (widget) {
            if (params) {
                for (var key in params) {
                    if (widget["__meta_" + key] !== undefined) {
                        if (widget["__meta_" + key].type === "array") {
                            widget[key](params[key].split(","));
                        } else {
                            widget[key](params[key]);
                        }
                    }
                }
            }
            context.showWidget(widget);
        });
    };

    Main.prototype.showWidget = function (widget) {
        this.showSpinner();
        this._currWidget = widget;
        if (this._monitorHandle) {
            this._monitorHandle.remove();
        }
        //updateUrl(widget, widgetPath, widgetTest);
        this._monitorHandle = widget.monitor(function () {
            //updateUrl(currWidget, widgetPath, widgetTest);
        });
        var context = this;
        this._main
            .setContent(0, 0, widget, "", 2, 2)
            .render(function (mainWidget) {
                context.showSpinner(false);

                //displayProperties(currWidget);
                //displayPropertyTree(currWidget);
                //displaySerialization(currWidget);
                //displaySerializationText(currWidget);
                //displayThemeText(currWidget);
            })
        ;
        this._propEditor
            .widget(widget)
            .render()
        ;
    };

    Main.prototype.showProperties = function () {
        var show = d3.select("#switch-design").property("checked");
        if (show) {
            d3.select("#cellSurface")
                .classed("mdl-cell--12-col", false)
                .classed("mdl-cell--8-col", true)
            ;
            d3.select("#cellProperties")
                .style("display", null)
            ;
            this._propEditor
                .resize()
                .render()
            ;
        } else {
            d3.select("#cellSurface")
                .classed("mdl-cell--8-col", false)
                .classed("mdl-cell--12-col", true)
            ;
            d3.select("#cellProperties")
                .style("display", "none")
            ;
        }
        this._main
            //.setContent(0, 2, show ? this._propEditor : null, "", 2, 1)
            .resize()
            .render(function (widget) {
                if (show) {
                    //displayProperties();
                }
            })
        ;
    };

    return new Main();





    var gridSize = 100;
    var gutter = 2;
    var lanes = 10;
    var items = [
        { w: 1, h: 1, x: 0, y: 0 },
        { w: 1, h: 1, x: 0, y: 1 },
        { w: 3, h: 1, x: 0, y: 2 },
        { w: 2, h: 2, x: 0, y: 3 },
        { w: 2, h: 1, x: 1, y: 0 },
        { w: 1, h: 1, x: 1, y: 1 },
        { w: 1, h: 6, x: 3, y: 0 },
        { w: 1, h: 1, x: 4, y: 0 },
        { w: 2, h: 1, x: 4, y: 1 },
        { w: 1, h: 1, x: 4, y: 2 },
        { w: 1, h: 1, x: 4, y: 3 },
        { w: 1, h: 1, x: 5, y: 0 },
        { w: 1, h: 2, x: 5, y: 2 },
        { w: 1, h: 1, x: 6, y: 0 }
    ];
    items.forEach(function (item, idx) { item.id = idx; });

    var surface = d3.select("#surface");
    var gridList = null;
    var dragItem = null;
    var dragItemSize = null;
    var drag = d3.behavior.drag()
        .origin(function (d) { return { x: d.x * gridSize, y: d.y * gridSize }; })
        .on("dragstart", function (d) {
            gridList = new GridList(items, {
                direction: "horizontal",
                lanes: lanes
            });
            dragItem = surface.append("div")
                .attr("class", "dragging")
                .style("transform", function () { return "translate(" + d.x * gridSize + "px, " + d.y * gridSize + "px)"; })
                .style("width", function () { return d.w * gridSize - gutter + "px"; })
                .style("height", function () { return d.h * gridSize - gutter + "px"; })
            ;
        })
        .on("drag", function (d) {
            var pos = [Math.max(0, Math.floor((d3.event.x + gridSize / 2) / gridSize)), Math.max(0, Math.floor((d3.event.y + gridSize / 2) / gridSize))];
            if (pos[0] + d.w > lanes) {
                pos[0] = d.w - lanes;
            }
            if (pos[1] + d.h > lanes) {
                pos[1] = d.h - lanes;
            }
            if (d.x !== pos[0] || d.y !== pos[1]) {
                gridList.moveItemToPosition(d, pos);
                render();
            }
            dragItem
                .style("transform", function () { return "translate(" + d3.event.x + "px, " + d3.event.y + "px)"; })
                .style("width", function () { return d.w * gridSize + "px"; })
                .style("height", function () { return d.h * gridSize + "px"; })
            ;
        })
        .on("dragend", function (d) {
            gridList = null;
            dragItem.remove();
            dragItem = null;
        })
    ;
    var resizeDrag = d3.behavior.drag()
        .origin(function (d) { return { x: (d.x + d.w - 1) * gridSize, y: (d.y + d.h - 1) * gridSize }; })
        .on("dragstart", function (d) {
            d3.event.sourceEvent.stopPropagation()
            gridList = new GridList(items, {
                direction: "horizontal",
                lanes: lanes
            });
            dragItem = surface.append("div")
                .attr("class", "resizing")
                .style("transform", function () { return "translate(" + d.x * gridSize + "px, " + d.y * gridSize + "px)"; })
                .style("width", function () { return d.w * gridSize - gutter + "px"; })
                .style("height", function () { return d.h * gridSize - gutter + "px"; })
            ;
            dragItemSize = {
                x: d.x,
                y: d.y,
                w: d.w,
                h: d.h
            };
        })
        .on("drag", function (d) {
            d3.event.sourceEvent.stopPropagation()
            var pos = [Math.max(0, Math.round(d3.event.x / gridSize)), Math.max(0, Math.round(d3.event.y / gridSize))];
            var size = {
                w: Math.max(1, pos[0] - d.x + 1),
                h: Math.max(1, pos[1] - d.y + 1)
            };
            if (d.w !== size.w || d.h !== size.h) {
                gridList.resizeItem(d, size);
                render();
            }
            dragItem
                .style("width", function () { return (-dragItemSize.x + 1) * gridSize + d3.event.x - gutter + "px"; })
                .style("height", function () { return (-dragItemSize.y + 1) * gridSize + d3.event.y - gutter + "px"; })
            ;
        })
        .on("dragend", function (d) {
            d3.event.sourceEvent.stopPropagation()
            gridList = null;
            dragItem.remove();
            dragItem = null;
        })
    ;
    render();

    function render() {
        var divItems = surface.selectAll(".draggable").data(items, function (d) { return d.id; });
        divItems.enter().append("div")
            .attr("class", "draggable")
            .call(drag)
            .append("div")
                .attr("class", "resizeHandle")
                .call(resizeDrag)
        ;
        divItems.transition().duration(100)
            .style("left", function (d) { return d.x * gridSize + "px"; })
            .style("top", function (d) { return d.y * gridSize + "px"; })
            .style("width", function (d) { return d.w * gridSize - gutter + "px"; })
            .style("height", function (d) { return d.h * gridSize - gutter + "px"; })
        ;
        divItems.exit()
            .remove()
        ;
    }

    return {
    };
}));