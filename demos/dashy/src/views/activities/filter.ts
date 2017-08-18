import { PropertyExt } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Viz } from "../../dashboard/viz";
import { View } from "../view";
import { Activity } from "./activity";

export enum Rule {
    eq = "==",
    neq = "!=",
    gt = ">",
    gte = ">=",
    lt = "<",
    lte = "<=",
    contains = "contains"
}
export type RuleType = Rule.eq | Rule.neq | Rule.gt | Rule.gte | Rule.lt | Rule.lte | Rule.contains;
export const RuleKeyArr = Object.keys(Rule);
export const RuleValueArr = RuleKeyArr.map((key: any) => Rule[key]);

export class ColumnMapping extends PropertyExt {
    _owner: Filter;

    constructor(owner: Filter) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash() {
        return hashSum({
            remoteField: this.remoteField(),
            localField: this.localField(),
            condition: this.condition()
        });
    }

    localFields() {
        return this._owner.inFields().map(field => field.label);
    }

    sourceOutFields() {
        return this._owner.sourceOutFields().map(field => field.label);
    }

    createFilter(filterSelection: any[]): (localRow: any) => boolean {
        const lf = this.localField();
        const rf = this.remoteField();
        switch (this.condition()) {
            case Rule.eq:
                return (localRow) => localRow[lf] === filterSelection[0][rf];
            case Rule.neq:
                return (localRow) => localRow[lf] !== filterSelection[0][rf];
            case Rule.lt:
                return (localRow) => localRow[lf] < filterSelection[0][rf];
            case Rule.lte:
                return (localRow) => localRow[lf] <= filterSelection[0][rf];
            case Rule.gt:
                return (localRow) => localRow[lf] > filterSelection[0][rf];
            case Rule.gte:
                return (localRow) => localRow[lf] >= filterSelection[0][rf];
            case Rule.contains:
                return (localRow) => filterSelection.some(fsRow => localRow[lf] === fsRow[rf]);
        }
    }

    doFilter(row: object, filterSelection: any[]): boolean {
        return this.createFilter(filterSelection)(row);
    }
}
ColumnMapping.prototype._class += " ColumnMapping";
export interface ColumnMapping {
    remoteField(): string;
    remoteField(_: string): this;
    localField(): string;
    localField(_: string): this;
    condition(): Rule;
    condition(_: Rule): this;
}
ColumnMapping.prototype.publish("remoteField", null, "set", "Filter Fields", function (this: ColumnMapping) { return this.sourceOutFields(); }, { optional: true });
ColumnMapping.prototype.publish("localField", null, "set", "Local Fields", function (this: ColumnMapping) { return this.localFields(); }, { optional: true });
ColumnMapping.prototype.publish("condition", "==", "set", "Filter Fields", RuleValueArr);

export class Filter extends PropertyExt {
    private _view: View;
    private _owner: Filters;

    constructor(owner: Filters) {
        super();
        this._view = owner._owner;
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    visualizationIDs() {
        return this._view._dashboard.visualizationIDs();
    }

    hash(): string {
        return hashSum({
            source: this.source(),
            nullable: this.nullable(),
            mappings: this.validMappings().map(mapping => mapping.hash())
        });
    }

    validMappings(): ColumnMapping[] {
        return this.mappings().filter(mapping => !!mapping.localField() && !!mapping.remoteField());
    }

    appendMappings(mappings: [{ remoteField: string, localField: string }]): this {
        for (const mapping of mappings) {
            this.mappings().push(new ColumnMapping(this)
                .remoteField(mapping.remoteField)
                .localField(mapping.localField)
            );
        }
        return this;
    }

    inFields(): IField[] {
        return this._owner.inFields();
    }

    sourceViz(): Viz {
        return this._view._dashboard.visualization(this.source());
    }

    sourceOutFields(): IField[] {
        return this.sourceViz().view().outFields();
    }

    sourceSelection(): any[] {
        return this.sourceViz().state().selection();
    }

    dataFilter(data: any[]): any[] {
        const selection = this.sourceSelection();
        if (selection.length === 0 && !this.nullable()) {
            return [];
        }
        return data;
    }

    rowFilter(row: object): boolean {
        const validMappings = this.validMappings();
        return validMappings.every(mapping => mapping.doFilter(row, this.sourceSelection()));
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
Filter.prototype.publish("source", null, "set", "Datasource", function (this: Filter) { return this.visualizationIDs(); }, { optional: true });
Filter.prototype.publish("nullable", false, "boolean", "Ignore null filters");
Filter.prototype.publish("mappings", [], "propertyArray", "Mappings", null, { autoExpand: ColumnMapping });

export class Filters extends Activity {
    _owner: View;

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    //  Activity overrides  ---
    hash(): string {
        return hashSum(this.validFilters().map(filter => filter.hash()));
    }

    exists(): boolean {
        return this.validFilters().length > 0;
    }

    updatedBy(): string[] {
        return this.validFilters().map(filter => filter.source());
    }

    exec(): Promise<void> {
        return super.exec();
    }

    pullData(): object[] {
        let data = super.pullData();
        const filters = this.validFilters();
        //  Test for null selection + nullable
        for (const filter of filters) {
            data = filter.dataFilter(data);
        }
        return data.filter(row => {
            return filters.every(filter => filter.rowFilter(row));
        });
    }

    //  --- --- ---
    validFilters(): Filter[] {
        return this.filter().filter(filter => filter.source());
    }

    appendFilter(source: View, mappings: [{ remoteField: string, localField: string }]): this {
        this.filter().push(new Filter(this)
            .source(source.id())
            .appendMappings(mappings));
        return this;
    }
}
Filters.prototype._class += " Filters";
export interface Filters {
    filter(): Filter[];
    filter(_: Filter[]): this;
}
Filters.prototype.publish("filter", [], "propertyArray", "Filter", null, { autoExpand: Filter });
