"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "plotly", "../common/HTMLWidget"], factory);
    } else {
        root.plotly_Common = factory(root.d3, root.plotly, root.common_HTMLWidget);
    }
}(this, function (d3, plotly, HTMLWidget) {
    function Common(target) {
        HTMLWidget.call(this);

        var context = this;
        this._tag = "div";
    }
    Common.prototype = Object.create(HTMLWidget.prototype);
    Common.prototype.constructor = Common;
    Common.prototype._class += " plotly_Common";

    var schema = plotly.PlotSchema.get();
    Common.prototype.plotlyPublishTrace = function (type) {
        this._type = type;
        this._schema = schema.traces[type].attributes;
        for (var key in this._schema) {
            switch (key) {
                case "type":
                    break;
                default:
                    if (key !=="uid" &&
                        key.indexOf("src") !== key.length - 3) {
                        var meta = this._schema[key];
                        switch (meta.valType) {
                            case "boolean":
                            case "string":
                            case "number":
                                this.publish(this._type + "_" + key, meta.dflt, meta.valType, key, null, { optional: meta.dflt === undefined });
                                break;
                            case "enumerated":
                                this.publish(this._type + "_" + key, meta.dflt, "set", key, meta.values);
                                break;
                            default:
                                console.log(key, meta.valType);
                        }
                    }
            }
        };
    };

    Common.prototype.getChartOptions = function () {
        var retVal = this._rootNode.data || [];
        if (retVal.length === 0) {
            retVal.push({
                type: this._type
            });
        }
        for (var key in this._schema) {
            switch (key) {
                case "type":
                    break;
                default:
                    if (this[this._type + "_" + key]) {
                        retVal[0][key] = this[this._type + "_" + key]();
                    }
            }
        };
        return retVal;
    };

    Common.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        this._rootNode = domNode;
        var config = this.getChartOptions();
        var layout = {
            margin: {
                l: 0,
                t: 0,
                r: 0,
                b: 0
            },
            width: this.width(),
            height: this.height()
        }
        plotly.newPlot(domNode, config, layout, { displayModeBar: false });
    };

    Common.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        var config = this.getChartOptions();
        domNode.data = config;
        domNode.layout.width = this.width();
        domNode.layout.height = this.height();
        plotly.redraw(domNode);
    };

    return Common;
}));
