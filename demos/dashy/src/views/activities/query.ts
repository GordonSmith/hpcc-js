import { PropertyExt } from "@hpcc-js/common";
import { Query as CommsQuery } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { compare, hashSum } from "@hpcc-js/util";
import { Viz } from "../../dashboard/viz";
import { schemaRow2IField } from "../../datasources/espservice";
import { View } from "../view";
import { Activity, IOptimization } from "./activity";

export class Param extends PropertyExt {
    _view: View;
    _owner: Query;

    constructor(owner) {
        super();
        this._view = owner._owner;
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash() {
        return hashSum({
            label: this.label(),
            source: this.source(),
            sourceField: this.sourceField(),
        });
    }

    sourceFields() {
        return this.sourceOutFields().map(field => field.label);
    }

    sourceViz(): Viz {
        return this._view._model.visualization(this.source());
    }

    sourceOutFields(): IField[] {
        return this.sourceViz().toIDatasource().outFields();
    }

    sourceSelection(): any[] {
        return this.sourceViz().state().selection();
    }

    exists(): boolean {
        return this.label_exists() && this.source_exists() && this.sourceField_exists();
    }
}
Param.prototype._class += " ColumnMapping";
export interface Param {
    label(): string;
    label(_: string): this;
    label_exists(): boolean;
    source(): string;
    source(_: string): this;
    source_exists(): boolean;
    sourceField(): string;
    sourceField(_: string): this;
    sourceField_exists(): boolean;
}
Param.prototype.publish("label", null, "string", "Label");
Param.prototype.publish("source", null, "set", "Datasource", function () { return this._view._model.visualizationIDs(); }, { optional: true });
Param.prototype.publish("sourceField", null, "set", "Source Fields", function () { return this.sourceFields(); }, { optional: true });

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

    sourceHash(): string {
        return hashSum({
            url: this.url(),
            querySet: this.querySet(),
            queryId: this.queryId()
        });
    }

    hash(): string {
        return hashSum({
            source: this.sourceHash(),
            params: this.params().map(param => param.hash())
        });
    }

    label(): string {
        return `${this.queryId()}\n${this.resultName()}`;
    }

    validParams() {
        return this.params().filter(param => param.exists());
    }

    private _prevSourceHash;
    private refreshMetaPromise: Promise<void>;
    refreshMeta(): Promise<void> {
        if (this._prevSourceHash !== this.sourceHash()) {
            this._prevSourceHash = this.sourceHash();
            delete this.refreshMetaPromise;
        }
        if (!this.refreshMetaPromise) {
            this.refreshMetaPromise = super.refreshMeta().then(() => {
                return CommsQuery.attach({ baseUrl: this.url() }, this.querySet(), this.queryId());
            }).then((query) => {
                this._query = query;
                const oldParams = this.params();
                const diffs = compare(oldParams.map(p => p.label()), this.filterFields().map(ff => ff.label));
                const newParams = oldParams.filter(op => diffs.both.indexOf(op.label()) > 0);
                this.params(newParams.concat(diffs.other.map(label => new Param(this).label(label))));
            });
        }
        return this.refreshMetaPromise;
    }

    updatedBy(): string[] {
        return this.validParams().map(param => param.source());
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
            for (const param of this.validParams()) {
                const sourceSelection = param.sourceSelection();
                if (sourceSelection.length) {
                    request[param.label()] = sourceSelection[0][param.sourceField()];
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
    params(): Param[];
    params(_: Param[]): this;
}
Query.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");
Query.prototype.publish("querySet", "", "string", "Query Set");
Query.prototype.publish("queryId", "", "string", "Query ID");
Query.prototype.publish("resultName", "", "string", "Result Name");
Query.prototype.publish("params", [], "propertyArray", "Request Fields");
