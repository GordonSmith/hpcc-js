import { PropertyExt, publish } from "@hpcc-js/common";
import { ascending as d3Ascending, descending as d3Descending, deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Databomb, NullDatasource } from "../datasources/databomb";
import { Form } from "../datasources/form";
import { LogicalFile } from "../datasources/logicalfile";
import { WUResult } from "../datasources/wuresult";
import { Model } from "../model";

export type ViewDatasource = WUResult | LogicalFile | Databomb | NullDatasource | Form;

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

export type AggregateType = "count" | "min" | "max" | "sum" | "mean" | "median" | "variance" | "deviation";
export class AggregateField extends PropertyExt {
    _owner;

    @publish(null, "string", "Label", null, { optional: true, disable: (w) => !w._owner.hasColumn() })
    label: { (): string; (_: string): AggregateField; };
    @publish("count", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() })
    aggrType: { (): AggregateType; (_: AggregateType): AggregateField; };
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
        return d3Aggr[this.aggrType() as string](values, leaf => leaf[this.aggrColumn()]);
    }
}
AggregateField.prototype._class += " AggregateField";

export class SortColumn extends PropertyExt {
    _owner: View;

    @publish(null, "set", "Sort Field", function () { return this.fields(); }, { optional: true })
    sortColumn: { (): string; (_: string): SortColumn; };
    @publish(null, "boolean", "Sort Field")
    descending: { (): boolean; (_: boolean): SortColumn; };

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    fields() {
        return this._owner.outFields().map(field => field.label);
    }

    field(label: string): IField | undefined {
        return this._owner.outFields().filter(field => field.label === label)[0];
    }

    sort(values) {
        return values; // d3Aggr[this.aggrType()](values, leaf => leaf[this.aggrColumn()]);
    }
}
SortColumn.prototype._class += " SortColumn";

export class ColumnMapping extends PropertyExt {
    _owner: Filter;

    @publish(null, "set", "Filter Fields", function () { return this.filterFields(); }, { optional: true })
    filterField: { (): string; (_: string): ColumnMapping; };
    @publish(null, "set", "Local Fields", function () { return this.localFields(); }, { optional: true })
    localField: { (): string; (_: string): ColumnMapping; };
    @publish("==", "set", "Filter Fields", ["==", "!=", ">", ">=", "<", "<=", "contains"])
    condition: { (): string; (_: string): ColumnMapping; };

    constructor(owner?) {
        super();
        this._owner = owner;
    }

    hash() {
        return hashSum({});
    }

    localFields() {
        return this._owner.inFields().map(field => field.label);
    }

    /*
    field(label: string): IField | undefined {
        return this._owner.inFields().filter(field => field.label === label)[0];
    }
    */

    filterFields() {
        return this._owner.sourceOutFields().map(field => field.label);
    }

    createFilter(filterSelection: any[]): (localRow: any) => boolean {
        const lf = this.localField();
        const ff = this.filterField();
        switch (this.condition()) {
            case "==":
                return (localRow) => localRow[lf] === filterSelection[0][ff];
            case "!=":
                return (localRow) => localRow[lf] !== filterSelection[0][ff];
            case "<":
                return (localRow) => localRow[lf] < filterSelection[0][ff];
            case "<=":
                return (localRow) => localRow[lf] <= filterSelection[0][ff];
            case ">":
                return (localRow) => localRow[lf] > filterSelection[0][ff];
            case ">=":
                return (localRow) => localRow[lf] >= filterSelection[0][ff];
            case "conatins":
                return (localRow) => filterSelection.some(fsRow => localRow[lf] === fsRow[ff]);
        }
    }
}
ColumnMapping.prototype._class += " ColumnMapping";

export class Filter extends PropertyExt {
    _owner: View;

    @publish(null, "set", "Datasource", function () { return this._owner._model.viewIDs(); }, { optional: true })
    source: { (): string; (_: string): Filter };

    @publish(false, "boolean", "Ignore null filters")
    nullable: { (): boolean; (_: boolean): Filter };

    @publish([], "propertyArray", "Mappings", null, { autoExpand: ColumnMapping })
    mappings: { (): ColumnMapping[]; (_: ColumnMapping[]): Filter; };
    validMappings(): ColumnMapping[] {
        return this.mappings().filter(mapping => !!mapping.localField() && !!mapping.filterField());
    }
    appendMappings(mappings: [{ filterField: string, localField: string }]): this {
        for (const mapping of mappings) {
            this.mappings().push(new ColumnMapping(this)
                .filterField(mapping.filterField)
                .localField(mapping.localField)
            );
        }
        return this;
    }

    constructor(owner) {
        super();
        this._owner = owner;
    }

    hash(): string {
        return hashSum({
            source: this.source(),
            nullable: this.nullable(),
            mappings: this.validMappings().map(mapping => mapping.hash())
        });
    }

    inFields(): IField[] {
        return this._owner.inFields();
    }

    sourceView(): View {
        return this._owner._model.view(this.source());
    }

    sourceOutFields(): IField[] {
        return this.sourceView().outFields();
    }

    sourceSelection(): any[] {
        return this.sourceView().selection();
    }
}
Filter.prototype._class += " Filter";

export interface IView<T> extends IDatasource {
    source: { (): string; (_: string): T };
}

let viewID = 0;
export abstract class View extends PropertyExt implements IView<View> {
    _model: Model;
    _fieldIdx: { [key: string]: IField } = {};
    _total = 0;
    _selection: any[] = [];
    _prevHash;

    constructor(model: Model, label: string = "View") {
        super();
        this._model = model;
        this.label(label);
        this._id = "v" + viewID++;
    }

    @publish(null, "string", "Label")
    label: { (): string; (_: string): View };

    @publish(null, "set", "Datasource", function () { return this._model.datasourceIDs(); }, { optional: true })
    source: { (): string; (_: string): View };

    @publish(true, "boolean", "Show details")
    details: { (): boolean; (_: boolean): View; };

    @publish(false, "boolean", "Show groupBy fileds in details")
    fullDetails: { (): boolean; (_: boolean): View; };

    @publish([], "propertyArray", "Filter", null, { autoExpand: Filter })
    filters: { (): Filter[]; (_: Filter[]): View; };
    validFilters(): Filter[] {
        return this.filters().filter(filter => filter.source());
    }
    appendFilter(source: View, mappings: [{ filterField: string, localField: string }]): this {
        this.filters().push(new Filter(this)
            .source(source.id())
            .appendMappings(mappings));
        return this;
    }

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
        return (this.datasource().outFields() as IField[]).map(field => {
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
            filter: this.filters().map(filter => filter.hash()),
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

    total(): number {
        return this._total;
    }

    inFields(): IField[] {
        return this.datasource().outFields();
    }

    abstract outFields(): IField[];

    fetch(from: number, count: number): Promise<any[]> {
        return this.datasource().fetch(0, Number.MAX_VALUE).then(data => {
            data = this._preProcess(data);
            data = this._postProcess(data);
            this._total = data.length;
            return data.slice(from, from + count);
        });
    }

    selection(): any[];
    selection(_: any[]): this;
    selection(_?: any[]): any[] | this {
        if (_ === void 0) return this._selection;
        this._selection = _;
        return this;
    }

    protected _preProcess(data: any[]): any[] {
        data = this._preFilter(data);
        return data;
    }

    protected _postProcess(data: any[]): any[] {
        data = this._postSort(data);
        data = this._postLimit(data);
        return data;
    }
    protected _preFilter(data: any[]): any[] {
        const filters: Array<(localRow: any) => boolean> = [];
        for (const filter of this.validFilters()) {
            const selection = filter.sourceSelection();
            if (selection.length === 0) {
                if (!filter.nullable()) {
                    return [];
                }
            } else {
                for (const mapping of filter.validMappings()) {
                    filters.push(mapping.createFilter(selection));
                }
            }
        }
        if (filters.length) {
            return data.filter(row => {
                return filters.every(filter => filter(row));
            });
        }
        return data;
    }

    protected _postSort(data: any[]): any[] {
        const sortByArr = [];
        for (const sortBy of this.sortBy()) {
            const sortByField = sortBy.field(sortBy.sortColumn());
            if (sortByField) {
                sortByArr.push({ sortBy, sortByField });
            }
        }

        if (sortByArr.length) {
            return data.sort((l, r) => {
                for (const item of sortByArr) {
                    const retVal2 = (item.sortBy.descending() ? d3Descending : d3Ascending)(l[item.sortByField.label], r[item.sortByField.label]);
                    if (retVal2 !== 0) {
                        return retVal2;
                    }
                }
                return 0;
            });

        }
        return data;
    }

    protected _postLimit(data: any[]): any[] {
        if (this.limit_exists()) {
            data.length = this.limit();
        }
        return data;
    }
}
View.prototype._class += " View";
