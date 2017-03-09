import { format as d3Format } from "d3-format";
import { tip } from "d3-tip";

import { Widget } from "../common/Widget";
import "css!./ITooltip.css";

export function ITooltip() {
    Widget.call(this);

    this._valueFormatter = d3Format(this.tooltipValueFormat());

    if (this.layerEnter) {
        var layerEnter = this.layerEnter;
        this.layerEnter = function (_base, svgElement, _domElement) {
            this.tooltipEnter(svgElement);
            layerEnter.apply(this, arguments);
        };
        var layerUpdate = this.layerUpdate;
        this.layerUpdate = function (_base) {
            layerUpdate.apply(this, arguments);
            this.tooltipUpdate();
        };
        var layerExit = this.layerExit;
        this.layerExit = function (_base) {
            layerExit.apply(this, arguments);
            this.tooltipExit();
        };
    } else {
        var enter = this.enter;
        this.enter = function (_domNode, element) {
            this.tooltipEnter(element);
            enter.apply(this, arguments);
        };
        var update = this.update;
        this.update = function (_domNode, _element) {
            update.apply(this, arguments);
            this.tooltipUpdate();
        };
        var exit = this.exit;
        this.exit = function (_domNode, _element) {
            exit.apply(this, arguments);
            this.tooltipExit();
        };
    }
}
ITooltip.prototype = Object.create(Widget.prototype);

ITooltip.prototype.publish("tooltipStyle", "default", "set", "Style", ["default", "none"], {});
ITooltip.prototype.publish("tooltipValueFormat", ",.2f", "string", "Value Format", null, {});
ITooltip.prototype.publish("tooltipSeriesColor", "#EAFFFF", "html-color", "Series Color", null, {});
ITooltip.prototype.publish("tooltipLabelColor", "#CCFFFF", "html-color", "Label Color", null, {});
ITooltip.prototype.publish("tooltipValueColor", "white", "html-color", "Value Color", null, {});
ITooltip.prototype.publish("tooltipTick", true, "boolean", "Show tooltip tick", null, {});
ITooltip.prototype.publish("tooltipOffset", 8, "number", "Offset from the cursor", null, {});

ITooltip.prototype.tooltipEnter = function (element) {
    var context = this;
    this.tooltip = tip()
        .attr("class", "d3-tip")
        .offset(function () {
            switch (context.tooltip.direction()()) {
                case "e":
                    return [0, context.tooltipOffset()];
                default:
                    return [-context.tooltipOffset(), 0];
            }
        })
        ;
    element.call(this.tooltip);
};

ITooltip.prototype.tooltipUpdate = function () {
    var classed = this.tooltip.attr("class");
    classed = classed.split(" notick").join("") + (this.tooltipTick() ? "" : " notick") + (this.tooltipStyle() === "none" ? " hidden" : "");
    this.tooltip
        .attr("class", classed)
        ;
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
        this._valueFormatter = d3Format(_);
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
    } else {
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
