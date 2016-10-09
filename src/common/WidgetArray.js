var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Widget"], function (require, exports, Widget_1) {
    "use strict";
    var WidgetArray = (function (_super) {
        __extends(WidgetArray, _super);
        function WidgetArray() {
            _super.call(this);
        }
        return WidgetArray;
    }(Widget_1.Widget));
    exports.WidgetArray = WidgetArray;
    WidgetArray.prototype._class += " common_WidgetArray";
    WidgetArray.prototype.publish("content", [], "widgetArray", "Widget Array");
    WidgetArray.prototype.target = function (target) {
        if (!target) {
            this.content_reset();
            this.exit();
        }
    };
});
//# sourceMappingURL=WidgetArray.js.map