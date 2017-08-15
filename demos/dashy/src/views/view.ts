import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Dashboard } from "../dashboard/dashboard";
import { Activity, ActivityArray } from "./activities/activity";
import { DSPicker } from "./activities/dspicker";
import { Filters } from "./activities/filter";
import { GroupBy } from "./activities/groupby";
import { Limit } from "./activities/limit";
import { Sort } from "./activities/sort";

let viewID = 0;
/*
export class View extends Activity {
    _dashboard: Dashboard;
    private _total = 0;

    constructor(model: Dashboard, label: string = "View") {
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
    }

    columns() {
        return (this.dataSource().outFields() as IField[]).map(field => {
            return field.id;
        });
    }

    field(fieldID: string): IField | null {
        for (const field of this.dataSource().outFields()) {
            if (field.id === fieldID) {
                return field;
            }
        }
        return null;
    }

    private calcUpdatedGraph(activity: Activity): Array<{ from: string, to: Activity }> {
        return activity.updatedBy().map(source => {
            return {
                from: source,
                to: activity
            };
        });
    }

    updatedByGraph() {
        return this.calcUpdatedGraph(this.dataSource())
            .concat(this.calcUpdatedGraph(this.filters()))
            ;
    }

    fetch(from: number = 0, count: number = Number.MAX_VALUE): Promise<any[]> {
        return this.limit().exec().then(() => {
            const data = this.limit().pullData();
            this._total = data.length;
            return data.slice(from, from + count);
        });
    }

    //  Activity overrides ---
    hash(more: { [key: string]: any } = {}): string {
        return hashSum({
            datasource: this.dataSource().hash(),
            filter: this.filters().hash(),
            groupBy: this.groupBy().hash(),
            sort: this.sort().hash(),
            limit: this.limit().hash(),
            ...more
        });
    }

    refreshMeta(): Promise<void> {
        return this.limit().refreshMeta();
    }

    updatedBy() {
        return this.dataSource().updatedBy()
            .concat(this.filters().updatedBy())
            .concat(this.groupBy().updatedBy())
            .concat(this.sort().updatedBy())
            .concat(this.limit().updatedBy())
            ;
    }

    outFields(): IField[] {
        return this.limit().outFields();
    }
}
View.prototype._class += " View";

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
*/

export class View extends ActivityArray {
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

    updatedByGraph() {
        let retVal = [];
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
