import { PropertyExt, publish } from "@hpcc-js/common";
import { deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, nest as d3Nest, sum as d3Sum, variance as d3Variance } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Databomb, LogicalFile, WUResult } from "./datasource";

function count(leaves: any[], callback: any): number {
    return leaves.length;
}

const d3Aggr = {
    count,
    min: d3Min,
    max: d3Max,
    mean: d3Mean,
    median: d3Median,
    variance: d3Variance,
    deviation: d3Deviation,
    sum: d3Sum
};

export class ComputedField extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    columns() {
        return this._owner.columns();
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

    @publish(null, "string", "Label", null, { optional: true, disable: (w) => !w._owner.column() })
    label: { (): string; (_: string): ComputedField; };
    @publish("mean", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() })
    aggrType: { (): string; (_: string): ComputedField; };
    @publish(null, "set", "Aggregation Field", function () { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() })
    aggrColumn: { (): string; (_: string): ComputedField; };
}
ComputedField.prototype._class += " CalcField";

export class GroupByColumn extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    columns() {
        return this._owner.columns();
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

    @publish(undefined, "set", "Field", function () { return this.columns(); }, { optional: true })
    column: { (): string; (_: string): GroupByColumn; };

    /*
        @publish([], "propertyArray", "Computed Fields", null, {
            autoExpand: ComputedField, disable: w => {
                const groups = w._owner.groupBy();
                return groups.indexOf(w) !== groups.length - 1;
            }
        })
        computedFields: { (): ComputedField[]; (_: ComputedField[]): GroupByColumn; };
    */

    aggrType: { (): string; (_: string): GroupByColumn; };
    aggrColumn: { (): string; (_: string): GroupByColumn; };

}
GroupByColumn.prototype._class += " GroupByColumn";

export class View extends PropertyExt implements IDatasource {
    @publish(10, "number", "Number of samples")
    samples: { (): number; (_: number): View; };
    @publish(100, "number", "Sample size")
    sampleSize: { (): number; (_: number): View; };

    @publish(null, "widget", "View")
    datasource: { (): WUResult | LogicalFile | Databomb; (_: WUResult | LogicalFile | Databomb): View };

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn })
    groupBy: { (): GroupByColumn[]; (_: GroupByColumn[]): View; };

    _total = 0;

    _fieldIdx: { [key: string]: IField } = {};

    _prevHash;

    columns() {
        this._fieldIdx = {};
        return (this.datasource().fields() as IField[]).map(field => {
            this._fieldIdx[field.id] = field;
            return field.id;
        });
    }

    field(fieldID: string) {
        return this._fieldIdx[fieldID];
    }

    hash(): string {
        return hashSum({
            samples: this.samples(),
            sampleSize: this.sampleSize(),
            datasource: this.datasource().hash(),
            groupBy: this.groupBy()
        });
    }

    refresh(): Promise<void> {
        return this.datasource().refresh().then(() => {
            if (this._prevHash !== this.hash()) {
                this._prevHash = this.hash();
                this.columns();
            }
        });
    }

    label(): string {
        return `View\n${this.datasource().label()}`;
    }

    fields(): IField[] {
        const retVal: IField[] = [];
        let currField: IField[] = retVal;
        const groups: GroupByColumn[] = this.groupBy().filter(groupBy => groupBy.column());
        for (const groupBy of groups) {
            const groupByField = this.field(groupBy.column());
            const field: IField = {
                id: "key",
                label: groupBy.column(),
                type: groupByField.type,
                children: null
            };
            currField.push(field);
            const values: IField = {
                id: "values",
                label: "computed",
                type: "object",
                children: []
            };
            currField.push(values);
            currField = values.children;
            /*
            for (const cf of groupBy.computedFields()) {
                if (cf.label()) {
                    const computedField: IField = {
                        id: cf.label(),
                        label: cf.label(),
                        type: "number",
                        children: null
                    };
                    value.children.push(computedField);
                }
            }
            const rows: IField = {
                id: "rows",
                label: "rows",
                type: "object",
                children: []
            };
            values.children.push(rows);
            currField = rows.children;
            */
        }

        const columns = groups.map(groupBy => groupBy.column());
        currField.push(...this.datasource().fields().filter(field => {
            return columns.indexOf(field.id) < 0;
        }));
        return retVal;
    }

    sample(samples: number, sampleSize: number): Promise<any[]> {
        return this.datasource().sample(samples, sampleSize);
    }

    doGroupBy(xs: any[], key): any {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    fetch(from: number, count: number): Promise<any[]> {
        return this.sample(this.samples(), this.sampleSize()).then(response => {
            const nest = d3Nest<any[], any>();
            for (const groupBy of this.groupBy()) {
                if (groupBy.column()) {
                    nest
                        .key(d => d[groupBy.column()]);
                }
            }
            const retVal = nest.entries(response);
            this._total = retVal.length;
            return retVal;
        });
    }

    total(): number {
        return this._total;
    }
}
View.prototype._class += " View";
