import { PropertyExt, publish } from "@hpcc-js/common";
import { Result, XSDXMLNode } from "@hpcc-js/comms";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";

function schemaRow2IField(row): IField {
    return {
        id: row.name,
        label: row.name,
        type: row.type,
        children: (row._children && row._children.length) ? row._children.map(schemaRow2IField) : null
    };
}

export abstract class ResultSource extends PropertyExt implements IDatasource {
    _result: Result;
    _schema: XSDXMLNode[] = [];
    _total: number;

    @publish("", "string", "ESP Url (http://x.x.x.x:8010)")
    url: { (): string; (_: string): ResultSource };

    hash(): string {
        return hashSum(this.url());
    }

    abstract label(): string;

    refresh(): Promise<void> {
        return this._result.refresh().then((result) => {
            this._total = result.Total;
            this._schema = result.fields();
        });
    }

    fields(): IField[] {
        return this._schema.map(schemaRow2IField);
    }

    sample(samples: number, sampleSize: number): Promise<any[]> {
        if (samples * sampleSize >= this.total()) {
            return this.fetch(0, this.total());
        } else {
            const pages: Array<Promise<any[]>> = [];
            const lastPage = this.total() - sampleSize;
            for (let i = 0; i < samples; ++i) {
                pages.push(this.fetch(Math.floor(i * lastPage / sampleSize), sampleSize));
            }
            return Promise.all(pages).then(responses => {
                let retVal2 = [];
                for (const response of responses) {
                    retVal2 = retVal2.concat(response);
                }
                return retVal2;
            });
        }
    }

    fetch(from: number, count: number): Promise<any[]> {
        return this._result.fetchRows(from, count);
    }

    total(): number {
        return this._total;
    }
}
ResultSource.prototype._class += " ResultSource";

export class WUResult extends ResultSource {
    url: { (): string; (_: string): WUResult };
    @publish("", "string", "Workunit ID")
    wuid: { (): string; (_: string): WUResult };
    @publish("", "string", "Result Name")
    resultName: { (): string; (_: string): WUResult };

    _prevHash: string;

    label(): string {
        return `${this.wuid()}[${this.resultName()}]`;
    }

    hash(): string {
        return hashSum({ url: this.url(), wuid: this.wuid(), resultName: this.resultName() });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();
            this._result = new Result({ baseUrl: this.url() }, this.wuid(), this.resultName());
            this.refreshPromise = super.refresh();
        }
        return this.refreshPromise;
    }
}
WUResult.prototype._class += " WUResult";

export class LogicalFile extends ResultSource {
    url: { (): string; (_: string): LogicalFile };
    @publish("", "string", "Logical File Name")
    fileName: { (): string; (_: string): LogicalFile };

    _prevHash;

    label(): string {
        return this.fileName();
    }

    hash(): string {
        return hashSum({ url: this.url(), fileName: this.fileName() });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();
            this._result = new Result({ baseUrl: this.url() }, this.fileName());
            this.refreshPromise = super.refresh();
        }
        return this.refreshPromise;
    }
}
LogicalFile.prototype._class += " LogicalFile";

export class Databomb extends PropertyExt implements IDatasource {
    @publish([], "array", "Databomb payload")
    payload: { (): any[]; (_: any[]): Databomb };

    label(): string {
        return "Databomb";
    }

    hash(): string {
        return hashSum({ label: this.label() });
    }

    refresh(): Promise<void> {
        return Promise.resolve();
    }

    fields(): IField[] {
        if (this.payload().length) {
            const retVal: IField[] = [];
            const row0 = this.payload()[0];
            for (const key in row0) {
                retVal.push(
                    {
                        id: key,
                        label: key,
                        type: typeof row0[key],
                        children: null
                    });
            }
            return retVal;
        }
        return [];
    }

    sample(samples: number, sampleSize: number): Promise<any[]> {
        return Promise.resolve([]);
    }

    fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve(this.payload().filter((row, idx) => idx >= from && idx < from + count));
    }

    total(): number {
        return this.payload().length;
    }
}
Databomb.prototype._class += " Databomb";
