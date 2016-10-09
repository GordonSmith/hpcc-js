define(["require", "exports"], function (require, exports) {
    "use strict";
    var I1DChart = (function () {
        function I1DChart() {
        }
        return I1DChart;
    }());
    exports.I1DChart = I1DChart;
    I1DChart.prototype._palette = Palette.rainbow("default");
    //  Events  ---
    I1DChart.prototype.click = function (row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
    I1DChart.prototype.dblclick = function (row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
});
//# sourceMappingURL=I1DChart.js.map