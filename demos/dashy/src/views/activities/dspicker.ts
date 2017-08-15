import { IField } from "@hpcc-js/dgrid";
import { View } from "../view";
import { Activity } from "./activity";
import { Databomb } from "./databomb";
import { LogicalFile } from "./logicalfile";
import { Query } from "./query";
import { sampleData } from "./sampledata";
import { WUResult } from "./wuresult";

export enum Type {
    WURESULT = "WU Result",
    LOGICALFILE = "Logical File",
    DATABOMB = "Databomb",
    QUERY = "Query"
}

export type DatasourceType = Type.WURESULT | Type.LOGICALFILE | Type.DATABOMB | Type.QUERY;
const Types = [Type.WURESULT, Type.LOGICALFILE, Type.DATABOMB, Type.QUERY];

export class DSPicker extends Activity {
    _view: View;
    protected _wuResult;
    protected _logicalFile;
    protected _databomb;
    protected _query: Query;
    _prevHash;

    constructor(view: View) {
        super();
        this._view = view;
        this._wuResult = new WUResult(this._view)
            .url("http://192.168.3.22:8010")
            .wuid("W20170424-070701")
            .resultName("Result 1")
            ;
        this._logicalFile = new LogicalFile(this._view)
            .url("http://192.168.3.22:8010")
            .logicalFile("progguide::exampledata::keys::accounts.personid.payload")
            ;
        this._databomb = new Databomb(this._view)
            .payload(sampleData)
            ;
        this._query = new Query(this._view)
            .url("http://192.168.3.22:8010")
            .querySet("roxie")
            .queryId("peopleaccounts.1")
            .resultName("Accounts")
            ;
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

    updatedBy(): string[] {
        return this.details().updatedBy();
    }

    label(): string {
        return this.details().label();
    }

    refreshMeta(): Promise<void> {
        return super.refreshMeta().then(() => {
            return this.details().refreshMeta();
        });
    }

    outFields(): IField[] {
        return this.details().outFields();
    }

    exec(): Promise<void> {
        return this.details().exec();
    }

    pullData(): object[] {
        return this.details().pullData();
    }
}
DSPicker.prototype._class += " DSPicker";

export interface DSPicker {
    type(): DatasourceType;
    type(_: DatasourceType): this;
    details(): Activity;
    details(_: Activity): this;
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
