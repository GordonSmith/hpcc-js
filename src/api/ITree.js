define(["require", "exports", "../common/Palette"], function (require, exports, Palette_1) {
    "use strict";
    var ITree = (function () {
        function ITree() {
        }
        return ITree;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ITree;
    ITree.prototype._palette = Palette_1.ordinal("default");
    //  Events  ---
    ITree.prototype.click = function (row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
    ITree.prototype.dblclick = function (row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
});
//# sourceMappingURL=ITree.js.map