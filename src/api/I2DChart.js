define(["require", "exports", "../common/Palette"], function (require, exports, Palette_1) {
    "use strict";
    var I2DChart = (function () {
        function I2DChart() {
        }
        return I2DChart;
    }());
    exports.I2DChart = I2DChart;
    I2DChart.prototype._palette = Palette_1.ordinal("default");
    //  Events  ---
    I2DChart.prototype.click = function (row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
    I2DChart.prototype.dblclick = function (row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
});
//# sourceMappingURL=I2DChart.js.map