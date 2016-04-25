"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/Class", "../common/PropertyExt", "../common/Utility", "./HipieDDL", "../other/Persist", "../layout/Surface", "./FlyoutButton"], factory);
    } else {
        root.marshaller_HipieDDLMixin = factory(root.d3, root.common_Class, root.common_PropertyExt, root.common_PropertyExt, root.common_Utility, root.other_Persist, root.layout_Surface, root.marshaller_FlyoutButton);
    }
}(this, function (d3, Class, PropertyExt, Utility, HipieDDL, Persist, Surface, FlyoutButton) {

    function HipieDDLMixin() {
        Class.call(this);
        PropertyExt.call(this);
    }
    HipieDDLMixin.prototype = Object.create(Class.prototype);
    HipieDDLMixin.prototype.constructor = HipieDDLMixin;
    HipieDDLMixin.prototype.mixin(PropertyExt);
    HipieDDLMixin.prototype._class += " marshaller_HipieDDLMixin";

    HipieDDLMixin.prototype.publish("ddlUrl", "", "string", "DDL URL", null, { tags: ["Private"] });
    HipieDDLMixin.prototype.publish("databomb", "", "string", "Data Bomb", null, { tags: ["Private"] });
    HipieDDLMixin.prototype.publish("proxyMappings", {}, "object", "Proxy Mappings", null, { tags: ["Private"] });
    HipieDDLMixin.prototype.publish("clearDataOnUpdate", true, "boolean", "Clear data prior to refresh", null);
    HipieDDLMixin.prototype.publish("propogateClear", false, "boolean", "Propogate clear to dependent visualizations", null);

    HipieDDLMixin.prototype.selection = function (_) {
        if (!arguments.length) return this.marshaller ? this.marshaller.request : null;
        if (this.marshaller) {
            this.marshaller.fetchData(_, true);
        }
        return this;
    };

    HipieDDLMixin.prototype.gatherDashboards = function (marshaller, databomb) {
        if (databomb instanceof Object) {
        } else if (databomb) {
            databomb = JSON.parse(databomb);
        }
        var curr = null;
        var dashboards = {};
        marshaller.accept({
            visit: function (item) {
                if (item instanceof HipieDDL.Dashboard) {
                    curr = {
                        dashboard: item,
                        visualizations: [],
                        popupVisualizations: []
                    };
                    dashboards[item.getQualifiedID()] = curr;
                } else if (item instanceof HipieDDL.DataSource) {
                    if (item.databomb && databomb[item.id]) {
                        item.comms.databomb(databomb[item.id]);
                    }
                } else if (item instanceof HipieDDL.Output) {
                    if (item.dataSource.databomb) {
                        item.dataSource.comms.databombOutput(item.from, item.id);
                    }
                } else if (item instanceof HipieDDL.Visualization) {
                    if (item.widget) {
                        if (item.properties.flyout) {
                            curr.popupVisualizations.push(item);
                        } else {
                            curr.visualizations.push(item);
                        }

                    }
                }
            }
        });
        return dashboards;
    };

    HipieDDLMixin.prototype.marshallerRender = function (BaseClass, callback) {
        if (this.ddlUrl() === "" || (this.ddlUrl() === this._prev_ddlUrl && this.databomb() === this._prev_databomb)) {
            if (this.marshaller) {
                this.marshaller
                    .proxyMappings(this.proxyMappings())
                    .clearDataOnUpdate(this.clearDataOnUpdate())
                    .propogateClear(this.propogateClear())
                ;
            }
            return BaseClass.render.call(this, function (widget) {
                if (callback) {
                    callback(widget);
                }
            });
        }
        if (this._prev_ddlUrl && this._prev_ddlUrl !== this.ddlUrl()) {
            //  DDL has actually changed (not just a deserialization)
            this
                .clearContent()
            ;
        }
        this._prev_ddlUrl = this.ddlUrl();
        this._prev_databomb = this.databomb();

        //  Gather existing widgets for reuse  ---
        var widgetArr = [];
        Persist.widgetArrayWalker(this.content(), function (w) {
            widgetArr.push(w);
        });
        var widgetMap = d3.map(widgetArr, function (d) {
            return d.id();
        });
        var removedMap = d3.map(widgetArr.filter(function (d) { return d.id().indexOf(d._idSeed) !== 0 && d.id().indexOf("_pe") !== 0; }), function (d) {
            return d.id();
        });

        var context = this;
        this.marshaller = new HipieDDL.Marshaller()
            .proxyMappings(this.proxyMappings())
            .clearDataOnUpdate(this.clearDataOnUpdate())
            .propogateClear(this.propogateClear())
            .widgetMappings(widgetMap)
            .on("commsEvent", function (source, error) {
                context.commsEvent.apply(context, arguments);
            })
            .on("vizEvent", function () {
                context.vizEvent.apply(context, arguments);
            });
        ;
        this.firstRender = true;

        //  Parse DDL  ---
        if (this.ddlUrl()[0] === "[" || this.ddlUrl()[0] === "{") {
            this.marshaller.parse(this.ddlUrl(), postParse);
        } else {
            this.marshaller.url(this.ddlUrl(), postParse);
        }

        function postParse() {
            context._ddlDashboards = context.gatherDashboards(context.marshaller, context.databomb());
            //  Remove existing widgets not used and prime popups ---
            for (var key in context._ddlDashboards) {
                context._ddlDashboards[key].visualizations.forEach(function (viz, idx) {
                    removedMap.remove(viz.id);
                    if (!context.marshaller.widgetMappings().get(viz.id)) {
                        viz.widgetSurface = null;
                        if (viz.widget instanceof Surface || viz.widget.classID() === "composite_MegaChart") {
                            viz.widgetSurface = viz.widget;
                        } else {
                            viz.widgetSurface = new Surface()
                                .widget(viz.widget)
                            ;
                        }
                        viz.widgetSurface.title(viz.title);
                        viz.widget.size({ width: 0, height: 0 });
                    }
                });
                context._ddlDashboards[key].popupVisualizations.forEach(function (viz, idx) {
                    removedMap.remove(viz.id);
                    var targetVizs = viz.events.getUpdatesVisualizations();
                    targetVizs.forEach(function (targetViz) {
                        switch (targetViz.widget.classID()) {
                            case "composite_MegaChart":
                                var flyoutButton = new FlyoutButton()
                                    .title(viz.title)
                                    .widget(viz.widget)
                                ;
                                targetViz.widget.toolbarWidgets().push(flyoutButton);
                                break;
                        }
                    });
                });
            }
            removedMap.forEach(function (key, value) {
                context.clearContent(value);
            });
            context.populateContent();
            BaseClass.render.call(context, function (widget) {
                for (var dashKey in context._ddlDashboards) {
                    for (var dsKey in context._ddlDashboards[dashKey].dashboard.datasources) {
                        context._ddlDashboards[dashKey].dashboard.datasources[dsKey].fetchData({}, true);
                    }
                }

                //  Delay callback until first data has loaded  ---
                var timeoutCounter = 0;
                var intervalHandler = setInterval(function () {
                    if (context.marshaller.commsDataLoaded() || ++timeoutCounter > 120) {
                        clearInterval(intervalHandler);
                        if (callback) {
                            callback(widget);
                        }
                    }
                }, 500);
            });
        }
    };

    HipieDDLMixin.prototype.dashboards = function () {
        var retVal = {};
        for (var key in this._ddlDashboards) {
            retVal[key] = {};
            this._ddlDashboards[key].visualizations.forEach(function (ddlViz) {
                retVal[key][ddlViz.id] = ddlViz.widget;
            }, this);
        }
        return retVal;
    };


    HipieDDLMixin.prototype.visualizations = function () {
        var retVal = {};
        for (var key in this._ddlDashboards) {
            this._ddlDashboards[key].visualizations.forEach(function (ddlViz) {
                retVal[ddlViz.id] = ddlViz.widget;
            }, this);
        }
        return retVal;
    };

    var tpl =
"<!doctype html><html><head><meta charset='utf-8'>" +
"<script src='http://viz.hpccsystems.com/v1.14.0-rc5/dist-amd/hpcc-viz.js'></script>" +
"<script src='http://viz.hpccsystems.com/v1.14.0-rc5/dist-amd/hpcc-viz-common.js'></script>" +
"</head>" +
"<body style='padding:0px; margin:0px; overflow:hidden'><div id='placeholder' style='width:100%; height:100vh'></div><script>" + 
"   require(['src/other/Persist'], function (Persist) {\n" +
"       Persist.create({STATE}, function(widget) {\n" +
"           widget\n" +
"               .target('placeholder')\n" +
"               .ddlUrl('{DDL}')\n" +
"               .databomb('{DATABOMB}')\n" +
"               .render()\n" +
"           ;\n" +
"       });\n" +
"   });" +
"</script></body></html>";

    HipieDDLMixin.prototype.generateTestPage = function () {
        if (this.marshaller) {
            var context = this;
            var state = Persist.serialize(context, function (widget, publishItem) {
                if (publishItem.id === "databomb" || publishItem.id === "ddlUrl") {
                    return true;
                }
                return false;
            });
            var databomb = this.marshaller.createDatabomb();
            var page = tpl
                .replace("{VERSION}", context.version())
                .replace("{STATE}", state)
                .replace("{DDL}", context.marshaller._json.replace("WUID", "databomb"))
                .replace("{DATABOMB}", JSON.stringify(databomb))
            ;
            Utility.downloadBlob("html", page, "test");
        }
    };

    HipieDDLMixin.prototype.vizEvent = function (sourceWidget, eventID, row, col, selected) {
    };

    HipieDDLMixin.prototype.commsEvent = function (ddlSource, eventID, request, response) {
    };

    return HipieDDLMixin;
}));