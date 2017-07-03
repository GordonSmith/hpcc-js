import { PropertyExt, publish } from "@hpcc-js/common";
import { Result, XSDXMLNode } from "@hpcc-js/comms";
import { IDatasource, IField } from "@hpcc-js/dgrid";

function schemaRow2IField(row): IField {
    return {
        id: row.name,
        label: row.name,
        type: row.type,
        children: (row._children && row._children.length) ? row._children.map(schemaRow2IField) : null
    };
}

export class ResultSource extends PropertyExt implements IDatasource {
    _result: Result;
    _schema: XSDXMLNode[] = [];
    _total: number;
    _cache: { [key: string]: Promise<any[]> } = {};

    @publish("", "string", "ESP Url (http://x.x.x.x:8010)")
    url: { (): string; (_: string): ResultSource };

    refresh(): Promise<void> {
        return this._result.refresh().then((result) => {
            this._total = result.Total;
            this._schema = result.fields();
            this._cache = {};
        });
    }

    fields(): IField[] {
        return this._schema.map(schemaRow2IField);
    }

    sample(samples: number, sampleSize: number): Promise<any[]> {
        if (samples * sampleSize >= this.total()) {
            return this.fetch(0, this.total());
        }

        const pages: Array<Promise<any[]>> = [];
        const lastPage = this.total() - sampleSize;
        for (let i = 0; i < samples; ++i) {
            pages.push(this.fetch(Math.floor(i * lastPage / sampleSize), sampleSize));
        }
        return Promise.all(pages).then(responses => {
            let retVal = [];
            for (const response of responses) {
                retVal = retVal.concat(response);
            }
            return retVal;
        });
    }

    fetch(from: number, count: number): Promise<any[]> {
        const cacheID = `${from}->${count}`;
        let retVal = this._cache[cacheID];
        if (!retVal) {
            retVal = this._result.fetchRows(from, count);
            this._cache[cacheID] = retVal;
        }
        return retVal;
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

    _prevUrl: string;
    _prevWuid: string;
    _prevResultName: string;

    label(): string {
        return `${this.wuid()}[${this.resultName()}]`;
    }

    refresh(): Promise<void> {
        if (this._prevUrl !== this.url() || this._prevWuid !== this.wuid() || this._prevResultName !== this.resultName()) {
            this._prevUrl = this.url();
            this._prevWuid = this.wuid();
            this._prevResultName = this.resultName();
            this._result = new Result({ baseUrl: this.url() }, this.wuid(), this.resultName());
            return super.refresh();
        }
        return Promise.resolve();
    }
}
WUResult.prototype._class += " WUResult";

export class LogicalFile extends ResultSource {
    url: { (): string; (_: string): LogicalFile };
    @publish("", "string", "Logical File Name")
    fileName: { (): string; (_: string): LogicalFile };

    label(): string {
        return this.fileName();
    }

    refresh(): Promise<void> {
        this._result = new Result({ baseUrl: this.url() }, this.fileName());
        return super.refresh();
    }
}
LogicalFile.prototype._class += " LogicalFile";

export class Databomb extends PropertyExt implements IDatasource {
    @publish([], "array", "Databomb payload")
    payload: { (): any[]; (_: any[]): Databomb };

    label(): string {
        return "Databomb";
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
