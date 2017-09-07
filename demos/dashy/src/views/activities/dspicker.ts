import { publish } from "@hpcc-js/common";
import { View } from "../view";
import { Activity, ActivitySelection } from "./activity";
import { Databomb, Form } from "./databomb";
import { LogicalFile } from "./logicalfile";
import { HipieService, RoxieService } from "./roxie";
import { sampleData } from "./sampledata";
import { WUResult } from "./wuresult";

export enum Type {
    WURESULT = "WU Result",
    LOGICALFILE = "Logical File",
    ROXIE = "Roxie Service",
    DATABOMB = "Databomb",
    FORM = "Form",
    HIPIE = "HIPIE Service"
}
const Types: string[] = [Type.WURESULT, Type.LOGICALFILE, Type.ROXIE, Type.DATABOMB, Type.FORM, Type.HIPIE];

export class DSPicker extends ActivitySelection {
    private _view: View;

    @publish(Type.WURESULT, "set", "Type", Types as string[])
    _type: Type;
    type(_?: Type): Type | this {
        if (!arguments.length) return this._type;
        this._type = _;
        switch (_) {
            case Type.WURESULT:
                this.selection(this.activities()[0]);
                break;
            case Type.LOGICALFILE:
                this.selection(this.activities()[1]);
                break;
            case Type.ROXIE:
                this.selection(this.activities()[2]);
                break;
            case Type.DATABOMB:
                this.selection(this.activities()[3]);
                break;
            case Type.FORM:
                this.selection(this.activities()[4]);
                break;
            case Type.HIPIE:
                this.selection(this.activities()[5]);
                break;
        }
        this.details(this.selection());
        return this;
    }
    @publish(null, "widget", "Data Source")
    details: publish<this, Activity>;

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
            new RoxieService(this._view)
                .url("http://192.168.3.22:8010")
                .querySet("roxie")
                .queryId("peopleaccounts.2")
                .resultName("Accounts"),
            new Databomb(this._view)
                .payload(sampleData)
            ,
            new Form(this._view)
                .payload({})
            ,
            new HipieService(this._view)
        ]);
        this.type(Type.WURESULT);
    }
}
DSPicker.prototype._class += " DSPicker";
