import { PropertyExt, publish } from "@hpcc-js/common";
import { nest as d3Nest } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { AggregateField, AggregateType, View } from "./view";

export class GroupByColumn extends PropertyExt {
    _owner: FlatView;

    constructor(owner: FlatView) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    @publish(undefined, "set", "Field", function () { return this.columns(); }, { optional: true })
    column: { (): string; (_: string): GroupByColumn; };

    columns() {
        return this._owner.columns();
    }
}
GroupByColumn.prototype._class += " GroupByColumn";

export class FlatView extends View {
    @publish([], "propertyArray", "Source Columns", null, { autoExpand: GroupByColumn })
    groupBys: { (): GroupByColumn[]; (_: GroupByColumn[]): View; };
    appendGroupBys(columns: [{ field: string }]): this {
        for (const column of columns) {
            this.groupBys().push(new GroupByColumn(this)
                .column(column.field)
            );
        }
        return this;
    }

    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: AggregateField })
    computedFields: { (): AggregateField[]; (_: AggregateField[]): View; };
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

    hash(): string {
        return super.hash({
            groupBy: this.groupBys(),
            computedFields: this.computedFields()
        });
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

    protected _preProcess(data: any[]): any[] {
        data = super._preProcess(data);
        data = this._preGroupBy(data);
        return data;
    }

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
FlatView.prototype._class += " FlatView";
