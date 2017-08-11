import { Result, XSDXMLNode } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { SamplingDatasource } from "./datasource";

export function schemaRow2IField(row: any): IField {
    return {
        id: row.name,
        label: row.name,
        type: row.type,
        children: (row._children && row._children.length) ? row._children.map(schemaRow2IField) : null
    };
}

export abstract class ESPService extends SamplingDatasource {
    hash(): string {
        return hashSum(this.url());
    }
}
ESPService.prototype._class += " ResultSource";
export interface ESPService {
    url(): string;
    url(_: string): this;
}
ESPService.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");

export abstract class ResultService extends ESPService {
    _result: Result;
    _schema: XSDXMLNode[] = [];
    _total: number;

    refresh(): Promise<void> {
        return this._result.refresh().then(result => {
            this._total = result.Total;
            this._schema = result.fields();
        }).catch(e => {
            this._total = 0;
            this._schema = [];
        });
    }

    outFields(): IField[] {
        return this._schema.map(schemaRow2IField);
    }

    protected _fetch(from: number, count: number): Promise<any[]> {
        return this._result
            .fetchRows(from, count)
            .catch(e => {
                return [];
            });
    }

    total(): number {
        return this._total;
    }
}
ResultService.prototype._class += " ResultService";
