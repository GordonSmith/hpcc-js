import { MultiChart } from "@hpcc-js/chart";
import { HTMLWidget, Text, Widget } from "@hpcc-js/common";
import { Button, IClickHandler, Item, Spacer, TitleBar, ToggleButton } from "@hpcc-js/html";
import { WidgetAdapter } from "@hpcc-js/phosphor";
import { BoxPanel as PBoxPanel, SplitPanel as PSplitPanel, Widget as PWidget } from "@hpcc-js/phosphor-shim";

import "../src/ChartPanel.css";

export class ChartPanel extends HTMLWidget implements IClickHandler {
    private _titleSplit = new PBoxPanel({ direction: "top-to-bottom" });
    private _legendSplit = new PSplitPanel({ orientation: "horizontal" });
    private _titleBar = new TitleBar();
    private _toggleLegend: ToggleButton = new ToggleButton(this, "fa-info").selected(false);
    private _buttonDownload: Button = new Button(this, "fa-download");
    private _legendWA = new WidgetAdapter(this, new Text().text("Legend"));
    private _chart = new MultiChart().chartType("COLUMN");

    constructor() {
        super();
        this._tag = "div";
        this._titleSplit.id = "t" + this.id();
        this._legendSplit.id = "l" + this.id();
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

        const titleWA = new WidgetAdapter(this, this._titleBar);
        titleWA.addClass("title");
        this._legendWA.addClass("legend");
        const chartWA = new WidgetAdapter(this, this._chart);
        chartWA.addClass("chart");

        PBoxPanel.setStretch(titleWA, 0);
        PBoxPanel.setStretch(this._legendSplit, 1);

        this._legendSplit.addWidget(chartWA);

        this._titleSplit.addWidget(titleWA);
        this._titleSplit.addWidget(this._legendSplit);

        PWidget.attach(this._titleSplit, domNode);
    }

    update(domNode, element) {
        super.update(domNode, element);
        element.select(".p-Widget")
            .style("width", this.width() + "px")
            .style("height", this.height() + "px")
            ;
        this._titleSplit.update();
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    // IClickHandler  ---
    titleBarClick(src: Item, d, idx: number, groups): void {
        switch (src) {
            case this._toggleLegend:
                if (this._toggleLegend.selected()) {
                    this._legendSplit.addWidget(this._legendWA);
                } else {
                    this._legendWA.parent = null;
                }
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
ChartPanel.prototype.publish("multiChart", null, "widget", "Multi Chart");
