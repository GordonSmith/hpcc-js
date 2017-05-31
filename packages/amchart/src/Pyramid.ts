import { I2DChart } from "@hpcc-js/api";
import { format as d3Format } from "d3-format";
import { CommonFunnel } from "./CommonFunnel";

export function Pyramid() {
    CommonFunnel.call(this);
    this._tag = "div";
}

Pyramid.prototype = Object.create(CommonFunnel.prototype);
Pyramid.prototype.constructor = Pyramid;
Pyramid.prototype._class += " amchart_Pyramid";
Pyramid.prototype.implements(I2DChart.prototype);

Pyramid.prototype.publish("paletteID", "default", "set", "Palette ID", Pyramid.prototype._palette.switch(), { tags: ["Basic", "Shared"] });

Pyramid.prototype.enter = function (domNode, element) {
    CommonFunnel.prototype.enter.apply(this, arguments);
};

Pyramid.prototype.updateChartOptions = function () {
    CommonFunnel.prototype.updateChartOptions.apply(this, arguments);
    const context = this;
    this._chart.balloonFunction = function (d) {
        if (context && context.tooltipValueFormat) {
            return d.title + ": " + d3Format(context.tooltipValueFormat())(d.value);
        }
    };
};

Pyramid.prototype.update = function (domNode, element) {
    CommonFunnel.prototype.update.apply(this, arguments);
};
