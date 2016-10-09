import { ordinal } from "../common/Palette"

export class I2DChart {
}
I2DChart.prototype._palette = ordinal("default");

//  Events  ---
I2DChart.prototype.click = function (row, column, selected) {
    console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
};

I2DChart.prototype.dblclick = function (row, column, selected) {
    console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
};
