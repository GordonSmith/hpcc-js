import { PropertyExt } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Model } from "../model";
import { DatasourceClass, DSPicker } from "./activities/dspicker";
import { Filters } from "./activities/filter";
import { GroupBy } from "./activities/groupby";
import { Limit } from "./activities/limit";
import { Sort } from "./activities/sort";

let viewID = 0;
export class View extends PropertyExt implements IDatasource {
    _source: string = "42";
    _model: Model;
    private _total = 0;
    _prevHash;

    constructor(model: Model, label: string = "View") {
        super();
        this._model = model;
        this.label(label);
        this._id = "v" + viewID++;
        this.dataSource(new DSPicker());
        this.dataSource().monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this.dataSource());
        });
        this.filters(new Filters(this).sourceActivity(this.dataSource()));
        this.groupBy(new GroupBy(this).sourceActivity(this.filters()));
        this.sort(new Sort(this).sourceActivity(this.groupBy()));
        this.limit(new Limit(this).sourceActivity(this.sort()));
    }

    datasource(): DatasourceClass {
        return this.dataSource().details() as DatasourceClass;
    }

    columns() {
        return (this.datasource().outFields() as IField[]).map(field => {
            return field.id;
        });
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
            filter: this.filters().hash(),
            groupBy: this.groupBy().hash(),
            ...more
        });
    }

    refresh(): Promise<void> {
        return this.datasource().refresh().then(() => {
            if (this._prevHash !== this.hash()) {
                this._prevHash = this.hash();
            }
        });
    }

    total(): number {
        return this._total;
    }

    inFields(): IField[] {
        return this.datasource().outFields();
    }

    outFields(): IField[] {
        return this.limit().outFields();
    }

    async fetch(from: number = 0, count: number = Number.MAX_VALUE): Promise<any[]> {
        await this.limit().exec();
        const data = this.limit().pullData();
        this._total = data.length;
        return data.slice(from, from + count);
        /*
                return this.datasource().fetch(0, Number.MAX_VALUE).then(data => {
                    this._sourceActivity._data = data;
                    data = this.limit().process();
                    this._total = data.length;
                    return data.slice(from, from + count);
                });
            }
            */
    }
}
View.prototype._class += " View";

export interface View {
    label(): string;
    label(_: string): this;
    dataSource(): DSPicker;
    dataSource(_: DSPicker): this;
    filters(): Filters;
    filters(_: Filters): this;
    groupBy(): GroupBy;
    groupBy(_: GroupBy): this;
    sort(): Sort;
    sort(_: Sort): this;
    limit(): Limit;
    limit(_: Limit): this;
}
View.prototype.publish("label", null, "string", "Label");
View.prototype.publish("dataSource", null, "widget", "Data Source");
View.prototype.publish("filters", null, "widget", "Filters");
View.prototype.publish("groupBy", null, "widget", "Group By");
View.prototype.publish("sort", null, "widget", "Source Columns");
View.prototype.publish("limit", null, "widget", "Limit output");
