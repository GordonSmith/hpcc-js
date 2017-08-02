import { nest as d3Nest, PropertyExt } from "@hpcc-js/common";
import { ascending as d3Ascending, descending as d3Descending, deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Viz } from "../dashboard/viz";
import { Databomb, NullDatasource } from "../datasources/databomb";
import { Form } from "../datasources/form";
import { LogicalFile } from "../datasources/logicalfile";
import { WUResult } from "../datasources/wuresult";
import { Model } from "../model";

export type ViewDatasource = WUResult | LogicalFile | Databomb | NullDatasource | Form;

function localCount(leaves: any[], callback: any): number {
    return leaves.length;
}

const d3Aggr = {
    count: localCount,
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

    constructor(owner) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum({
            label: this.label(),
            aggrType: this.aggrType(),
            aggrColumn: this.aggrColumn()
        });
    }

    columns() {
        return this._owner.columns();
    }

    aggregate(values) {
        return d3Aggr[this.aggrType() as string](values, leaf => +leaf[this.aggrColumn()]);
    }
}
AggregateField.prototype._class += " AggregateField";

export interface AggregateField {
    label(): string;
    label(_: string): this;
    aggrType(): AggregateType;
    aggrType(_: AggregateType): this;
    aggrColumn(): string;
    aggrColumn(_: string): this;
}
AggregateField.prototype.publish("label", null, "string", "Label", null, { optional: true, disable: (w) => !w._owner.hasColumn() });
AggregateField.prototype.publish("aggrType", "count", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() });
AggregateField.prototype.publish("aggrColumn", null, "set", "Aggregation Field", function () { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() || w.aggrType() === "count" });

export class SortColumn extends PropertyExt {
    _owner: View;

    constructor(owner?) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
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

export interface SortColumn {
    sortColumn(): string;
    sortColumn(_: string): SortColumn;
    descending(): boolean;
    descending(_: boolean): SortColumn;
}
SortColumn.prototype.publish("sortColumn", null, "set", "Sort Field", function () { return this.fields(); }, { optional: true });
SortColumn.prototype.publish("descending", null, "boolean", "Sort Field");

export class ColumnMapping extends PropertyExt {
    _owner: Filter;

    constructor(owner) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash() {
        return hashSum({
            filterField: this.filterField(),
            localField: this.localField(),
            condition: this.condition()
        });
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
export interface ColumnMapping {
    filterField(): string;
    filterField(_: string): this;
    localField(): string;
    localField(_: string): this;
    condition(): string;
    condition(_: string): this;
}
ColumnMapping.prototype.publish("filterField", null, "set", "Filter Fields", function () { return this.filterFields(); }, { optional: true });
ColumnMapping.prototype.publish("localField", null, "set", "Local Fields", function () { return this.localFields(); }, { optional: true });
ColumnMapping.prototype.publish("condition", "==", "set", "Filter Fields", ["==", "!=", ">", ">=", "<", "<=", "contains"]);

export class Filter extends PropertyExt {
    _owner: View;

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
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
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

    sourceViz(): Viz {
        return this._owner._model.visualization(this.source());
    }

    sourceOutFields(): IField[] {
        return this.sourceViz().toIDatasource().outFields();
    }

    sourceSelection(): any[] {
        return this.sourceViz().state().selection();
    }
}
Filter.prototype._class += " Filter";
export interface Filter {
    source(): string;
    source(_: string): this;
    nullable(): boolean;
    nullable(_: boolean): this;
    mappings(): ColumnMapping[];
    mappings(_: ColumnMapping[]): this;
}
Filter.prototype.publish("source", null, "set", "Datasource", function () { return this._owner._model.visualizationIDs(); }, { optional: true });
Filter.prototype.publish("nullable", false, "boolean", "Ignore null filters");
Filter.prototype.publish("mappings", [], "propertyArray", "Mappings", null, { autoExpand: ColumnMapping });

export class GroupByColumn extends PropertyExt {
    _owner: View;

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum(this.column());
    }

    columns() {
        return this._owner.columns();
    }
}
GroupByColumn.prototype._class += " GroupByColumn";

export interface GroupByColumn {
    column(): string;
    column(_: string): this;
}
GroupByColumn.prototype.publish("column", undefined, "set", "Field", function () { return this.columns(); }, { optional: true });

let viewID = 0;
export class View extends PropertyExt implements IDatasource {
    _source: string = "42";
    _model: Model;
    _total = 0;
    _prevHash;

    constructor(model: Model, label: string = "View") {
        super();
        this._model = model;
        this.label(label);
        this._id = "v" + viewID++;
    }

    validFilters(): Filter[] {
        return this.filters().filter(filter => filter.source());
    }
    hasFilter(): boolean {
        return this.validFilters().length > 0;
    }
    appendFilter(source: View, mappings: [{ filterField: string, localField: string }]): this {
        this.filters().push(new Filter(this)
            .source(source.id())
            .appendMappings(mappings));
        return this;
    }
    validSortBy(): SortColumn[] {
        return this.sortBy().filter(sortBy => sortBy.sortColumn());
    }
    hasSortBy(): boolean {
        return this.validSortBy().length > 0;
    }

    limit_exists: () => boolean;
    hasLimit(): boolean {
        return this.limit_exists() && this.limit() > 0;
    }

    datasource(): ViewDatasource {
        return this.source() as ViewDatasource;
    }

    columns() {
        return (this.datasource().outFields() as IField[]).map(field => {
            return field.id;
        });
    }

    hasColumn(): boolean {
        return true;
    }

    field(fieldID: string): IField | null {
        for (const field of this.datasource().outFields()) {
            if (field.id === fieldID) {
                return field;
            }
        }
        return null;
    }

    hash(more: { [key: string]: any } = {}): string {
        return hashSum({
            datasource: this.datasource().hash(),
            filter: this.filters().map(filter => filter.hash()),
            groupBy: this.groupBys().map(gb => gb.hash()),
            computedFields: this.computedFields().map(cf => cf.hash()),
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

    fetch(from: number = 0, count: number = Number.MAX_VALUE): Promise<any[]> {
        return this.datasource().fetch(0, Number.MAX_VALUE).then(data => {
            data = this._preFilter(data);
            data = this._preGroupBy(data);
            data = this._postSort(data);
            data = this._postLimit(data);
            this._total = data.length;
            return data.slice(from, from + count);
        });
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
        if (this.hasLimit()) {
            data.length = this.limit();
        }
        return data;
    }

    //  ===

    appendGroupBys(columns: [{ field: string }]): this {
        for (const column of columns) {
            this.groupBys().push(new GroupByColumn(this)
                .column(column.field)
            );
        }
        return this;
    }

    appendComputedFields(aggregateFields: [{ label: string, type: AggregateType, column?: string }]): this {
        for (const aggregateField of aggregateFields) {
            const aggrField = new AggregateField(this)
                .label(aggregateField.label)
                .aggrType(aggregateField.type)
                ;
            if (aggregateField.column !== void 0) {
                aggrField.aggrColumn(aggregateField.column);
            }
            this.computedFields().push(aggrField);
        }
        return this;
    }

    validGroupBy() {
        return this.groupBys().filter(groupBy => !!groupBy.column());
    }

    hasGroupBy() {
        return this.validGroupBy().length;
    }

    validComputedFields() {
        return this.computedFields().filter(computedField => computedField.label());
    }

    hasComputedFields() {
        return this.validComputedFields().length;
    }

    outFields(): IField[] {
        const retVal: IField[] = [];
        const groups: GroupByColumn[] = this.validGroupBy();
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
        if (this.details()) {
            let detailsTarget: IField[] = retVal;
            if (this.hasGroupBy()) {
                const rows: IField = {
                    id: "values",
                    label: "details",
                    type: "object",
                    children: []
                };
                retVal.push(rows);
                detailsTarget = rows.children;
            }
            const columns = groups.map(groupBy => groupBy.column());
            detailsTarget.push(...this.datasource().outFields().filter(field => {
                return this.fullDetails() || columns.indexOf(field.id) < 0;
            }));
        }
        return retVal;
    }

    /*
    protected _fetch(from: number, count: number): Promise<any[]> {
        return this.sample(this.samples(), this.sampleSize());
    }
    */

    protected _preGroupBy(data: any[]): any[] {
        if (data.length === 0) return data;
        const retVal = d3Nest()
            .key(row => {
                let key = "";
                for (const groupBy of this.groupBys()) {
                    if (groupBy.column()) {
                        if (key) {
                            key += ":";
                        }
                        key += row[groupBy.column()];
                    }
                }
                return key;
            })
            .entries(data).map(row => {
                delete row.key;
                for (const groupBy of this.validGroupBy()) {
                    row[groupBy.column()] = row.values[0][groupBy.column()];
                }
                for (const cf of this.computedFields()) {
                    if (cf.label()) {
                        row[cf.label()] = cf.aggregate(row.values);
                    }
                }
                return row;
            })
            ;
        this._total = retVal.length;
        return this.hasGroupBy() ? retVal : retVal[0].values;
    }
}
View.prototype._class += " View";

const nullDS = new NullDatasource();

export interface View {
    label(): string;
    label(_: string): this;
    source(): PropertyExt;
    source(_: PropertyExt): this;
    details(): boolean;
    details(_: boolean): this;
    fullDetails(): boolean;
    fullDetails(_: boolean): this;
    filters(): Filter[];
    filters(_: Filter[]): this;
    groupBys(): GroupByColumn[];
    groupBys(_: GroupByColumn[]): this;
    computedFields(): AggregateField[];
    computedFields(_: AggregateField[]): this;
    sortBy(): SortColumn[];
    sortBy(_: SortColumn[]): this;
    limit(): number | undefined;
    limit(_: number | undefined): this;
}
View.prototype.publish("label", null, "string", "Label");
View.prototype.publish("source", nullDS, "widget", "Data Source");
View.prototype.publish("details", true, "boolean", "Show details");
View.prototype.publish("fullDetails", false, "boolean", "Show groupBy fileds in details");
View.prototype.publish("filters", [], "propertyArray", "Filter", null, { autoExpand: Filter });
View.prototype.publish("groupBys", [], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn });
View.prototype.publish("computedFields", [], "propertyArray", "Computed Fields", null, { autoExpand: AggregateField });
View.prototype.publish("sortBy", [], "propertyArray", "Source Columns", null, { autoExpand: SortColumn });
View.prototype.publish("limit", undefined, "number", "Limit output");
