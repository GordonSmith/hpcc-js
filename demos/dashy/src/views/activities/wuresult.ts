import { Result, XSDXMLNode } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { schemaRow2IField } from "../../datasources/espservice";
import { View } from "../view";
import { Activity, IOptimization } from "./activity";

export class WUResult extends Activity {
    _owner: View;
    private _result: Result;
    private _schema: XSDXMLNode[] = [];
    private _total: number;
    private _data: any[];

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum({
            url: this.url(),
            wuid: this.wuid(),
            resultName: this.resultName(),
            samples: this.samples(),
            sampleSize: this.sampleSize()
        });
    }

    label(): string {
        return `${this.wuid()}\n${this.resultName()}`;
    }

    refreshMetaPromise: Promise<void>;
    refreshMeta(): Promise<void> {
        if (!this.refreshMetaPromise) {
            this.refreshMetaPromise = super.refreshMeta().then(() => {
                this._result = new Result({ baseUrl: this.url() }, this.wuid(), this.resultName());
                return this._result.refresh();
            }).then(result => {
                this._total = result.Total;
                this._schema = result.fields();
            }).catch(e => {
                this._total = 0;
                this._schema = [];
            });
        }
        return this.refreshMetaPromise;
    }

    filterFields(): IField[] {
        if (this._result) {
            const responseSchema = this._result.fields();
            return responseSchema.map(schemaRow2IField);
        }
        return [];
    }

    outFields(): IField[] {
        if (this._result) {
            const responseSchema = this._result.fields();
            return responseSchema.map(schemaRow2IField);
        }
        return [];
    }

    exec(opts: IOptimization = {}): Promise<void> {
        return super.exec(opts).then(() => {
            return this.sample();
        }).then(response => {
            this._data = response;
        }).catch(e => {
            this._data = [];
        });
    }

    pullData(): any[] {
        return this._data;
    }

    total(): number {
        return this._total;
    }

    //  ---
    async fetch(from: number, count: number): Promise<any[]> {
        if (count > this.samples() * this.sampleSize()) {
            return this.sample();
        }
        return this._fetch(from, count);
    }

    private _fetch(from: number, count: number): Promise<any[]> {
        return this._result
            .fetchRows(from, count)
            .catch(e => {
                return [];
            });
    }

    private sample(samples: number = this.samples(), sampleSize: number = this.sampleSize()): Promise<any[]> {
        const pages: Array<Promise<any[]>> = [];
        const lastPage = this.total() - sampleSize;
        for (let i = 0; i < samples; ++i) {
            pages.push(this._fetch(Math.floor(i * lastPage / sampleSize), sampleSize));
        }
        return Promise.all(pages).then(responses => {
            let retVal2: any[] = [];
            for (const response of responses) {
                retVal2 = retVal2.concat(response);
            }
            return retVal2;
        });
    }
}
WUResult.prototype._class += " Filters";
export interface WUResult {
    url(): string;
    url(_: string): this;
    wuid(): string;
    wuid(_: string): this;
    resultName(): string;
    resultName(_: string): this;
    samples(): number;
    samples(_: number): this;
    sampleSize(): number;
    sampleSize(_: number): this;
}
WUResult.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");
WUResult.prototype.publish("wuid", "", "string", "Workunit ID");
WUResult.prototype.publish("resultName", "", "string", "Result Name");
WUResult.prototype.publish("samples", 10, "number", "Number of samples");
WUResult.prototype.publish("sampleSize", 100, "number", "Sample size");
