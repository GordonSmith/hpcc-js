var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "d3-tip", "../common/Widget", "css!./ITooltip"], function (require, exports, d3, _d3Tip, Widget_1) {
    "use strict";
    var d3Tip = _d3Tip;
    var ITooltip = (function (_super) {
        __extends(ITooltip, _super);
        function ITooltip() {
            _super.call(this);
            this._valueFormatter = d3.format(this.tooltipValueFormat());
            if (this.layerEnter) {
                var layerEnter = this.layerEnter;
                this.layerEnter = function (base, svgElement, domElement) {
                    this.tooltipEnter(svgElement);
                    layerEnter.apply(this, arguments);
                };
                var layerUpdate = this.layerUpdate;
                this.layerUpdate = function (base) {
                    layerUpdate.apply(this, arguments);
                    this.tooltipUpdate();
                };
                var layerExit = this.layerExit;
                this.layerExit = function (base) {
                    layerExit.apply(this, arguments);
                    this.tooltipExit();
                };
            }
            else {
                var enter = this.enter;
                this.enter = function (domNode, element) {
                    this.tooltipEnter(element);
                    enter.apply(this, arguments);
                };
                var update = this.update;
                this.update = function (domNode, element) {
                    update.apply(this, arguments);
                    this.tooltipUpdate();
                };
                var exit = this.exit;
                this.exit = function (domNode, element) {
                    exit.apply(this, arguments);
                    this.tooltipExit();
                };
            }
        }
        return ITooltip;
    }(Widget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ITooltip;
    ITooltip.prototype.publish("tooltipStyle", "default", "set", "Style", ["default", "none"], {});
    ITooltip.prototype.publish("tooltipValueFormat", ",.2f", "string", "Value Format", null, {});
    ITooltip.prototype.publish("tooltipSeriesColor", "#EAFFFF", "html-color", "Series Color", null, {});
    ITooltip.prototype.publish("tooltipLabelColor", "#CCFFFF", "html-color", "Label Color", null, {});
    ITooltip.prototype.publish("tooltipValueColor", "white", "html-color", "Value Color", null, {});
    ITooltip.prototype.publish("tooltipTick", true, "boolean", "Show tooltip tick", null, {});
    ITooltip.prototype.publish("tooltipOffset", 8, "number", "Offset from the cursor", null, {});
    ITooltip.prototype.tooltipEnter = function (element) {
        var context = this;
        this.tooltip = d3Tip()
            .attr("class", "d3-tip")
            .offset(function (d) {
            switch (context.tooltip.direction()()) {
                case "e":
                    return [0, context.tooltipOffset()];
                default:
                    return [-context.tooltipOffset(), 0];
            }
        });
        element.call(this.tooltip);
    };
    ITooltip.prototype.tooltipUpdate = function () {
        var classed = this.tooltip.attr("class");
        classed = classed.split(" notick").join("") + (this.tooltipTick() ? "" : " notick") + (this.tooltipStyle() === "none" ? " hidden" : "");
        this.tooltip
            .attr("class", classed);
    };
    ITooltip.prototype.tooltipExit = function () {
        if (this.tooltip) {
            this.tooltip.destroy();
        }
    };
    var tooltipValueFormat = ITooltip.prototype.tooltipValueFormat;
    ITooltip.prototype.tooltipValueFormat = function (_) {
        var retVal = tooltipValueFormat.apply(this, arguments);
        if (arguments.length) {
            this._valueFormatter = d3.format(_);
        }
        return retVal;
    };
    ITooltip.prototype._tooltipHTML = function (d) {
        return d;
    };
    ITooltip.prototype.tooltipHTML = function (_) {
        return this.tooltip.html(_);
    };
    ITooltip.prototype.tooltipFormat = function (opts) {
        opts = opts || {};
        opts.label = opts.label || "";
        opts.series = opts.series || "";
        if (opts.value instanceof Date) {
            opts.value = opts.value || "";
        }
        else {
            opts.value = this._valueFormatter(opts.value) || "";
        }
        switch (this.tooltipStyle()) {
            case "none":
                break;
            default:
                if (opts.series) {
                    return "<span style='color:" + this.tooltipSeriesColor() + "'>" + opts.series + "</span> / <span style='color:" + this.tooltipLabelColor() + "'>" + opts.label + "</span>:  <span style='color:" + this.tooltipValueColor() + "'>" + opts.value + "</span>";
                }
                return "<span style='color:" + this.tooltipLabelColor() + "'>" + opts.label + "</span>:  <span style='color:" + this.tooltipValueColor() + "'>" + opts.value + "</span>";
        }
    };
});
//# sourceMappingURL=ITooltip.js.map