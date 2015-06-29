"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.common_IMenu = factory();
    }
}(this, function () {
    /**
     * @interface common_IMenu
     *
     */
    function IMenu() {
    }

    //  Data ---
    /**
     * Populates Data and Columns with test data.
     * @method testData
     * @memberof common_IMenu
     * @instance
     * @returns {Widget}
     */
    IMenu.prototype.testData = function () {
        var data = ["This", "is a", "list", "of some text."];
        this.data(data);
        return this;
    };

    //  Events  ---
    /**
     * @method Overridable click callback function.
     * @memberof common_IMenu
     * @param {type} row
     * @param {type} column
     * @returns {undefined}
     */
    IMenu.prototype.click = function (d) {
        console.log("Click:  " + d);
    };
    IMenu.prototype.preShowMenu = function () {
        console.log("preShowMenu");
    };
    IMenu.prototype.postHideMenu = function (d) {
        console.log("postHideMenu");
    };

    return IMenu;
}));
