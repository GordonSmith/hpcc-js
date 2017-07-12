import { PropertyExt, publish } from "@hpcc-js/common";
import { nest as d3Nest } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { AggregateField, View } from "./view";

export class GroupByColumn extends PropertyExt {
    _owner;

    constructor(owner?) {
        super();
        this._owner = owner;
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
    groupBy: { (): GroupByColumn[]; (_: GroupByColumn[]): View; };

    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: AggregateField })
    computedFields: { (): AggregateField[]; (_: AggregateField[]): View; };

    hash(): string {
        return super.hash({
            groupBy: this.groupBy(),
            computedFields: this.computedFields()
        });
    }

    fields(): IField[] {
        const retVal: IField[] = [];
        const groups: GroupByColumn[] = this.groupBy().filter(groupBy => groupBy.column());
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
        if (this.payload()) {
            const rows: IField = {
                id: "values",
                label: "rows",
                type: "object",
                children: []
            };
            retVal.push(rows);
            const columns = groups.map(groupBy => groupBy.column());
            rows.children.push(...this.datasource().fields().filter(field => {
                return columns.indexOf(field.id) < 0;
            }));
        }
        return retVal.length === 1 ? retVal[0].children : retVal;
    }

    _fetch(from: number, count: number): Promise<any[]> {
        return this.sample(this.samples(), this.sampleSize()).then(response => {
            const retVal = d3Nest()
                .key(row => {
                    let key = "";
                    for (const groupBy of this.groupBy()) {
                        if (groupBy.column()) {
                            if (key) {
                                key += ":";
                            }
                            key += row[groupBy.column()];
                        }
                    }
                    return key;
                })
                .entries(response).map(row => {
                    delete row.key;
                    for (const groupBy of this.groupBy()) {
                        if (groupBy.column()) {
                            row[groupBy.column()] = row.values[0][groupBy.column()];
                        }
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
            return retVal.length === 1 ? retVal[0].values : retVal;
        });
    }
}
FlatView.prototype._class += " FlatView";
