import { Widget } from "./Widget";

export class WidgetArray extends Widget {
    static _class = "common_WidgetArray";

    constructor() {
        super();
    }

    target = function (target) {
        if (!target) {
            this.content_reset();
            this.exit();
        }
    };

    content: { (): Widget[]; (_): WidgetArray };
}
WidgetArray.prototype.publish("content", [], "widgetArray", "Widget Array");
