import { IMonitorHandle, PropertyExt } from "@hpcc-js/common";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { hashSum } from "@hpcc-js/util";
import { List, Map } from "immutable";

export type ReferencedFields = {
    inputs: { [activityID: string]: string[] },
    outputs: { [activityID: string]: string[] }
};

export interface IError {
    source: string;
    msg: string;
    hint: string;
}

export abstract class Datasource extends PropertyExt {

    fixInt64(data) {
        if (data.length === 0) return data;
        const int64Fields = this.outFields().filter(field => {
            switch (field.type) {
                case "number":
                    //  Test actual data for integer64 cases.
                    return typeof data[0][field.id] !== "number";
                case "number64":
                    return true;
            }
            return false;
        });
        if (!int64Fields.isEmpty()) {
            return data.map(row => {
                int64Fields.forEach(int64Field => row[int64Field.id] = +row[int64Field.id]);
                return row;
            });
        }
        return data;
    }

    hash(more: object = {}): string {
        return hashSum({
            ...more
        });
    }

    refreshMeta(): Promise<void> {
        return Promise.resolve();
    }

    exists(): boolean {
        return true;
    }

    validate(): IError[] {
        return [];
    }

    label(): string {
        return this.id();
    }

    updatedBy(): string[] {
        return [];
    }

    computeFields(): List<DDL2.IField> {
        return List();
    }

    outFields(): List<DDL2.IField> {
        return this.computeFields();
    }

    localFields(): List<DDL2.IField> {
        return this.outFields();
    }

    fieldOrigin(fieldID: string): Datasource | null {
        if (this.localFields().filter(field => field.id === fieldID).size) {
            return this;
        }
        return null;
    }

    resolveFields(refs: ReferencedFields, fieldIDs: string[]) {
        for (const fieldID of fieldIDs) {
            const fieldOrigin = this.fieldOrigin(fieldID);
            if (fieldOrigin) {
                if (!refs.outputs[fieldOrigin.id()]) {
                    refs.outputs[fieldOrigin.id()] = [];
                }
                if (refs.outputs[fieldOrigin.id()].indexOf(fieldID) < 0) {
                    refs.outputs[fieldOrigin.id()].push(fieldID);
                }
            }
        }
    }

    referencedFields(refs: ReferencedFields): void {
    }

    exec(): Promise<void> {
        return Promise.resolve();
    }

    computeData(): List<Map<any, any>> {
        return List();
    }

    outData(): List<Map<any, any>> {
        return this.computeData();
    }
}

export class DatasourceArray extends Datasource {
    private _datasources: Datasource[] = [];

    datasources(): Datasource[];
    datasources(_: Datasource[]): this;
    datasources(_?: Datasource[]): Datasource[] | this {
        if (!arguments.length) return this._datasources;
        this._datasources = _;
        return this;
    }
}
DatasourceArray.prototype._class += " DatasourceArray";

export class DatasourceSelection extends DatasourceArray {
    private _selection: Datasource;
    private _monitorHandle: IMonitorHandle;

    selection(): Datasource;
    selection(_: Datasource): this;
    selection(_?: Datasource): Datasource | this {
        if (_ === undefined) return this._selection;
        if (this._monitorHandle) {
            this._monitorHandle.remove();
        }
        this._selection = _;
        this._monitorHandle = _.monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, _);
        });
        return this;
    }

    //  Activity overrides ---
    hash(more: { [key: string]: any } = {}): string {
        return hashSum({
            selection: this.selection().hash(),
            ...more
        });
    }

    label(): string {
        return this.selection().label();
    }

    refreshMeta(): Promise<void> {
        return this.selection().refreshMeta();
    }

    updatedBy(): string[] {
        return this.selection().updatedBy();
    }

    outFields(): List<DDL2.IField> {
        return this.selection().outFields();
    }

    localFields(): List<DDL2.IField> {
        return this.selection().localFields();
    }

    fieldOrigin(fieldID: string): Datasource | null {
        return this.selection().fieldOrigin(fieldID);
    }

    referencedFields(refs: ReferencedFields) {
        this.selection().referencedFields(refs);
    }

    resolveFields(refs: ReferencedFields, fieldIDs: string[]) {
        this.selection().resolveFields(refs, fieldIDs);
    }

    exec(): Promise<void> {
        return this.selection().exec();
    }

    outData(): List<Map<any, any>> {
        return this.selection().outData();
    }
}
DatasourceSelection.prototype._class += " DatasourceSelection";
