import { PropertyExt } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { ascending as d3Ascending, descending as d3Descending } from "d3-array";
import { View } from "../view";
import { Activity } from "./activity";

export class SortColumn extends PropertyExt {
    _view: View;
    _owner: Sort;

    constructor(owner: Sort) {
        super();
        this._view = owner._owner;
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum({
            sortColumn: this.label(),
            descending: this.descending()
        });
    }

    fields(): string[] {
        return this._view.outFields().map(field => field.label);
    }

    field(label: string): IField | undefined {
        return this._view.outFields().filter(field => field.label === label)[0];
    }

    sort(values) {
        return values; // d3Aggr[this.aggrType()](values, leaf => leaf[this.aggrColumn()]);
    }
}
SortColumn.prototype._class += " SortColumn";

export interface SortColumn {
    label(): string;
    label(_: string): SortColumn;
    descending(): boolean;
    descending(_: boolean): SortColumn;
}
SortColumn.prototype.publish("label", null, "set", "Sort Field", function () { return this.fields(); }, { optional: true });
SortColumn.prototype.publish("descending", null, "boolean", "Sort Field");

//  ===========================================================================
export class Sort extends Activity {
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
            Sort: this.column().map(sb => sb.hash())
        });
    }

    validSortBy(): SortColumn[] {
        return this.column().filter(sortBy => sortBy.label());
    }

    exists(): boolean {
        return this.validSortBy().length > 0;
    }

    process(): any[] {
        const data = super.process();
        const sortByArr = [];
        for (const sortBy of this.column()) {
            const sortByField = sortBy.field(sortBy.label());
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

}
Sort.prototype._class += " Sort";

export interface Sort {
    column(): SortColumn[];
    column(_: SortColumn[]): this;
}
Sort.prototype.publish("column", [], "propertyArray", "Source Columns", null, { autoExpand: SortColumn });