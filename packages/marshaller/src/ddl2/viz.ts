import { PropertyExt, publish, publishProxy, Widget } from "@hpcc-js/common";
import { ChartPanel } from "@hpcc-js/composite";
import { Form } from "@hpcc-js/form";
import { find } from "@hpcc-js/util";
import { View } from "./activities/view";
import { Dashboard } from "./dashboard";

export class State extends PropertyExt {

    removeInvalid(data: object[]) {
        const newSelection: object[] = [];
        for (const selRow of this.selection()) {
            if (find(data, (row: { [key: string]: any }, index): boolean => {
                for (const column in selRow) {
                    if (selRow[column] !== row[column]) {
                        return false;
                    }
                }
                return true;
            })) {
                newSelection.push(selRow);
            }
        }
        this.selection(newSelection);
    }
}
State.prototype._class += " State";
export interface State {
    selection(): Array<{ [key: string]: any }>;
    selection(_: Array<{ [key: string]: any }>): this;
}
State.prototype.publish("selection", [], "array", "State");

let vizID = 0;
export class Viz extends PropertyExt {
    private _chartPanel: ChartPanel = new ChartPanel();

    @publishProxy("_chartPanel")
    title: publish<this, string>;
    @publish(null, "widget", "Data View")
    view: publish<this, View>;
    @publish(null, "widget", "Visualization")
    widget: publish<this, ChartPanel | Form>;
    @publish(null, "widget", "State")
    state: publish<this, State>;

    constructor(model: Dashboard) {
        super();
        vizID++;
        this._id = `viz-${vizID}`;
        const view = new View(model, `view-${vizID}`);
        this.view(view);
        this._chartPanel
            .title(this.id())
            .chartType("TABLE")
            .on("click", (row: object, col: string, sel: boolean) => {
                this.state().selection(sel ? [row] : []);
            })
            ;
        this.widget(this._chartPanel);
        this.state(new State());
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
        await view.refreshMeta();
        const columns = view.outFields().map(field => field.label);
        const data = await view.fetch();
        const mappedData = data.map(row => {
            const retVal = [];
            for (const column of columns) {
                retVal.push(row[column]);
            }
            return retVal;
        });
        this.widget()
            .columns(columns)
            .data(mappedData)
            .lazyRender()
            ;
        this.state().removeInvalid(data);
    }

    monitor(func: (id: string, newVal: any, oldVal: any, source: PropertyExt) => void): { remove: () => void; } {
        return this.view().monitor(func);
    }
}
Viz.prototype._class += " Viz";
