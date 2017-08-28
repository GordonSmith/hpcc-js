import { MultiChart } from "@hpcc-js/chart";
import { HTMLWidget, Widget } from "@hpcc-js/common";
import { Border2 } from "@hpcc-js/layout";
import { Legend2 } from "@hpcc-js/other";
import { Button, IClickHandler, Item, Spacer, TitleBar, ToggleButton } from "./TitleBar";

import "../src/ChartPanel.css";

class Summary extends HTMLWidget {

    constructor() {
        super();
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        element.append("p");
    }

    update(domNode, element) {
        super.update(domNode, element);
        element.select("p").text(this.text());
    }
}
interface Summary {
    text(): string;
    text(_: string): this;
}
Summary.prototype.publish("text", "", "string");

export class ChartPanel extends Border2 implements IClickHandler {

    private _toggleLegend: ToggleButton = new ToggleButton(this, "fa-info").selected(true);
    private _buttonDownload: Button = new Button(this, "fa-download");

    private _titleBar = new TitleBar();

    private _chart = new MultiChart().chartType("COLUMN");

    private _description = new Summary();

    private _legend = new Legend2();

    constructor() {
        super();
        this._tag = "div";
        this._titleBar.buttons([this._buttonDownload, new Spacer(this), this._toggleLegend]);
        this.multiChart(this._chart);

        const context = this;
        this._chart.click = function () {
            context.click.apply(context, arguments);
        };
        this._chart.dblclick = function () {
            context.dblclick.apply(context, arguments);
        };
        this._chart.vertex_click = function () {
            context.vertex_click.apply(context, arguments);
        };
        this._chart.vertex_dblclick = function () {
            context.vertex_dblclick.apply(context, arguments);
        };
        this._chart.edge_click = function () {
            context.edge_click.apply(context, arguments);
        };
        this._chart.edge_dblclick = function () {
            context.edge_dblclick.apply(context, arguments);
        };
    }

    chartType(): string;
    chartType(_: string): this;
    chartType(_?: string): string | this {
        if (!arguments.length) return this._chart.chartType();
        this._chart.chartType(_);
        return this;
    }

    columns(): string[];
    columns(_: string[], asDefault?: boolean): this;
    columns(_?: string[], asDefault?: boolean): string[] | this {
        if (!arguments.length) return this._chart.columns();
        this._chart.columns(_, asDefault);
        return this;
    }

    data(_?) {
        if (!arguments.length) return this._chart.data();
        this._chart.data(_);
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);

        this.top(this._titleBar);
        this.center(this._chart);
        this.right(this._legend);

        this._legend
            .targetWidget(this._chart)
            .orientation("vertical")
            .title("")
            ;
    }

    update(domNode, element) {
        super.update(domNode, element);
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    // IClickHandler  ---
    titleBarClick(src: Item, d, idx: number, groups): void {
        switch (src) {
            case this._toggleLegend:
                if (this._toggleLegend.selected()) {
                    this._legend.visible(true);
                } else {
                    this._legend.visible(false);
                }
                this.render();
                break;
        }
    }

    //  Event Handlers  ---
    //  Events  ---
    click(row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    }

    dblclick(row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    }
    vertex_click(row, col, sel, more) {
        if (more && more.vertex) {
            console.log("Vertex click: " + more.vertex.id());
        }
    }

    vertex_dblclick(row, col, sel, more) {
        if (more && more.vertex) {
            console.log("Vertex double click: " + more.vertex.id());
        }
    }

    edge_click(row, col, sel, more) {
        if (more && more.edge) {
            console.log("Edge click: " + more.edge.id());
        }
    }

    edge_dblclick(row, col, sel, more) {
        if (more && more.edge) {
            console.log("Edge double click: " + more.edge.id());
        }
    }
}
ChartPanel.prototype._class += " composite_ChartPanel";

export interface ChartPanel {
    title(): string;
    title(_: string): this;
    multiChart(): Widget;
    multiChart(_: Widget): this;
}
ChartPanel.prototype.publishProxy("title", "_titleBar");
ChartPanel.prototype.publishProxy("description", "_description", "text");
ChartPanel.prototype.publish("multiChart", null, "widget", "Multi Chart");
