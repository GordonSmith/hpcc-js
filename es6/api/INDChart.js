import { ordinal } from "../common/Palette"

export default class INDChart {
}
INDChart.prototype._palette = ordinal("default");

//  Events  ---
INDChart.prototype.click = function (row, column, selected) {
    console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
};

INDChart.prototype.dblclick = function (row, column, selected) {
    console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
};
