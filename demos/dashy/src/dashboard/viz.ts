import { MultiChart } from "@hpcc-js/chart";
import { PropertyExt, Widget } from "@hpcc-js/common";
import { find } from "@hpcc-js/util";
import { Dashboard } from "../dashboard/dashboard";
import { View } from "../views/view";

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

    constructor(model: Dashboard, label: string = `Viz-${++vizID}`) {
        super();
        this.label(label);
        const view = new View(model, `View-${vizID}`);
        // model.addView(view);
        this.view(view);
        const context = this;
        const widget = new MultiChart()
            .chartType("TABLE")
            .on("click", function (row: object, col: string, sel: boolean) {
                context.state().selection(sel ? [row] : []);
            })
            ;
        this.widget(widget);
        this.state(new State());

        view.monitor(async () => {
            this.refresh();
        });
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
export interface Viz {
    label(): string;
    label(_: string): this;
    view(): View;
    view(_: View): this;
    widget(): Widget;
    widget(_: Widget): this;
    state(): State;
    state(_: State): this;
}
Viz.prototype.publish("label", "", "string", "Label");
Viz.prototype.publish("view", null, "widget", "Data View");
Viz.prototype.publish("widget", null, "widget", "Visualization");
Viz.prototype.publish("state", null, "widget", "State");
