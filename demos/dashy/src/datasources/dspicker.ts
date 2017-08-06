import { PropertyExt } from "@hpcc-js/common";
import { Databomb } from "../datasources/databomb";
import { LogicalFile } from "../datasources/logicalfile";
import { WUResult } from "../datasources/wuresult";

export {
    WUResult,
    LogicalFile,
    Databomb
};

export enum Type {
    WURESULT = "WU Result",
    LOGICALFILE = "Logical File",
    DATABOMB = "Databomb"
}

export type DatasourceType = Type.WURESULT | Type.LOGICALFILE | Type.DATABOMB;
export type DatasourceClass = WUResult | LogicalFile | Databomb;
const Types = [Type.WURESULT, Type.LOGICALFILE, Type.DATABOMB];

export class DSPicker extends PropertyExt {
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
        }
    }
    return retVal;
};
