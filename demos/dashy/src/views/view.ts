import { PropertyExt, publish } from "@hpcc-js/common";
import { deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "@hpcc-js/common";
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

export class ComputedField extends PropertyExt {
    _owner;

    @publish(null, "string", "Label", null, { optional: true, disable: (w) => !w._owner.hasColumn() })
    label: { (): string; (_: string): ComputedField; };
    @publish("count", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() })
    aggrType: { (): string; (_: string): ComputedField; };
    @publish(null, "set", "Aggregation Field", function () { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() || w.aggrType() === "count" })
    aggrColumn: { (): string; (_: string): ComputedField; };

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
ComputedField.prototype._class += " CalcField";
export interface IView<T> extends IDatasource {
    source: { (): string; (_: string): T };
}

export abstract class View extends PropertyExt implements IView<View> {
    @publish(10, "number", "Number of samples")
    samples: { (): number; (_: number): View; };
    @publish(100, "number", "Sample size")
    sampleSize: { (): number; (_: number): View; };
    @publish(true, "boolean", "Show payload")
    payload: { (): boolean; (_: boolean): View; };

    @publish(null, "set", "Datasource", function () { return this._model.datasourceLabels(); })
    source: { (): string; (_: string): View };

    _total = 0;

    _fieldIdx: { [key: string]: IField } = {};

    _prevHash;

    _model: Model;

    constructor(model: Model) {
        super();
        this._model = model;
    }

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
    abstract fetch(from: number, count: number): Promise<any[]>;
}
View.prototype._class += " View";
