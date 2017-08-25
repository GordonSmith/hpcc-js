import { MultiChart } from "@hpcc-js/chart";
import { HTMLWidget, Widget } from "@hpcc-js/common";
import { Legend2 } from "@hpcc-js/other";
import { WidgetAdapter } from "@hpcc-js/phosphor";
import { BoxPanel as PBoxPanel, Widget as PWidget } from "@hpcc-js/phosphor-shim";
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

export class ChartPanel extends HTMLWidget implements IClickHandler {
    private _outerSplit = new PBoxPanel({ direction: "top-to-bottom" });
    private _bottomSplit = new PBoxPanel({ direction: "left-to-right" });
    private _rightSplit = new PBoxPanel({ direction: "top-to-bottom" });

    private _toggleLegend: ToggleButton = new ToggleButton(this, "fa-info").selected(true);
    private _buttonDownload: Button = new Button(this, "fa-download");
    private _titleBar = new TitleBar();
    private _titleWA = new WidgetAdapter(this, this._titleBar);

    private _chart = new MultiChart().chartType("COLUMN");
    private _chartWA = new WidgetAdapter(this, this._chart);

    private _description = new Summary();
    private _descriptionWA = new WidgetAdapter(this, this._description);

    private _legend = new Legend2();
    private _legendWA = new WidgetAdapter(this, this._legend);

    constructor() {
        super();
        this._tag = "div";
        this._outerSplit.id = "t" + this.id();
        this._bottomSplit.id = "l" + this.id();
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

        this._titleWA.addClass("title");
        this._chartWA.addClass("chart");
        this._descriptionWA.addClass("description");
        this._legendWA.addClass("legend");

        PBoxPanel.setStretch(this._titleWA, 0);
        PBoxPanel.setStretch(this._bottomSplit, 1);
        PBoxPanel.setStretch(this._rightSplit, 0);
        PBoxPanel.setStretch(this._chartWA, 1);
        PBoxPanel.setStretch(this._descriptionWA, 0);
        PBoxPanel.setStretch(this._legendWA, 1);

        this._rightSplit.addWidget(this._descriptionWA);
        this._rightSplit.addWidget(this._legendWA);

        this._bottomSplit.addWidget(this._chartWA);
        this._bottomSplit.addWidget(this._rightSplit);

        this._outerSplit.addWidget(this._titleWA);
        this._outerSplit.addWidget(this._bottomSplit);

        PWidget.attach(this._outerSplit, domNode);

        this._legend
            .targetWidget(this._chart)
            ;
    }

    update(domNode, element) {
        super.update(domNode, element);
        element.select(".p-Widget")
            .style("width", this.width() + "px")
            .style("height", this.height() + "px")
            ;
        this._rightSplit.fit();
        //        this._outerSplit.update();
        this._legend.dataFamily(this._chart.getChartDataFamily());
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    // IClickHandler  ---
    titleBarClick(src: Item, d, idx: number, groups): void {
        switch (src) {
            case this._toggleLegend:
                if (this._toggleLegend.selected()) {
                    this._bottomSplit.addWidget(this._rightSplit);
                } else {
                    this._rightSplit.parent = null;
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
ChartPanel.prototype.publishProxy("description", "_description", "text");
ChartPanel.prototype.publish("multiChart", null, "widget", "Multi Chart");
