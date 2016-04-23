"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Common2D"], factory);
    } else {
        root.plotly_Pie = factory(root.plotly_Common2D);
    }
}(this, function (Common2D) {
    function Pie(target) {
        Common2D.call(this);
    }
    Pie.prototype = Object.create(Common2D.prototype);
    Pie.prototype.constructor = Pie;
    Pie.prototype._class += " plotly_Pie";

    Pie.prototype.plotlyPublishTrace("pie");

    return Pie;
}));
