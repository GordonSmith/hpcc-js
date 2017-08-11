import { MultiChart } from "@hpcc-js/chart";
import { PropertyExt, Widget } from "@hpcc-js/common";
import { IDatasource } from "@hpcc-js/dgrid";
import { WUResult } from "../datasources/wuresult";
import { Model } from "../model";
import { View } from "../views/view";

export interface DDLViz {
    toIDatasource(): IDatasource;
    dataProps(): PropertyExt;
    vizProps(): PropertyExt;
    stateProps(): PropertyExt;

    refresh(): Promise<void>;
    monitor(func: (id: string, newVal: any, oldVal: any, source: PropertyExt) => void): {
        remove: () => void;
    };
}

export class State extends PropertyExt {
}
State.prototype._class += " State";
export interface State {
    selection(): object[];
    selection(_: object[]): this;
}
State.prototype.publish("selection", [], "array", "State");

let vizID = 0;

export class Viz extends PropertyExt implements DDLViz {

    constructor(model: Model, label: string = `Viz-${++vizID}`) {
        super();
        const view = new View(model, label);
        model.addView(view);
        this.view(view);
        const context = this;
        const widget = new MultiChart()
            .chartType("TABLE")
            .on("click", function (row, col, sel) {
                context.state().selection(sel ? [row] : []);
            })
            ;
        this.widget(widget);
        this.state(new State());

        view.monitor(async () => {
            this.refresh();
        });
    }

    toIDatasource(): IDatasource {
        return this.view();
    }

    dataProps(): PropertyExt {
        return this.view();
    }

    vizProps(): Widget {
        return this.widget();
    }

    stateProps(): PropertyExt {
        return this.state();
    }

    async refresh() {
        const view = this.view();
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
    }

    monitor(func: (id: string, newVal: any, oldVal: any, source: PropertyExt) => void): { remove: () => void; } {
        return this.view().monitor(func);
    }
}
Viz.prototype._class += " Viz";
export interface Viz {
    view(): View;
    view(_: View): this;
    widget(): Widget;
    widget(_: Widget): this;
    state(): State;
    state(_: State): this;
}
Viz.prototype.publish("view", null, "widget", "Data View");
Viz.prototype.publish("widget", null, "widget", "Visualization");
Viz.prototype.publish("state", null, "widget", "State");

export class WUResultViz extends Viz {
    constructor(model: Model, label?: string) {
        super(model, label);
        const datasource = new WUResult();
        model.addDatasource(datasource);
        this.view().dataSource().details(datasource);
        datasource.monitor((id, newVal, oldVal) => {
            this.view().broadcast(id, newVal, oldVal, datasource);
        });

    }
}
WUResultViz.prototype._class += " WUResultViz";
