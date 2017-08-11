import { IField } from "@hpcc-js/dgrid";
import { Databomb } from "../../datasources/databomb";
import { Form } from "../../datasources/form";
import { LogicalFile } from "../../datasources/logicalfile";
import { Query } from "../../datasources/query";
import { WUResult } from "../../datasources/wuresult";
import { Activity, IOptimization } from "./activity";

export {
    WUResult,
    LogicalFile,
    Databomb
};

export enum Type {
    WURESULT = "WU Result",
    LOGICALFILE = "Logical File",
    DATABOMB = "Databomb",
    QUERY = "Query"
}

export type DatasourceType = Type.WURESULT | Type.LOGICALFILE | Type.DATABOMB | Type.QUERY;
export type DatasourceClass = WUResult | LogicalFile | Databomb | Form | Query;
const Types = [Type.WURESULT, Type.LOGICALFILE, Type.DATABOMB, Type.QUERY];

export interface IDatasource {
}

export class DSPicker extends Activity {
    protected _wuResult = new WUResult()
        .url("http://192.168.3.22:8010")
        .wuid("W20170424-070701")
        .resultName("Result 1")
    ;
    protected _logicalFile = new LogicalFile()
        .url("http://192.168.3.22:8010")
        .filename("progguide::exampledata::keys::accounts.personid.payload")
    ;
    protected _databomb = new Databomb()
        .payload([
            { state: "AL", weight: 100 },
            { state: "CA", weight: 100 },
            { state: "FL", weight: 100 },
            { state: "NY", weight: 100 }
        ])
    ;
    protected _query = new Query()
        .url("http://192.168.3.22:8010")
        .querySet("roxie")
        .queryId("peopleaccounts.1")
        .resultName("Accounts")
    ;
    _prevHash;
    _dataPromise: Promise<void>;
    _data: any[] = [];

    constructor() {
        super();
        this.details(this._wuResult);

        this._wuResult.monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this._wuResult);
        });

        this._logicalFile.monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this._logicalFile);
        });

        this._databomb.monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this._databomb);
        });

        this._query.monitor((id, newVal, oldVal) => {
            this.broadcast(id, newVal, oldVal, this._query);
        });
    }

    hash(): string {
        return this.details().hash();
    }

    outFields(): IField[] {
        return this.details().outFields();
    }

    pullData(): any[] {
        return this._data;
    }

    exec(opts: IOptimization = {}): Promise<void> {
        if (this._prevHash !== this.details().hash()) {
            this._prevHash = this.details().hash();
            delete this._data;
            this._dataPromise = this.details().fetch(0, Number.MAX_VALUE).then(data => {
                this._data = data;
            });
        }
        return this._dataPromise;
    }
}
DSPicker.prototype._class += " DSPicker";

export interface DSPicker {
    type(): DatasourceType;
    type(_: DatasourceType): this;
    details(): DatasourceClass;
    details(_: DatasourceClass): this;
}

DSPicker.prototype.publish("type", Type.WURESULT, "set", "Type", Types as string[]);
DSPicker.prototype.publish("details", null, "widget", "Data Source");

const _origType = DSPicker.prototype.type;
DSPicker.prototype.type = function (_?: DatasourceType) {
    const retVal = _origType.apply(this, arguments);
    if (arguments.length) {
        switch (_) {
            case Type.WURESULT:
                this.details(this._wuResult);
                break;
            case Type.LOGICALFILE:
                this.details(this._logicalFile);
                break;
            case Type.DATABOMB:
                this.details(this._databomb);
                break;
            case Type.QUERY:
                this.details(this._query);
                break;
        }
    }
    return retVal;
};
