import { PropertyExt, publish } from "@hpcc-js/common";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "d3-array";
import { nest as d3Nest } from "d3-collection";
import { Activity, ReferencedFields, stringify } from "./activity";

export class GroupByColumn extends PropertyExt {
    private _owner: GroupBy;

    @publish(undefined, "set", "Field", function (this: GroupByColumn) { return this.columns(); }, { optional: true })
    label: publish<this, string>;

    constructor(owner: GroupBy) {
        super();
        this._owner = owner;
    }

    toDDL(): string {
        return this.label();
    }

    static fromDDL(owner: GroupBy, label: string): GroupByColumn {
        return new GroupByColumn(owner)
            .label(label)
            ;
    }

    hash(): string {
        return hashSum(this.label());
    }

    columns() {
        return this._owner.inFieldIDs();
    }
}
GroupByColumn.prototype._class += " GroupByColumn";

//  ===========================================================================
type AggrFuncCallback = (item: any) => number;
type AggrFunc = (leaves: any[], callback: AggrFuncCallback) => number;
function localCount(leaves: any[], callback: AggrFuncCallback): number {
    return leaves.length;
}

const d3Aggr: { [key: string]: AggrFunc } = {
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
    private _owner: GroupBy;

    @publish(null, "string", "Label", null, { optional: true, disable: (w: AggregateField) => !w.hasColumn() })
    label: publish<this, string>;
    @publish("count", "set", "Aggregation Type", ["count", "min", "max", "sum", "mean", "median", "variance", "deviation"], { optional: true, disable: w => !w.label() })
    aggrType: publish<this, AggregateType>;
    @publish(null, "set", "Aggregation Field", function (this: AggregateField) { return this.columns(); }, { optional: true, disable: w => !w.label() || !w.aggrType() || w.aggrType() === "count" })
    aggrColumn: publish<this, string>;

    constructor(owner: GroupBy) {
        super();
        this._owner = owner;
    }

    toDDL(): DDL2.IAggregate | DDL2.ICount {
        if (this.aggrType() === "count") {
            return {
                label: this.label(),
                type: "count"
            };
        }
        return {
            label: this.label(),
            type: this.aggrType() as DDL2.IAggregateType,
            fieldID: this.aggrColumn()
        };
    }

    static fromDDL(owner: GroupBy, ddl: DDL2.IAggregate | DDL2.ICount): AggregateField {
        const retVal = new AggregateField(owner)
            .label(ddl.label)
            .aggrType(ddl.type)
            ;
        if (ddl.type !== "count") {
            retVal.aggrColumn(ddl.fieldID);
        }
        return retVal;
    }

    hash(): string {
        return hashSum({
            label: this.label(),
            aggrType: this.aggrType(),
            aggrColumn: this.aggrColumn()
        });
    }

    columns() {
        return this._owner.fieldIDs();
    }

    hasColumn() {
        return this.columns().length;
    }

    aggregate(values: Array<{ [key: string]: any }>) {
        return d3Aggr[this.aggrType() as string](values, leaf => +leaf[this.aggrColumn()]);
    }
}
AggregateField.prototype._class += " AggregateField";

//  ===========================================================================
export class GroupBy extends Activity {

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn })
    column: publish<this, GroupByColumn[]>;
    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: AggregateField })
    computedFields: publish<this, AggregateField[]>;
    @publish(false, "boolean", "Show details")
    details: publish<this, boolean>;
    @publish(false, "boolean", "Show groupBy fileds in details")
    fullDetails: publish<this, boolean>;

    constructor() {
        super();
    }

    toDDL(): DDL2.IGroupBy {
        return {
            type: "groupby",
            groupByIDs: this.fieldIDs(),
            aggregates: this.aggregates()
        };
    }

    static fromDDL(ddl: DDL2.IGroupBy): GroupBy {
        return new GroupBy()
            .fieldIDs(ddl.groupByIDs)
            .aggregates(ddl.aggregates)
            ;
    }

    toJS(): string {
        return `new GroupBy().fieldIDs(${JSON.stringify(this.fieldIDs())}).aggregates(${stringify(this.aggregates())})`;
    }

    fieldIDs(): string[];
    fieldIDs(_: string[]): this;
    fieldIDs(_?: string[]): string[] | this {
        if (!arguments.length) return this.validGroupBy().map(gb => gb.toDDL());
        this.column(_.map(fieldID => GroupByColumn.fromDDL(this, fieldID)));
        return this;
    }

    aggregates(): DDL2.AggregateType[];
    aggregates(_: DDL2.AggregateType[]): this;
    aggregates(_?: DDL2.AggregateType[]): DDL2.AggregateType[] | this {
        if (!arguments.length) return this.validComputedFields().map(cf => cf.toDDL());
        this.computedFields(_.map(aggrType => AggregateField.fromDDL(this, aggrType)));
        return this;
    }

    //  Activity
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

    inFieldIDs(): string[] {
        return this.inFields().map(field => field.id);
    }

    field(fieldID: string): IField | null {
        for (const field of this.inFields()) {
            if (field.id === fieldID) {
                return field;
            }
        }
        return null;
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
            const groupByField = this.field(groupBy.label());
            const field: IField = {
                id: groupBy.label(),
                label: groupBy.label(),
                type: groupByField ? groupByField.type : undefined,
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

    referencedFields(refs: ReferencedFields): void {
        super.referencedFields(refs);
        const fieldIDs: string[] = [];
        for (const gb of this.validGroupBy()) {
            fieldIDs.push(gb.label());
        }
        for (const cf of this.validComputedFields()) {
            if (cf.aggrColumn()) {
                fieldIDs.push(cf.aggrColumn());
            }
        }
        super.resolveInFields(refs, fieldIDs);
    }

    pullData(): object[] {
        const data = super.pullData();
        if (data.length === 0) return data;
        const retVal = d3Nest()
            .key((row: { [key: string]: any }) => {
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
            .entries(data).map(_row => {
                const row: { [key: string]: any } = _row;
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
