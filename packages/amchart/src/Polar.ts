import { INDChart } from "@hpcc-js/api";
import "amcharts3/amcharts/radar";
import { CommonRadar } from "./CommonRadar";

import "../src/Area.css";

export function Polar() {
    CommonRadar.call(this);
    this._tag = "div";
    this._gType = "column";
}
Polar.prototype = Object.create(CommonRadar.prototype);
Polar.prototype.constructor = Polar;
Polar.prototype._class += " amchart_Polar";
Polar.prototype.implements(INDChart.prototype);

Polar.prototype.publish("paletteID", "default", "set", "Palette ID", Polar.prototype._palette.switch(), { tags: ["Basic", "Shared"] });

Polar.prototype.enter = function (domNode, element) {
    CommonRadar.prototype.enter.apply(this, arguments);
};

Polar.prototype.updateChartOptions = function () {
    CommonRadar.prototype.updateChartOptions.apply(this, arguments);

    this.buildGraphs(this._gType);

    return this._chart;
};

Polar.prototype.buildGraphs = function (gType) {
    this._chart.graphs = [];

    for (let i = 0; i < this.columns().length - 1; i++) {
        const gRetVal = CommonRadar.prototype.buildGraphObj.call(this, gType, i);
        const gObj = buildGraphObj.call(this, gRetVal, this._valueField[i], i);

        this._chart.addGraph(gObj);
    }

    function buildGraphObj(gObj, valueField) {
        gObj.valueField = valueField;
        return gObj;
    }
};

Polar.prototype.update = function (domNode, element) {
    CommonRadar.prototype.update.apply(this, arguments);
    this.updateChartOptions();

    this._chart.validateNow();
    this._chart.validateData();
};
