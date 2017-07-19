import { publish } from "@hpcc-js/common";
import { Result, XSDXMLNode } from "@hpcc-js/comms";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Datasource } from "./datasource";

function schemaRow2IField(row: any): IField {
    return {
        id: row.name,
        label: row.name,
        type: row.type,
        children: (row._children && row._children.length) ? row._children.map(schemaRow2IField) : null
    };
}

export abstract class ESPResult extends Datasource implements IDatasource {
    _result: Result;
    _schema: XSDXMLNode[] = [];
    _total: number;

    @publish("", "string", "ESP Url (http://x.x.x.x:8010)")
    url: { (): string; (_: string): ESPResult };

    hash(): string {
        return hashSum(this.url());
    }

    abstract label(): string;

    refresh(): Promise<void> {
        return this._result.refresh().then(result => {
            this._total = result.Total;
            this._schema = result.fields();
        }).catch(e => {
            this._total = 0;
            this._schema = [];
        });
    }

    fields(): IField[] {
        return this._schema.map(schemaRow2IField);
    }

    fetch(from: number, count: number): Promise<any[]> {
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
ESPResult.prototype._class += " ResultSource";
