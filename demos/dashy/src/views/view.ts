import { publish } from "@hpcc-js/common";
import { Dashboard } from "../dashboard/dashboard";
import { Activity, ActivitySequence } from "./activities/activity";
import { DSPicker, Type } from "./activities/dspicker";
import { Filters } from "./activities/filter";
import { GroupBy } from "./activities/groupby";
import { Limit } from "./activities/limit";
import { Project } from "./activities/project";
import { Sort } from "./activities/sort";

export { Type as DatasourceType };

let viewID = 0;
export class View extends ActivitySequence {
    _dashboard: Dashboard;

    @publish(null, "widget", "Data Source 2")
    dataSource: publish<this, DSPicker>;
    @publish(null, "widget", "Client Filters")
    filters: publish<this, Filters>;
    @publish(null, "widget", "Project")
    project: publish<this, Project>;
    @publish(null, "widget", "Group By")
    groupBy: publish<this, GroupBy>;
    @publish(null, "widget", "Source Columns")
    sort: publish<this, Sort>;
    @publish(null, "widget", "Mappings")
    mappings: publish<this, Project>;
    @publish(null, "widget", "Limit output")
    limit: publish<this, Limit>;

    constructor(model: Dashboard, label: string = "View2") {
        super();
        this._dashboard = model;
        //        this.label(label);
        this._id = "v" + viewID++;
        this.dataSource(new DSPicker(this));
        this.dataSource().monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this.dataSource());
        });
        this.filters(new Filters(this));
        this.project(new Project(this));
        this.groupBy(new GroupBy(this));
        this.sort(new Sort(this));
        this.limit(new Limit(this));
        this.mappings(new Project(this));
        this.activities([
            this.dataSource(),
            this.filters(),
            this.project(),
            this.groupBy(),
            this.sort(),
            this.limit(),
            this.mappings()
        ]);

        let prevActivity: Activity;
        for (const activity of this.activities()) {
            if (prevActivity) {
                activity.sourceActivity(prevActivity);
            }
            prevActivity = activity;
        }
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
