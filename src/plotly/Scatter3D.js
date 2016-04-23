"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Common3D"], factory);
    } else {
        root.plotly_Scatter3D = factory(root.plotly_Common3D);
    }
}(this, function (Common3D) {
    function Scatter3D(target) {
        Common3D.call(this);
    }
    Scatter3D.prototype = Object.create(Common3D.prototype);
    Scatter3D.prototype.constructor = Scatter3D;
    Scatter3D.prototype._class += " plotly_Scatter3D";

    Scatter3D.prototype.plotlyPublishTrace("scatter3d");

    return Scatter3D;
}));
