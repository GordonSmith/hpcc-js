import { MultiChart } from "@hpcc-js/chart";
import { PropertyExt, Widget } from "@hpcc-js/common";
import { IDatasource } from "@hpcc-js/dgrid";
import { WUResult } from "../datasources/wuresult";
import { Model } from "../model";
import { FlatView } from "../views/flatview";

export interface IActivity {
    toIDatasource(): IDatasource;
    toPropertyExt(): PropertyExt;
    toWidget(): PropertyExt;

    selection(): object[];
    selection(_: object[]): this;

    refresh(): Promise<void>;
    monitor(func: (id: string, newVal: any, oldVal: any, source: PropertyExt) => void): {
        remove: () => void;
    };
}

export class Viz extends PropertyExt implements IActivity {
    private _selection: object[] = [];

    constructor(model: Model, label: string = "Viz") {
        super();
        const view = new FlatView(model, label);
        model.addView(view);
        this.view(view);
        const context = this;
        const widget = new MultiChart()
            .chartType("TABLE")
            .on("click", function (row, col, sel) {
                context.selection(sel ? [row] : []);
            })
            ;
        this.widget(widget);

        view.monitor(async () => {
            await view.refresh();
            const columns = view.outFields().map(field => field.label);
            const data = await view.fetch();
            this.widget()
                .columns(columns)
                .data(data.map(row => {
                    const retVal = [];
                    for (const column of columns) {
                        retVal.push(row[column]);
                    }
                    return retVal;
                }))
                .lazyRender()
                ;
        });
    }

    toIDatasource(): IDatasource {
        return this.view();
    }

    toPropertyExt(): PropertyExt {
        return this;
    }

    toWidget(): Widget {
        return this.widget();
    }

    selection(): object[];
    selection(_: object[]): this;
    selection(_?: object[]): object[] | this {
        if (_ === void 0) return this._selection;
        this._selection = _;
        return this;
    }

    refresh(): Promise<void> {
        return this.view().refresh();
    }

    monitor(func: (id: string, newVal: any, oldVal: any, source: PropertyExt) => void): { remove: () => void; } {
        return this.view().monitor(func);
    }
}
Viz.prototype._class += " Viz";
export interface Viz {
    view(): FlatView;
    view(_: FlatView): this;
    widget(): Widget;
    widget(_: Widget): this;
}
Viz.prototype.publish("view", null, "widget", "Data View");
Viz.prototype.publish("widget", null, "widget", "Visualization");

export class WUResultViz extends Viz {
    constructor(model: Model, label: string = "Viz") {
        super(model, label);
        const datasource = new WUResult();
        model.addDatasource(datasource);
        this.source(datasource);
        this.view().source(datasource.id());
        datasource.monitor(() => {
        });
    }
}
WUResultViz.prototype._class += " WUResultViz";
export interface WUResultViz {
    source(): WUResult;
    source(_: WUResult): this;
}
WUResultViz.prototype.publish("source", new WUResult(), "widget", "Data Source");
