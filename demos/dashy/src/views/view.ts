import { PropertyExt } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Model } from "../model";
import { DatasourceClass, DSPicker } from "./activities/dspicker";
import { DSPicker2 } from "./activities/dspicker2";
import { Filters } from "./activities/filter";
import { GroupBy } from "./activities/groupby";
import { Limit } from "./activities/limit";
import { Sort } from "./activities/sort";

let viewID = 0;
export class View extends PropertyExt implements IDatasource {
    _model: Model;
    private _total = 0;

    constructor(model: Model, label: string = "View") {
        super();
        this._model = model;
        this.label(label);
        this._id = "v" + viewID++;
        this.dataSource(new DSPicker());
        this.dataSource().monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this.dataSource());
        });
        this.dataSource2(new DSPicker2(this));
        this.dataSource2().monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this.dataSource());
        });
        this.clientFilters(new Filters(this).sourceActivity(this.dataSource2()));
        this.groupBy(new GroupBy(this).sourceActivity(this.clientFilters()));
        this.sort(new Sort(this).sourceActivity(this.groupBy()));
        this.limit(new Limit(this).sourceActivity(this.sort()));
    }

    rawDatasource(): DatasourceClass {
        return this.dataSource().details();
    }

    columns() {
        return (this.rawDatasource().outFields() as IField[]).map(field => {
            return field.id;
        });
    }

    field(fieldID: string): IField | null {
        for (const field of this.rawDatasource().outFields()) {
            if (field.id === fieldID) {
                return field;
            }
        }
        return null;
    }

    hash(more: { [key: string]: any } = {}): string {
        return hashSum({
            datasource: this.rawDatasource().hash(),
            filter: this.clientFilters().hash(),
            groupBy: this.groupBy().hash(),
            ...more
        });
    }

    async refresh(): Promise<void> {
        await this.rawDatasource().refresh();
        return this.limit().refreshMeta();
    }

    total(): number {
        return this._total;
    }

    inFields(): IField[] {
        return this.rawDatasource().outFields();
    }

    outFields(): IField[] {
        return this.limit().outFields();
    }

    async fetch(from: number = 0, count: number = Number.MAX_VALUE): Promise<any[]> {
        await this.limit().exec();
        const data = this.limit().pullData();
        this._total = data.length;
        return data.slice(from, from + count);
    }
}
View.prototype._class += " View";

export interface View {
    label(): string;
    label(_: string): this;
    dataSource(): DSPicker;
    dataSource(_: DSPicker): this;
    dataSource2(): DSPicker2;
    dataSource2(_: DSPicker2): this;
    clientFilters(): Filters;
    clientFilters(_: Filters): this;
    groupBy(): GroupBy;
    groupBy(_: GroupBy): this;
    sort(): Sort;
    sort(_: Sort): this;
    limit(): Limit;
    limit(_: Limit): this;
}
View.prototype.publish("label", null, "string", "Label");
View.prototype.publish("dataSource", null, "widget", "Data Source");
View.prototype.publish("dataSource2", null, "widget", "Data Source 2");
View.prototype.publish("clientFilters", null, "widget", "Client Filters");
View.prototype.publish("groupBy", null, "widget", "Group By");
View.prototype.publish("sort", null, "widget", "Source Columns");
View.prototype.publish("limit", null, "widget", "Limit output");
