import { max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, nest as d3Nest, sum as d3Sum } from "@hpcc-js/common";
import { PropertyExt, publish } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { Databomb, LogicalFile, WUResult } from "./datasource";

const d3Aggr = {
    mean: d3Mean,
    median: d3Median,
    min: d3Min,
    max: d3Max,
    sum: d3Sum
};

export class CalcField extends PropertyExt {
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

    aggrType: { (): string; (_: string): GroupByColumn; };
    aggrColumn: { (): string; (_: string): GroupByColumn; };
}
CalcField.prototype._class += " CalcField";

export class GroupByColumn extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
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

    @publish(null, "set", "Field", function () { return this._owner.columns(); }, { optional: true })
    column: { (): string; (_: string): GroupByColumn; };
    aggrType: { (): string; (_: string): GroupByColumn; };
    aggrColumn: { (): string; (_: string): GroupByColumn; };

}
GroupByColumn.prototype._class += " GroupByColumn";

export class View extends PropertyExt implements IDatasource {
    @publish(null, "widget", "View")
    datasource: { (): WUResult | LogicalFile | Databomb; (_: WUResult | LogicalFile | Databomb): View };

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn })
    groupBy: { (): GroupByColumn[]; (_: GroupByColumn[]): View; };

    _samples = 10;
    _sampleSize = 100;
    _total = 0;

    _fieldIdx: { [key: string]: IField } = {};

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

    refresh(): Promise<void> {
        return this.datasource().refresh();
    }

    label(): string {
        return `View\n${this.datasource().label()}`;
    }

    fields(): IField[] {
        const retVal: IField[] = [];
        let currField: IField[] = retVal;
        const columns: string[] = this.groupBy().map(groupBy => groupBy.column()).filter(column => column);
        for (const column of columns) {
            const colField = this.field(column);
            const field: IField = {
                id: "key",
                label: column,
                type: colField.type,
                children: null
            };
            currField.push(field);
            const values: IField = {
                id: "values",
                label: "values",
                type: "object",
                children: []
            };
            currField.push(values);
            currField = values.children;
        }
        currField.push(...this.datasource().fields().filter(field => {
            return columns.indexOf(field.id) < 0;
        }));
        return retVal;
    }

    sample(samples: number, sampleSize: number): Promise<any[]> {
        return this.datasource().sample(this._samples, this._sampleSize);
    }

    fetch(from: number, count: number): Promise<any[]> {
        return this.datasource().sample(3, 10).then(response => {
            const nest = d3Nest();
            for (const groupBy of this.groupBy()) {
                if (groupBy.column()) {
                    nest.key(d => d[groupBy.column()]);
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
