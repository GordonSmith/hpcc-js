import { View } from "../view";
import { Activity, ActivitySelection } from "./activity";
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

export class DSPicker extends ActivitySelection {
    private _view: View;

    constructor(view: View) {
        super();
        this._view = view;
        this.activities([
            new WUResult(this._view)
                .url("http://192.168.3.22:8010")
                .wuid("W20170424-070701")
                .resultName("Result 1")
            ,
            new LogicalFile(this._view)
                .url("http://192.168.3.22:8010")
                .logicalFile("progguide::exampledata::keys::accounts.personid.payload")
            ,
            new Databomb(this._view)
                .payload(sampleData)
            ,
            new Query(this._view)
                .url("http://192.168.3.22:8010")
                .querySet("roxie")
                .queryId("peopleaccounts.1")
                .resultName("Accounts")
        ]);
        this.type(Type.WURESULT);
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
DSPicker.prototype.type = function (this: DSPicker, _?: DatasourceType) {
    const retVal = _origType.apply(this, arguments);
    if (arguments.length) {
        switch (_) {
            case Type.WURESULT:
                this.selection(this.activities()[0]);
                break;
            case Type.LOGICALFILE:
                this.selection(this.activities()[1]);
                break;
            case Type.DATABOMB:
                this.selection(this.activities()[2]);
                break;
            case Type.QUERY:
                this.selection(this.activities()[3]);
                break;
        }
        this.details(this.selection());
    }
    return retVal;
};
