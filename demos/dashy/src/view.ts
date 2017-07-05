import { PropertyExt, publish } from "@hpcc-js/common";
import { deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, nest as d3Nest, sum as d3Sum, variance as d3Variance } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Databomb, LogicalFile, WUResult } from "./datasource";
import { Model } from "./model";

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

    @publish(null, "string", "Label", null, { optional: true, disable: (w) => !w._owner.hasColumn() })
    label: { (): string; (_: string): ComputedField; };
    @publish("mean", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() })
    aggrType: { (): string; (_: string): ComputedField; };
    @publish(null, "set", "Aggregation Field", function () { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() })
    aggrColumn: { (): string; (_: string): ComputedField; };
}
ComputedField.prototype._class += " CalcField";

export class NestedGroupByColumn extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    columns() {
        return this._owner.columns();
    }

    hasColumn(): boolean {
        return !!this.column();
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
    column: { (): string; (_: string): NestedGroupByColumn; };

    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: ComputedField })
    computedFields: { (): ComputedField[]; (_: ComputedField[]): NestedGroupByColumn; };

    aggrType: { (): string; (_: string): NestedGroupByColumn; };
    aggrColumn: { (): string; (_: string): NestedGroupByColumn; };

}
NestedGroupByColumn.prototype._class += " NestedGroupByColumn";

export class NestedView extends PropertyExt implements IDatasource {
    @publish(10, "number", "Number of samples")
    samples: { (): number; (_: number): NestedView; };
    @publish(100, "number", "Sample size")
    sampleSize: { (): number; (_: number): NestedView; };
    @publish(true, "boolean", "Show Rows")
    rows: { (): boolean; (_: boolean): NestedView; };

    @publish(null, "widget", "View")
    datasource: { (): WUResult | LogicalFile | Databomb; (_: WUResult | LogicalFile | Databomb): NestedView };

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: NestedGroupByColumn })
    groupBy: { (): NestedGroupByColumn[]; (_: NestedGroupByColumn[]): NestedView; };

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
        const groups: NestedGroupByColumn[] = this.groupBy().filter(groupBy => groupBy.column());
        for (const groupBy of groups) {
            const groupByField = this.field(groupBy.column());
            const field: IField = {
                id: "key",
                label: groupBy.column(),
                type: groupByField.type,
                children: null
            };
            currField.push(field);
            for (const cf of groupBy.computedFields()) {
                if (cf.label()) {
                    const computedField: IField = {
                        id: cf.label(),
                        label: cf.label(),
                        type: "number",
                        children: null
                    };
                    currField.push(computedField);
                }
            }
            const rows: IField = {
                id: "rows",
                label: "rows",
                type: "object",
                children: []
            };
            currField.push(rows);
            currField = rows.children;
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

    nest(rows: any[], groupIdx: number = 0): any[] {
        const groupBy = this.groupBy()[groupIdx];
        if (groupBy && groupBy.column()) {
            const nest = d3Nest<any[], any>();
            nest.key(d => d[groupBy.column()]);
            nest.rollup(leaves => {
                const retVal: any = {};
                for (const computedField of groupBy.computedFields()) {
                    if (computedField.label()) {
                        retVal[computedField.label()] = d3Aggr[computedField.aggrType()](leaves, leaf => leaf[computedField.aggrColumn()]);
                    }
                }
                retVal.rows = this.nest(leaves, groupIdx + 1);
                return retVal;
            });
            const nestedEntries = nest.entries(rows);
            return nestedEntries.map(entry => {
                return {
                    key: entry.key,
                    ...entry.value
                };
            });
        }
        return rows;
    }

    fetch(from: number, count: number): Promise<any[]> {
        return this.sample(this.samples(), this.sampleSize()).then(response => {
            const retVal = this.nest(response);
            this._total = retVal.length;
            return retVal;
        });
    }

    total(): number {
        return this._total;
    }
}
NestedView.prototype._class += " NestedView";

export class GroupByColumn extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    columns() {
        return this._owner.columns();
    }

    @publish(undefined, "set", "Field", function () { return this.columns(); }, { optional: true })
    column: { (): string; (_: string): GroupByColumn; };
}
GroupByColumn.prototype._class += " GroupByColumn";

export class View extends PropertyExt implements IDatasource {
    @publish(10, "number", "Number of samples")
    samples: { (): number; (_: number): View; };
    @publish(100, "number", "Sample size")
    sampleSize: { (): number; (_: number): View; };
    @publish(true, "boolean", "Show Rows")
    showRows: { (): boolean; (_: boolean): View; };

    @publish(null, "set", "Datasource", function () { return this._model.datasourceLabels(); })
    source: { (): string; (_: string): View };

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn })
    groupBy: { (): GroupByColumn[]; (_: GroupByColumn[]): View; };

    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: ComputedField })
    computedFields: { (): ComputedField[]; (_: ComputedField[]): View; };

    _total = 0;

    _fieldIdx: { [key: string]: IField } = {};

    _prevHash;

    _model: Model;
    constructor(model: Model) {
        super();
        this._model = model;
    }

    datasource(): IDatasource {
        return this._model.datasource(this.source());
    }

    columns() {
        this._fieldIdx = {};
        return (this.datasource().fields() as IField[]).map(field => {
            this._fieldIdx[field.id] = field;
            return field.id;
        });
    }

    hasColumn(): boolean {
        return true;
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
        const groups: GroupByColumn[] = this.groupBy().filter(groupBy => groupBy.column());
        for (const groupBy of groups) {
            const groupByField = this.field(groupBy.column());
            const field: IField = {
                id: groupBy.column(),
                label: groupBy.column(),
                type: groupByField.type,
                children: null
            };
            retVal.push(field);
        }
        for (const cf of this.computedFields()) {
            if (cf.label()) {
                const computedField: IField = {
                    id: cf.label(),
                    label: cf.label(),
                    type: "number",
                    children: null
                };
                retVal.push(computedField);
            }
        }
        if (this.showRows()) {
            const rows: IField = {
                id: "values",
                label: "rows",
                type: "object",
                children: []
            };
            retVal.push(rows);
            const columns = groups.map(groupBy => groupBy.column());
            rows.children.push(...this.datasource().fields().filter(field => {
                return columns.indexOf(field.id) < 0;
            }));
        }
        return retVal;
    }

    sample(samples: number, sampleSize: number): Promise<any[]> {
        return this.datasource().sample(samples, sampleSize);
    }

    fetch(from: number, count: number): Promise<any[]> {
        return this.sample(this.samples(), this.sampleSize()).then(response => {
            const retVal = d3Nest()
                .key(row => {
                    let key = "";
                    for (const groupBy of this.groupBy()) {
                        if (groupBy.column()) {
                            if (key) {
                                key += ":";
                            }
                            key += row[groupBy.column()];
                        }
                    }
                    return key;
                })
                .entries(response).map(row => {
                    delete row.key;
                    for (const groupBy of this.groupBy()) {
                        if (groupBy.column()) {
                            row[groupBy.column()] = row.values[0][groupBy.column()];
                        }
                    }
                    for (const cf of this.computedFields()) {
                        if (cf.label()) {
                            row[cf.label()] = d3Aggr[cf.aggrType()](row.values, leaf => leaf[cf.aggrColumn()]);
                        }
                    }
                    return row;
                })
                ;
            this._total = retVal.length;
            return retVal;
        });
    }

    total(): number {
        return this._total;
    }
}
View.prototype._class += " View";
