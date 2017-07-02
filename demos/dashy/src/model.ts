import { IDatasource, IField } from "@hpcc-js/api";
import { PropertyExt, publish } from "@hpcc-js/common";
import { Result, XSDXMLNode } from "@hpcc-js/comms";
// import { DDLSchema2 } from "@hpcc-js/ddl-shim";
import { deserialize as d2, serializable } from "./serialization";

export class ResultSource extends PropertyExt implements IDatasource {
    _result: Result;
    _total: number = 0;
    _schema: XSDXMLNode[] = [];

    @publish("", "string", "ESP Url (http://x.x.x.x:8010)")
    url: { (): string; (_: string): ResultSource };

    refresh(): Promise<void> {
        return this._result.refresh().then((result) => {
            this._total = result.Total;
            this._schema = result.fields();
        });
    }

    fields(): IField[] {
        return this._schema.map(row => {
            return {
                label: row.name,
                type: row.type,
                children: null
            } as IField;
        });
    }

    sample(samples: number, sampleSize: number): Promise<{ total: number, data: any[] }> {
        return Promise.resolve({ total: 0, data: [] });
    }

    fetch(from: number, count: number): Promise<{ total: number, data: any[] }> {
        return this._result.fetchRows(from, count).then(response => {
            return {
                total: this.total(),
                data: response
            };
        });
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

    label(): string {
        return `${this.wuid()}[${this.resultName()}]`;
    }

    refresh(): Promise<void> {
        this._result = new Result({ baseUrl: this.url() }, this.wuid(), this.resultName());
        return super.refresh();
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
                        label: key,
                        type: typeof row0[key],
                        children: null
                    } as IField);
            }
            return retVal;
        }
        return [];
    }

    sample(samples: number, sampleSize: number): Promise<{ total: number, data: any[] }> {
        return Promise.resolve({ total: 0, data: [] });
    }

    fetch(from: number, count: number): Promise<{ total: number, data: any[] }> {
        return Promise.resolve({
            total: this.total(),
            data: this.payload().filter((row, idx) => idx >= from && idx < from + count)
        });
    }

    total(): number {
        return this.payload().length;
    }
}
Databomb.prototype._class += " Databomb";

export class View extends PropertyExt implements IDatasource {
    @publish(null, "widget", "View")
    datasource: { (): WUResult | LogicalFile | Databomb; (_: WUResult | LogicalFile | Databomb): View };

    refresh(): Promise<void> {
        return this.datasource().refresh();
    }

    label(): string {
        return `View\n${this.datasource().label()}`;
    }

    fields(): IField[] {
        return this.datasource().fields();
    }

    sample(samples: number, sampleSize: number): Promise<{ total: number, data: any[] }> {
        return this.datasource().sample(samples, sampleSize);
    }

    fetch(from: number, count: number): Promise<{ total: number, data: any[] }> {
        return this.datasource().fetch(from, count);
    }

    total(): number {
        return this.datasource().total();
    }
}

export class Model extends PropertyExt {
    datasources: Array<WUResult | LogicalFile | Databomb> = [];
    views: View[] = [];
}
Model.prototype._class += " Model";

export function deserialize(json: string | object) {
    return d2(json, (classID) => {
        switch (classID) {
            case "Model":
                return new Model();
            case "WUResult":
                return new WUResult();
            case "LogicalFile":
                return new LogicalFile();
            case "Databomb":
                return new Databomb();
        }
    });
}
