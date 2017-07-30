import { Widget } from "./Widget";
import { PropertyExt } from "./PropertyExt";

export class WidgetArray extends PropertyExt {

    constructor() {
        super();
    }

    content: { (): Widget[]; (_): WidgetArray };
}
WidgetArray.prototype._class += " common_WidgetArray";

WidgetArray.prototype.publish("content", [], "widgetArray", "Widget Array");

