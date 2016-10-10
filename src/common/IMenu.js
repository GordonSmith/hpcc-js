define(["require", "exports"], function (require, exports) {
    "use strict";
    var IMenu = (function () {
        function IMenu() {
        }
        return IMenu;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = IMenu;
    //  Properties  ---
    //  Events  ---
    IMenu.prototype.click = function (d) {
        console.log("Click:  " + d);
    };
    IMenu.prototype.preShowMenu = function () {
        console.log("preShowMenu");
    };
    IMenu.prototype.postHideMenu = function (d) {
        console.log("postHideMenu");
    };
});
//# sourceMappingURL=IMenu.js.map