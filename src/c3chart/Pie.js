import { Common2D } from "./Common2D";

export function Pie(target) {
    Common2D.call(this);

    this._type = "pie";
}
Pie.prototype = Object.create(Common2D.prototype);
Pie.prototype.constructor = Pie;
Pie.prototype._class += " c3chart_Pie";

Pie.prototype.update = function (domNode, element) {
    Common2D.prototype.update.apply(this, arguments);
};

Pie.prototype.getChartOptions = function () {
    var chartOptions = Common2D.prototype.getChartOptions.apply(this, arguments);

    var data = this.data().map(function (row, idx) {
        return [row[0], row[1]];
    }, this);

    chartOptions.columns = data;

    return chartOptions;
};
