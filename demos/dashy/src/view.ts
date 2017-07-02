import { IDatasource, IField } from "@hpcc-js/api";
import { max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum } from "@hpcc-js/common";
import { PropertyExt, publish } from "@hpcc-js/common";
import { Databomb, LogicalFile, WUResult } from "./datasource";

const d3Aggr = {
    mean: d3Mean,
    median: d3Median,
    min: d3Min,
    max: d3Max,
    sum: d3Sum
};

export class GroupByColumn extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    columns() {
        return this._owner.fields().map(field => field.label);
    }

    aggregate(values) {
        switch (this.aggrType()) {
            case null:
            case undefined:
            case "":
                return values.length;
            default:
                const columns = this._owner.fields();
                const colIdx = columns.indexOf(this.aggrColumn());
                return d3Aggr[this.aggrType()](values, function (value) {
                    return +value[colIdx];
                });
        }
    }

    column: { (): string; (_: string): GroupByColumn; };
    aggrType: { (): string; (_: string): GroupByColumn; };
    aggrColumn: { (): string; (_: string): GroupByColumn; };

}
GroupByColumn.prototype._class += " GroupByColumn";

GroupByColumn.prototype.publish("column", null, "set", "Field", function () { return this.columns(); }, { optional: true });

export class View extends PropertyExt implements IDatasource {
    @publish(null, "widget", "View")
    datasource: { (): WUResult | LogicalFile | Databomb; (_: WUResult | LogicalFile | Databomb): View };

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn })
    groupBy: { (): GroupByColumn[]; (_: GroupByColumn[]): View; };

    refresh(): Promise<void> {
        return this.datasource().refresh();
    }

    label(): string {
        return `View\n${this.datasource().label()}`;
    }

    fields(): IField[] {
        return this.datasource().fields();
    }

    sample(samples: number, sampleSize: number): Promise<{ total: number, data: any[] }> {
        return this.datasource().sample(samples, sampleSize);
    }

    fetch(from: number, count: number): Promise<{ total: number, data: any[] }> {
        return this.datasource().fetch(from, count);
    }

    total(): number {
        return this.datasource().total();
    }
}
View.prototype._class += " View";
