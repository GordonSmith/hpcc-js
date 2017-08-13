import { Result, XSDXMLNode } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { View } from "../view";
import { Activity, schemaRow2IField } from "./activity";

export abstract class ESPResult extends Activity {
    _owner: View;
    protected _result: Result;
    protected _schema: XSDXMLNode[] = [];
    protected _total: number;
    private _data: any[];

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(more: object): string {
        return hashSum({
            url: this.url(),
            samples: this.samples(),
            sampleSize: this.sampleSize(),
            ...more
        });
    }

    abstract _createResult(): Result;

    refreshMetaPromise: Promise<void>;
    refreshMeta(): Promise<void> {
        if (!this.refreshMetaPromise) {
            this.refreshMetaPromise = super.refreshMeta().then(() => {
                this._result = this._createResult();
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

    exec(): Promise<void> {
        return super.exec().then(() => {
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
ESPResult.prototype._class += " Filters";
export interface ESPResult {
    url(): string;
    url(_: string): this;
    samples(): number;
    samples(_: number): this;
    sampleSize(): number;
    sampleSize(_: number): this;
}
ESPResult.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");
ESPResult.prototype.publish("samples", 10, "number", "Number of samples");
ESPResult.prototype.publish("sampleSize", 100, "number", "Sample size");

export class WUResult extends ESPResult {

    constructor(owner: View) {
        super(owner);
    }

    _createResult(): Result {
        return new Result({ baseUrl: this.url() }, this.wuid(), this.resultName());
    }

    hash(more: object): string {
        return super.hash({
            wuid: this.wuid(),
            resultName: this.resultName()
        });
    }

    label(): string {
        return `${this.wuid()}\n${this.resultName()}`;
    }
}
WUResult.prototype._class += " Filters";
export interface WUResult {
    wuid(): string;
    wuid(_: string): this;
    resultName(): string;
    resultName(_: string): this;
}
WUResult.prototype.publish("wuid", "", "string", "Workunit ID");
WUResult.prototype.publish("resultName", "", "string", "Result Name");
