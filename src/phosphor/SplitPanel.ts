import { SplitPanel as PSplitPanel, Widget as PWidget } from "@phosphor/widgets";
import { Column } from "../chart/Column";
import { DDLEditor } from "../codemirror/DDLEditor";
import { HTMLWidget } from "../common/HTMLWidget";
import { Widget } from "../common/Widget";
import { WidgetAdapter } from "./WidgetAdapter";

import "@phosphor/widgets/style/index.css";
import "./DockPanel.css";

export class SplitPanel extends HTMLWidget {
    protected _dock = new PSplitPanel({ orientation: "vertical" });

    constructor() {
        super();
        this._dock.id = "p" + this.id();
        this._tag = "div";
        this.content([]);
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        const w1 = new WidgetAdapter("DDL", DDLEditor);
        w1.viz.ddl([{}]);
        const w2 = new WidgetAdapter("Column A", Column);
        const w3 = new WidgetAdapter("Column B", Column);
        const w4 = new WidgetAdapter("Column C", Column);
        const w5 = new WidgetAdapter("Column D", Column);
        this._dock.addWidget(w1);
        this._dock.addWidget(w2);
        this._dock.addWidget(w3);
        this._dock.addWidget(w4);
        this._dock.addWidget(w5);
        PWidget.attach(this._dock, domNode);
    }

    update(domNode, element) {
        super.update(domNode, element);
        element.select(".p-Widget")
            .style("width", this.width() + "px")
            .style("height", this.height() + "px")
            ;
        console.log(`Size:  ${this.width()},${this.height()} `);
        this._dock.update();
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    content: { (): Widget[]; (_: Widget[]): SplitPanel; };
}
SplitPanel.prototype._class += " phosphor_DockPanel";

SplitPanel.prototype.publish("content", [], "widgetArray", "widgets", null, { tags: ["Basic"], render: false });
