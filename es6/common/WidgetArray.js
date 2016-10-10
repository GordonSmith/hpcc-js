import Widget from "./Widget"

export default class WidgetArray extends Widget {
    constructor() {
        super();
    }
}
WidgetArray.prototype._class += " common_WidgetArray";

WidgetArray.prototype.publish("content", [], "widgetArray", "Widget Array");

WidgetArray.prototype.target = function (target) {
    if (!target) {
        this.content_reset();
        this.exit();
    }
};
