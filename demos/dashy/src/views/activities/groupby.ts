import { PropertyExt } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "d3-array";
import { nest as d3Nest } from "d3-collection";
import { View } from "../view";
import { Activity } from "./activity";

export class GroupByColumn extends PropertyExt {
    _owner: GroupBy;

    constructor(owner: GroupBy) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum(this.label());
    }

    columns() {
        return this._owner.columns();
    }
}
GroupByColumn.prototype._class += " GroupByColumn";

export interface GroupByColumn {
    label(): string;
    label(_: string): this;
}
GroupByColumn.prototype.publish("label", undefined, "set", "Field", function () { return this.columns(); }, { optional: true });

//  ===========================================================================
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
    _owner: GroupBy;

    constructor(owner: GroupBy) {
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

    hasColumn() {
        return this.columns().length;
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
AggregateField.prototype.publish("label", null, "string", "Label", null, { optional: true, disable: (w: AggregateField) => !w.hasColumn() });
AggregateField.prototype.publish("aggrType", "count", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() });
AggregateField.prototype.publish("aggrColumn", null, "set", "Aggregation Field", function () { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() || w.aggrType() === "count" });

//  ===========================================================================
export class GroupBy extends Activity {
    _owner: View;

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum({
            groupBy: this.column().map(gb => gb.hash()),
            computedFields: this.computedFields().map(cf => cf.hash()),
        });
    }

    appendGroupBys(columns: [{ field: string }]): this {
        for (const column of columns) {
            this.column().push(new GroupByColumn(this)
                .label(column.field)
            );
        }
        return this;
    }

    validGroupBy() {
        return this.column().filter(groupBy => !!groupBy.label());
    }

    exists(): boolean {
        return this.validGroupBy().length > 0;
    }

    columns() {
        return this._owner.columns();
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

    validComputedFields() {
        return this.computedFields().filter(computedField => computedField.label());
    }

    hasComputedFields() {
        return this.validComputedFields().length;
    }

    outFields(): IField[] {
        if (!this.exists()) return super.outFields();
        const retVal: IField[] = [];
        const groups: GroupByColumn[] = this.validGroupBy();
        for (const groupBy of groups) {
            const groupByField = this._owner.field(groupBy.label());
            const field: IField = {
                id: groupBy.label(),
                label: groupBy.label(),
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
            if (this.exists()) {
                const rows: IField = {
                    id: "values",
                    label: "details",
                    type: "object",
                    children: []
                };
                retVal.push(rows);
                detailsTarget = rows.children;
            }
            const columns = groups.map(groupBy => groupBy.label());
            detailsTarget.push(...this.inFields().filter(field => {
                return this.fullDetails() || columns.indexOf(field.id) < 0;
            }));
        }
        return retVal;
    }

    pullData(): any[] {
        const data = super.pullData();
        if (data.length === 0) return data;
        const retVal = d3Nest()
            .key(row => {
                let key = "";
                for (const groupBy of this.column()) {
                    if (groupBy.label()) {
                        if (key) {
                            key += ":";
                        }
                        key += row[groupBy.label()];
                    }
                }
                return key;
            })
            .entries(data).map(row => {
                delete row.key;
                for (const groupBy of this.validGroupBy()) {
                    row[groupBy.label()] = row.values[0][groupBy.label()];
                }
                for (const cf of this.computedFields()) {
                    if (cf.label()) {
                        row[cf.label()] = cf.aggregate(row.values);
                    }
                }
                return row;
            })
            ;
        return this.exists() ? retVal : retVal[0].values;
    }
}
GroupBy.prototype._class += " GroupBy";

export interface GroupBy {
    column(): GroupByColumn[];
    column(_: GroupByColumn[]): this;
    computedFields(): AggregateField[];
    computedFields(_: AggregateField[]): this;
    details(): boolean;
    details(_: boolean): this;
    fullDetails(): boolean;
    fullDetails(_: boolean): this;
}
GroupBy.prototype.publish("column", [], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn });
GroupBy.prototype.publish("computedFields", [], "propertyArray", "Computed Fields", null, { autoExpand: AggregateField });
GroupBy.prototype.publish("details", false, "boolean", "Show details");
GroupBy.prototype.publish("fullDetails", false, "boolean", "Show groupBy fileds in details");
