import { HTMLWidget, Widget } from "@hpcc-js/common";
import { DockPanel as PDockPanel, IMessageHandler, IMessageHook, Message, MessageLoop, Widget as PWidget } from "@hpcc-js/phosphor-shim";
import { Msg, WidgetAdapter } from "./WidgetAdapter";

import "../src/DockPanel.css";

export class DockPanelBase extends HTMLWidget implements IMessageHandler, IMessageHook {
    private _dock = new PDockPanel({ mode: "multiple-document" });
    protected content: WidgetAdapter[] = [];

    constructor() {
        super();
        this._tag = "div";
        this._dock.id = "p" + this.id();
        MessageLoop.installMessageHook(this, this);
    }

    protected getWidgetAdapter(widget: Widget): WidgetAdapter | null {
        let retVal = null;
        this.content.some(wa => {
            if (wa.widget === widget) {
                retVal = wa;
                return true;
            }
            return false;
        });
        return retVal;
    }

    addWidget(widget: Widget, title: string, location: PDockPanel.InsertMode = "split-right", refWidget?: Widget) {
        const addMode: PDockPanel.IAddOptions = { mode: location, ref: this.getWidgetAdapter(refWidget) };
        const wa = new WidgetAdapter(this, widget);
        wa.title.label = title;
        wa.padding = 8;
        this._dock.addWidget(wa, addMode);
        this.content.push(wa);
        return this;
    }

    removeWidget(widget: Widget) {
        const wa = this.getWidgetAdapter(widget);
        if (wa) {
            wa.dispose();
        }
        return this;
    }

    isVisible(widget: Widget) {
        return this.getWidgetAdapter(widget).isVisible;
    }

    widgets(): Widget[] {
        return this.content.map(wa => wa._widget);
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        PWidget.attach(this._dock, domNode);
    }

    update(domNode, element) {
        super.update(domNode, element);
        element.select(".p-Widget")
            .style("width", this.width() + "px")
            .style("height", this.height() + "px")
            ;
        this._dock.update();
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    //  Phosor Messaging  ---
    messageHook(handler: IMessageHandler, msg: Message): boolean {
        if (handler === this) {
            this.processMessage(msg);
        }
        return true;
    }

    processMessage(msg: Message): void {
        switch (msg.type) {
            case "wa-activate-request":
                this.childActivation((msg as Msg.WAActivateRequest).wa.widget);
                break;
        }
    }

    childActivation(w: Widget) {
    }
}
DockPanelBase.prototype._class += " phosphor_DockPanel";
export interface DockPanelBase {
    layout(): object;
    layout(_: object): this;
}
DockPanelBase.prototype.publish("layout", "", "object");
