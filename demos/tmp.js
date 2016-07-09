"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "grid-list", "src/common/Utility", "src/layout/Surface", "src/layout/Grid", "src/other/Persist", "src/other/PropertyEditor", "test/Factory"], factory);
    }
}(this, function (d3, GridList, Utility, Surface, Grid, Persist, PropertyEditor, testFactory) {
    function Main() {
        this.showSpinner();
        this.urlParts = window.location.search.split("?");

        this._testFactory = testFactory;

        this.initGrid();
        var context = this;
        testFactory.deserializeFromURL(this.urlParts[1], function (widget, currTest) {
            if (widget) {
                context._currTest = currTest;
                context.showWidget(widget);
            } else {
                context.loadWidget("src/chart/Column");
            }
        });
    }
    Main.prototype.constructor = Main;

    Main.prototype.initGrid = function () {
        this._propEditor = new PropertyEditor()
            .target("properties")
            .show_settings(true);
        ;

        this._main = new Grid()
            .target("surface")
            .surfacePadding(0)
            .surfaceBorderWidth(0)
        ;

        this._cloneSurface = new Surface()
            .target("clone")
        ;
    };

    Main.prototype.initPropertiesSwitch = function (id) {
        var context = this;
        this._toggleDesign = d3.select(id)
            .on("click", function () {
                context.showProperties();
            })
        ;
        this.showProperties();
    };



    Main.prototype.showSpinner = function (show) {
    };

    Main.prototype.loadWidget = function (widgetPath, widgetTest, params) {
        this.showSpinner();
        this._currTest = widgetPath + (widgetTest ? "." + widgetTest : "");
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

    Main.prototype.openWidget = function (json) {
        var context = this;
        Persist.create(json, function (widget) {
            context.showWidget(widget);
        });
    };

    Main.prototype.saveWidget = function () {
        var text = JSON.stringify(Persist.serializeToObject(this._currWidget, null, true, true), null, "  ");
        Utility.downloadBlob("JSON", text, this._currWidget.classID(), "persist");
    };

    Main.prototype.showWidget = function (widget) {
        this.showSpinner();
        this._propEditor
            .widget(null)
            .render()
        ;
        this._currWidget = widget;
        if (this._monitorHandle) {
            this._monitorHandle.remove();
        }
        this.updateUrl();
        this.showClone();
        var context = this;
        this._monitorHandle = widget.monitor(function () {
            context.updateUrl();
            context.showClone();
        });
        var context = this;
        this._main
            .setContent(0, 0, widget, "", 2, 2)
            .render(function (mainWidget) {
                context.showSpinner(false);
            })
        ;
        if (widget && widget.designMode) {
            widget.designMode(this.propertiesVisible());
        }
        this._propEditor
            .widget(widget)
            .render()
        ;
    };

    Main.prototype.cloneWidget = function (func) {
        Persist.clone(this._currWidget, func);
    };

    Main.prototype.propertiesVisible = function () {
        return false;
    };

    Main.prototype.showProperties = function () {
        var show = this.propertiesVisible();
        if (show) {
            this._propEditor
                .resize()
                .render()
            ;
        }
        if (this._currWidget && this._currWidget.designMode) {
            this._currWidget.designMode(show);
        }
        this._main
            .resize()
            .render()
        ;
    };

    Main.prototype.cloneVisible = function () {
        return false;
    };

    Main.prototype.showClone = function () {
        var show = this.cloneVisible();
        doResize();
        if (show) {
            var context = this;
            this.cloneWidget(function (widget) {
                context._cloneSurface
                    .surfacePadding(0)
                    .widget(widget)
                    .render()
                ;
            });
        } else {
            this._cloneSurface
                .surfacePadding(0)
                .widget(null)
                .render()
            ;
        }
    };

    Main.prototype.openTheme = function (json) {
        var context = this;
        Persist.applyTheme(this._currWidget, json, function () {
            context._currWidget.render(function (w) {
                context.showSpinner(false);
            });
        });
    };

    Main.prototype.saveTheme = function () {
        var text = JSON.stringify(Persist.serializeThemeToObject(this._currWidget), null, "  ");
        Utility.downloadBlob("JSON", text, null, "theme");
    };

    Main.prototype.resetTheme = function () {
        var context = this;
        Persist.removeTheme(this._currWidget, function () {
            context._currWidget.render(function (w) { context.showSpinner(false); });
        });
    };

    Main.prototype.updateUrl = function () {
        var params = "";
        if (this._currWidget) {
            params = testFactory.serializeToURL(this._currTest, this._currWidget);
        }
        try {
            window.history.pushState("", "", this.urlParts[0] + (params ? "?" + params : ""));
        } catch (e) {
            //  Local files do not have history...
        }
    };

    Main.prototype.doResize = function () {
        this._main
            .resize()
            .render()
        ;
        this._propEditor
            .resize()
            .render()
        ;
        this._cloneSurface
            .resize()
            .render()
        ;
    };

    return Main;





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