import { IDatasource, IField } from "@hpcc-js/api";
import { max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, nest as d3Nest, sum as d3Sum } from "@hpcc-js/common";
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
        return this._owner.datasource().fields().map(field => field.label);
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
        const retVal: IField[] = [];
        let currField: IField[] = retVal;
        for (const groupBy of this.groupBy()) {
            if (groupBy.column()) {
                const field: IField = {
                    label: "key",
                    type: "array",
                    children: null
                };
                currField.push(field);
                const values: IField = {
                    label: "values",
                    type: "array",
                    children: []
                };
                currField.push(values);
                currField = values.children;
            }
        }
        currField.push(...this.datasource().fields());
        return retVal;
    }

    sample(samples: number, sampleSize: number): Promise<{ total: number, data: any[] }> {
        return this.datasource().sample(samples, sampleSize);
    }

    fetch(from: number, count: number): Promise<{ total: number, data: any[] }> {
        return this.datasource().sample(10, 100).then(response => {
            const nest = d3Nest();
            for (const groupBy of this.groupBy()) {
                if (groupBy.column()) {
                    nest.key(d => d[groupBy.column()]);
                }
            }
            const data = nest.entries(response.data);
            return {
                total: data.length,
                data
            };
        });
    }

    total(): number {
        return this.datasource().total();
    }
}
View.prototype._class += " View";
