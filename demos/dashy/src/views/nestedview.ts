import { PropertyExt, publish } from "@hpcc-js/common";
import { nest as d3Nest } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { ComputedField, View } from "./view";

export class NestedGroupByColumn extends PropertyExt {
    _owner;

    @publish(undefined, "set", "Field", function () { return this.columns(); }, { optional: true })
    column: { (): string; (_: string): NestedGroupByColumn; };

    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: ComputedField })
    computedFields: { (): ComputedField[]; (_: ComputedField[]): NestedGroupByColumn; };

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

    aggrType: { (): string; (_: string): NestedGroupByColumn; };
    aggrColumn: { (): string; (_: string): NestedGroupByColumn; };

}
NestedGroupByColumn.prototype._class += " NestedGroupByColumn";

export class NestedView extends View {
    @publish([], "propertyArray", "Source Columns", null, { autoExpand: NestedGroupByColumn })
    groupBy: { (): NestedGroupByColumn[]; (_: NestedGroupByColumn[]): NestedView; };

    hash(): string {
        return super.hash({
            groupBy: this.groupBy()
        });
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

    nest(rows: any[], groupIdx: number = 0): any[] {
        const groupBy = this.groupBy()[groupIdx];
        if (groupBy && groupBy.column()) {
            const nest = d3Nest<any[], any>();
            nest.key(d => d[groupBy.column()]);
            nest.rollup(leaves => {
                const retVal: any = {};
                for (const computedField of groupBy.computedFields()) {
                    if (computedField.label()) {
                        retVal[computedField.label()] = computedField.aggregate(leaves);
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
}
NestedView.prototype._class += " NestedView";
