import { Query as CommsQuery } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { schemaRow2IField } from "../../datasources/espservice";
import { View } from "../view";
import { Activity, IOptimization } from "./activity";
import { Filter } from "./filter";

export class Query extends Activity {
    _owner: View;
    private _query: CommsQuery;
    private _data: any[];

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum(this.validFilters().map(filter => filter.hash()));
    }

    validFilters(): Filter[] {
        return this.filter().filter(filter => filter.source());
    }

    exists(): boolean {
        return this.validFilters().length > 0;
    }

    appendFilter(source: View, mappings: [{ remoteField: string, localField: string }]): this {
        this.filter().push(new Filter(this)
            .source(source.id())
            .appendMappings(mappings));
        return this;
    }

    refreshMetaPromise: Promise<void>;
    refreshMeta(): Promise<void> {
        if (!this.refreshMetaPromise) {
            this.refreshMetaPromise = super.refreshMeta().then(() => {
                return CommsQuery.attach({ baseUrl: this.url() }, this.querySet(), this.queryId());
            }).then((query) => {
                this._query = query;
            });
        }
        return this.refreshMetaPromise;
    }

    filterFields(): IField[] {
        if (this._query) {
            const responseSchema = this._query.requestFields();
            return responseSchema.map(schemaRow2IField);
        }
        return [];
    }

    outFields(): IField[] {
        if (this._query) {
            const responseSchema = this._query.fields(this.resultName());
            return responseSchema.map(schemaRow2IField);
        }
        return [];
    }

    exec(opts: IOptimization = {}): Promise<void> {
        return super.exec(opts).then(() => {
            const request = {};
            for (const filter of this.validFilters()) {
                const sourceSelection = filter.sourceSelection();
                if (sourceSelection.length) {
                    for (const mapping of filter.mappings()) {
                        request[mapping.localField()] = sourceSelection[0][mapping.remoteField()];
                    }
                }
            }
            return this._query.submit(request);
        }).then(response => {
            this._data = response[this.resultName()];
        });
    }

    pullData(): any[] {
        return this._data;
    }
}
Query.prototype._class += " Filters";
export interface Query {
    url(): string;
    url(_: string): this;
    querySet(): string;
    querySet(_: string): this;
    queryId(): string;
    queryId(_: string): this;
    resultName(): string;
    resultName(_: string): this;
    filter(): Filter[];
    filter(_: Filter[]): this;
}
Query.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");
Query.prototype.publish("querySet", "", "string", "Query Set");
Query.prototype.publish("queryId", "", "string", "Query ID");
Query.prototype.publish("resultName", "", "string", "Result Name");
Query.prototype.publish("filter", [], "propertyArray", "Filter", null, { autoExpand: Filter });
