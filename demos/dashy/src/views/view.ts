import { Dashboard } from "../dashboard/dashboard";
import { Activity, ActivitySequence } from "./activities/activity";
import { DSPicker } from "./activities/dspicker";
import { Filters } from "./activities/filter";
import { GroupBy } from "./activities/groupby";
import { Limit } from "./activities/limit";
import { Sort } from "./activities/sort";

let viewID = 0;
export class View extends ActivitySequence {
    _dashboard: Dashboard;

    constructor(model: Dashboard, label: string = "View2") {
        super();
        this._dashboard = model;
        this.label(label);
        this._id = "v" + viewID++;
        this.dataSource(new DSPicker(this));
        this.dataSource().monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this.dataSource());
        });
        this.filters(new Filters(this).sourceActivity(this.dataSource()));
        this.groupBy(new GroupBy(this).sourceActivity(this.filters()));
        this.sort(new Sort(this).sourceActivity(this.groupBy()));
        this.limit(new Limit(this).sourceActivity(this.sort()));
        this.activities([
            this.dataSource(),
            this.filters(),
            this.groupBy(),
            this.sort(),
            this.limit()
        ]);
    }

    private calcUpdatedGraph(activity: Activity): Array<{ from: string, to: Activity }> {
        return activity.updatedBy().map(source => {
            return {
                from: source,
                to: activity
            };
        });
    }

    updatedByGraph(): Array<{ from: string, to: Activity }> {
        let retVal: Array<{ from: string, to: Activity }> = [];
        for (const activity of this.activities()) {
            retVal = retVal.concat(this.calcUpdatedGraph(activity));
        }
        return retVal;
    }

    fetch(from: number = 0, count: number = Number.MAX_VALUE): Promise<any[]> {
        return this.last().exec().then(() => {
            const data = this.last().pullData();
            return data.slice(from, from + count);
        });
    }
}
export interface View {
    label(): string;
    label(_: string): this;
    dataSource(): DSPicker;
    dataSource(_: DSPicker): this;
    filters(): Filters;
    filters(_: Filters): this;
    groupBy(): GroupBy;
    groupBy(_: GroupBy): this;
    sort(): Sort;
    sort(_: Sort): this;
    limit(): Limit;
    limit(_: Limit): this;
}
View.prototype.publish("label", null, "string", "Label");
View.prototype.publish("dataSource", null, "widget", "Data Source 2");
View.prototype.publish("filters", null, "widget", "Client Filters");
View.prototype.publish("groupBy", null, "widget", "Group By");
View.prototype.publish("sort", null, "widget", "Source Columns");
View.prototype.publish("limit", null, "widget", "Limit output");
