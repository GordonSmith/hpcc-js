"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Widget"], factory);
    } else {
        root.common_WidgetArray = factory(root.common_Widget);
    }
}(this, function (Widget) {
    function WidgetArray() {
        Widget.call(this);
    }
    WidgetArray.prototype = Object.create(Widget.prototype);
    WidgetArray.prototype._class += " common_WidgetArray";

    WidgetArray.prototype.publish("content", [], "widgetArray", "Widget Array");

    return WidgetArray;
}));
