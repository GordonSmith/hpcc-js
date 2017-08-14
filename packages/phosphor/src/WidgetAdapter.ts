import { Widget as CWidget } from "@hpcc-js/common";
import { ConflatableMessage, Message, MessageLoop, Widget as PWidget } from "@hpcc-js/phosphor-shim";
import { select as d3Select } from "d3-selection";

import "../src/WidgetAdapter.css";

export namespace Msg {
    export class WAActivateRequest extends ConflatableMessage {
        private _wa: WidgetAdapter;

        constructor(wa: WidgetAdapter) {
            super("wa-activate-request");
            this._wa = wa;
        }
        get wa(): WidgetAdapter {
            return this._wa;
        }

        conflate(other: WAActivateRequest): boolean {
            this._wa = other.wa;
            return true;
        }
    }
}

export class WidgetAdapter extends PWidget {
    protected _owner;
    protected _element;
    _widget: CWidget;
    get widget() { return this._widget; }
    lparam: any = {};
    padding: number = 0;

    constructor(owner: CWidget, widget: CWidget, lparam: object = {}) {
        super();
        this._owner = owner;
        this._element = d3Select(this.node);
        // this.setFlag(Widget.Flag.DisallowLayout);
        this.addClass("phosphor_WidgetAdapter");
        // this.addClass(name.toLowerCase());
        this.title.label = "";
        this.title.closable = false;
        this.title.caption = `Long description for: ${name}`;

        this._widget = widget
            .target(this.node)
            ;
        this.lparam = lparam;
    }

    get inputNode(): HTMLInputElement {
        return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this._widget
            .lazyRender()
            ;
        MessageLoop.postMessage(this._owner, new Msg.WAActivateRequest(this));
    }

    protected onResize(msg: PWidget.ResizeMessage): void {
        super.onResize(msg);
        if (msg.width >= 0 && msg.height >= 0) {
            d3Select(this.node)
                .style("padding", this.padding + "px")
                .style("width", msg.width + "px")
                .style("height", msg.height + "px")
                ;
            this._widget
                .resize({ width: msg.width - this.padding * 2 - 2, height: msg.height - this.padding * 2 - 2 })
                .lazyRender()
                ;
        }
    }
}
