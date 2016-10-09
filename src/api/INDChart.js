define(["require", "exports", "../common/Palette"], function (require, exports, Palette_1) {
    "use strict";
    var INDChart = (function () {
        function INDChart() {
        }
        return INDChart;
    }());
    exports.INDChart = INDChart;
    INDChart.prototype._palette = Palette_1.ordinal("default");
    //  Events  ---
    INDChart.prototype.click = function (row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
    INDChart.prototype.dblclick = function (row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
});
//# sourceMappingURL=INDChart.js.map