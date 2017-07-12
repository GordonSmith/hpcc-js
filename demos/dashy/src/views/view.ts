import { PropertyExt, publish } from "@hpcc-js/common";
import { ascending as d3Ascending, descending as d3Descending, deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Databomb, NullDatasource } from "../datasources/databomb";
import { LogicalFile } from "../datasources/logicalfile";
import { WUResult } from "../datasources/wuresult";
import { Model } from "../model";

export type ViewDatasource = WUResult | LogicalFile | Databomb | NullDatasource;

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

export class AggregateField extends PropertyExt {
    _owner;

    @publish(null, "string", "Label", null, { optional: true, disable: (w) => !w._owner.hasColumn() })
    label: { (): string; (_: string): AggregateField; };
    @publish("count", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() })
    aggrType: { (): string; (_: string): AggregateField; };
    @publish(null, "set", "Aggregation Field", function () { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() || w.aggrType() === "count" })
    aggrColumn: { (): string; (_: string): AggregateField; };

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    columns() {
        return this._owner.columns();
    }

    aggregate(values) {
        return d3Aggr[this.aggrType()](values, leaf => leaf[this.aggrColumn()]);
    }
}
AggregateField.prototype._class += " CalcField";

export class SortColumn extends PropertyExt {
    _owner;

    @publish(null, "set", "Sort Field", function () { return this.fields(); }, { optional: true })
    sortColumn: { (): string; (_: string): SortColumn; };
    @publish(null, "boolean", "Sort Field")
    descending: { (): boolean; (_: boolean): SortColumn; };

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    fields() {
        return this._owner.fields().map(field => field.label);
    }

    field(label: string): IField | undefined {
        return this._owner.fields().filter(field => field.label === label)[0];
    }

    sort(values) {
        return values; // d3Aggr[this.aggrType()](values, leaf => leaf[this.aggrColumn()]);
    }
}
SortColumn.prototype._class += " CalcField";

export interface IView<T> extends IDatasource {
    source: { (): string; (_: string): T };
}

export abstract class View extends PropertyExt implements IView<View> {

    _total = 0;

    _fieldIdx: { [key: string]: IField } = {};

    _prevHash;

    _model: Model;

    constructor(model: Model) {
        super();
        this._model = model;
    }

    @publish(null, "set", "Datasource", function () { return this._model.datasourceLabels(); })
    source: { (): string; (_: string): View };

    @publish(10, "number", "Number of samples")
    samples: { (): number; (_: number): View; };
    @publish(100, "number", "Sample size")
    sampleSize: { (): number; (_: number): View; };
    @publish(true, "boolean", "Show payload")
    payload: { (): boolean; (_: boolean): View; };

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: SortColumn })
    sortBy: { (): SortColumn[]; (_: SortColumn[]): View; };

    @publish(undefined, "number", "Limit output")
    limit: { (): number | undefined; (_: number | undefined): View; };
    limit_exists: () => boolean;

    datasource(): ViewDatasource {
        return this._model.datasource(this.source()) as ViewDatasource;
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

    hash(more: { [key: string]: any } = {}): string {
        return hashSum({
            samples: this.samples(),
            sampleSize: this.sampleSize(),
            datasource: this.datasource().hash(),
            ...more
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

    sample(samples: number, sampleSize: number): Promise<any[]> {
        return this.datasource().sample(samples, sampleSize);
    }

    total(): number {
        return this._total;
    }

    abstract fields(): IField[];
    abstract _fetch(from: number, count: number): Promise<any[]>;

    fetch(from: number, count: number): Promise<any[]> {
        return this._fetch(from, count).then(response => {
            return this._postProcess(response);
        });
    }

    _postProcess(data: any[]): any[] {
        const retVal = data.sort((l, r) => {
            for (const sortBy of this.sortBy()) {
                const sortByField = sortBy.field(sortBy.sortColumn());
                if (sortByField) {
                    const retVal2 = (sortBy.descending() ? d3Descending : d3Ascending)(l[sortByField.label], r[sortByField.label]);
                    if (retVal2 !== 0) {
                        return retVal2;
                    }
                }
            }
            return 0;
        });
        if (this.limit_exists()) {
            retVal.length = this.limit();
        }
        return retVal;
    }
}
View.prototype._class += " View";
