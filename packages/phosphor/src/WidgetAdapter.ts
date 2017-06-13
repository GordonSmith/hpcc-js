import { HTMLWidget, SVGWidget } from "@hpcc-js/common";
import { messaging, widgets } from "@hpcc-js/phosphor-lib";
import { select as d3Select } from "d3-selection";

import "../src/WidgetAdapter.css";

export class WidgetAdapter extends widgets.Widget {
    protected _element;
    _widget: HTMLWidget | SVGWidget;
    get widget() { return this._widget; }
    lparam: any = {};

    constructor(name: string, widget: HTMLWidget | SVGWidget, lparam: any = {}) {
        super();
        this._element = d3Select(this.node);
        // this.setFlag(Widget.Flag.DisallowLayout);
        this.addClass("phosphor_WidgetAdapter");
        // this.addClass(name.toLowerCase());
        this.title.label = name;
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

    protected onActivateRequest(msg: messaging.Message): void {
        if (this.isAttached) {
        }
    }
    protected onResize(msg: widgets.Widget.ResizeMessage): void {
        super.onResize(msg);
        if (msg.width < 0 || msg.height < 0) {
            // this._colChart.refresh();
        } else {

            d3Select(this.node)
                .style("width", msg.width + "px") //  adjust for padding
                .style("height", msg.height + "px") //  adjust for padding
                ;
            this._widget
                .resize({ width: msg.width - 20, height: msg.height - 20 })
                .render()
                ;
        }
    }
}
