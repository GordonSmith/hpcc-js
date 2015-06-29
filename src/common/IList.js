"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.common_IList = factory();
    }
}(this, function () {
    /**
     * @interface common_IList
     * @class common_IList
     *
     */
    function IList() {
    }

    //  Data ---
    /**
     * Populates Data and Columns with test data.
     * @method testData
     * @memberof common_IList
     * @instance
     * @returns {Widget}
     */
    IList.prototype.testData = function () {
        var data = ["This", "is a", "list", "of some text."];
        this.data(data);
        return this;
    };

    //  Properties  ---

    //  Events  ---
    /**
     * @method Overridable click callback function.
     * @memberof common_IList
     * @param {type} row
     * @param {type} column
     * @returns {undefined}
     */
    IList.prototype.click = function (d) {
        console.log("Click:  " + d);
    };

    return IList;
}));
