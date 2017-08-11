import { Query as CommsQuery, XSDXMLNode } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { IOptimization } from "../views/activities/activity";
import { Datasource } from "./datasource";
import { schemaRow2IField } from "./espservice";

export class Query extends Datasource {
    private _query: CommsQuery;
    private _responseSchema: XSDXMLNode[] = [];
    private _prevHash: string;

    constructor() {
        super();
    }

    label(): string {
        return `${super.label()}\n${this.queryId()}`;
    }

    hash(): string {
        return hashSum({
            url: this.url(),
            querySet: this.querySet(),
            queryId: this.queryId(),
            resultName: this.resultName()
        });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();
            this.refreshPromise = CommsQuery.attach({ baseUrl: this.url() }, this.querySet(), this.queryId()).then(query => {
                this._query = query;
                this._responseSchema = this._query.fields(this.resultName());
            });
        }
        return this.refreshPromise;
    }

    outFields(): IField[] {
        return this._responseSchema.map(schemaRow2IField);
    }

    async query(opts: IOptimization): Promise<any[]> {
        const request = {};
        if (opts.filters) {
            for (const filter of opts.filters) {
                if (filter.rule === "==") {
                    request[filter.fieldid] = filter.value;
                }
            }
        }
        const results = await this._query.submit(request);
        return results[this.resultName()];
    }

    protected async _fetch(from: number, count: number): Promise<any[]> {
        const results = await this._query.submit({});
        return results[this.resultName()];
    }

    total(): number {
        return 0;
    }
}
Query.prototype._class += " Query";

export interface Query {
    url(): string;
    url(_: string): this;
    querySet(): string;
    querySet(_: string): this;
    queryId(): string;
    queryId(_: string): this;
    resultName(): string;
    resultName(_: string): this;
}
Query.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");
Query.prototype.publish("querySet", "", "string", "Query Set");
Query.prototype.publish("queryId", "", "string", "Query ID");
Query.prototype.publish("resultName", "", "string", "Result Name");
