define(["require", "exports"], function (require, exports) {
    "use strict";
    var IList = (function () {
        function IList() {
        }
        return IList;
    }());
    exports.IList = IList;
    //  Properties  ---
    //  Events  ---
    IList.prototype.click = function (d) {
        console.log("Click:  " + d);
    };
    IList.prototype.dblclick = function (d) {
        console.log("Double click:  " + d);
    };
});
//# sourceMappingURL=IList.js.map