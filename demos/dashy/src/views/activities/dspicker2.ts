import { IField } from "@hpcc-js/dgrid";
import { View } from "../view";
import { Activity, IOptimization } from "./activity";
import { Query } from "./query";
import { WUResult } from "./wuresult";

export enum Type {
    WURESULT = "WU Result",
    //    LOGICALFILE = "Logical File",
    //    DATABOMB = "Databomb",
    QUERY = "Query"
}

export type DatasourceType = Type.WURESULT | /*Type.LOGICALFILE | Type.DATABOMB |*/ Type.QUERY;
const Types = [Type.WURESULT, /*Type.LOGICALFILE, Type.DATABOMB, */Type.QUERY];

export class DSPicker2 extends Activity {
    _view: View;
    protected _wuResult;
    /*
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
    */
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
        /*
                this._logicalFile.monitor((id, newVal, oldVal) => {
                    this.broadcast(id, newVal, oldVal, this._logicalFile);
                });

                this._databomb.monitor((id, newVal, oldVal) => {
                    this.broadcast(id, newVal, oldVal, this._databomb);
                });
        */
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

    exec(opts: IOptimization = {}): Promise<void> {
        return this.details().exec(opts);
    }

    pullData(): any[] {
        return this.details().pullData();
    }
}
DSPicker2.prototype._class += " DSPicker";

export interface DSPicker2 {
    type(): DatasourceType;
    type(_: DatasourceType): this;
    details(): Activity;
    details(_: Activity): this;
}

DSPicker2.prototype.publish("type", Type.WURESULT, "set", "Type", Types as string[]);
DSPicker2.prototype.publish("details", null, "widget", "Data Source");

const _origType = DSPicker2.prototype.type;
DSPicker2.prototype.type = function (_?: DatasourceType) {
    const retVal = _origType.apply(this, arguments);
    if (arguments.length) {
        switch (_) {
            case Type.WURESULT:
                this.details(this._wuResult);
                break;
            /*
            case Type.LOGICALFILE:
                this.details(this._logicalFile);
                break;
            case Type.DATABOMB:
                this.details(this._databomb);
                break;
            */
            case Type.QUERY:
                this.details(this._query);
                break;
        }
    }
    return retVal;
};
