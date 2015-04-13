"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./CommonND"], factory);
    } else {
        root.C3_Step = factory(root.C3_CommonND);
    }
}(this, function (CommonND) {
    function Step(target) {
        CommonND.call(this);
        this._class = "c3_Step";

        this._type = "step";
    };
    Step.prototype = Object.create(CommonND.prototype);

    return Step;
}));
