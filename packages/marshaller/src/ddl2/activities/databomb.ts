import { publish } from "@hpcc-js/common";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { csvParse as d3CsvParse, tsvParse as d3TsvParse } from "d3-dsv";
import { Activity } from "./activity";
import { immData, ImmData, ImmDB, immDB, ImmFields, immFields } from "./immutable";

export class Databomb extends Activity {

    private _label: string = "Databomb";
    private _jasonData: ImmData = immData();

    constructor(label: string) {
        super();
        this._label = label;
    }

    updateJsonData() {
        try {
            switch (this.format()) {
                case "csv":
                    this._jasonData = immData(d3CsvParse(this.payload()));
                    break;
                case "tsv":
                    this._jasonData = immData(d3TsvParse(this.payload()));
                    break;
                case "json":
                default:
                    this._jasonData = immData(JSON.parse(this.payload()));
                    break;
            }
        } catch (e) {
            this._jasonData = immData();
        }
    }

    hash(more: object): string {
        return super.hash({
            payload: this._jasonData.hashCode(),
            ...more
        });
    }

    refreshMeta(): Promise<void> {
        return Promise.resolve();
    }

    label(): string {
        return this._label;
    }

    fieldsFunc(): (inFields: ImmFields) => ImmFields {
        return (inFields: ImmFields) => {
            if (this._jasonData.isEmpty()) return immFields();
            const row0 = this._jasonData.first().toJS();
            const retVal: DDL2.IField[] = [];
            for (const key in row0) {
                retVal.push({
                    id: key,
                    type: typeof row0[key] as DDL2.IFieldType
                });
            }
            return immFields(retVal);
        };
    }

    exec(): Promise<void> {
        return Promise.resolve();
    }

    dataFunc(): (inDB: ImmDB) => ImmDB {
        return (inDB: ImmDB) => immDB(inDB.fields, this._jasonData);
    }

    //  ===
    total(): number {
        return this._jasonData.size;
    }
}
Databomb.prototype._class += " Databomb";

export interface Databomb {
    format(): "json" | "csv" | "tsv";
    format(_: "json" | "csv" | "tsv"): this;
    payload(): string;
    payload(_: string): this;
}

Databomb.prototype.publish("format", "json", "set", "Databomb Format", ["json", "csv", "tsv"]);
Databomb.prototype.publish("payload", "", "string", "Databomb array", null, { multiline: true, tags: [] });

const payloadFormat = Databomb.prototype.format;
Databomb.prototype.format = function (this: Databomb, _?) {
    const retVal = payloadFormat.apply(this, arguments);
    if (arguments.length) {
        this.updateJsonData();
    }
    return retVal;
};

const payloadOrig = Databomb.prototype.payload;
Databomb.prototype.payload = function (this: Databomb, _?) {
    const retVal = payloadOrig.apply(this, arguments);
    if (arguments.length) {
        this.updateJsonData();
    }
    return retVal;
};

export class Form extends Activity {
    @publish({}, "object", "Form object")
    payload: publish<this, object>;

    constructor() {
        super();
    }

    hash(more: object): string {
        return super.hash({
            // payload: this.payload(),
            ...more
        });
    }

    refreshMeta(): Promise<void> {
        return Promise.resolve();
    }

    label(): string {
        return "Form";
    }

    fieldsFunc(): (inFields: ImmFields) => ImmFields {
        return (inFields: ImmFields) => {
            const retVal: DDL2.IField[] = [];
            const row0: any = this.payload();
            for (const key in row0) {
                retVal.push(
                    {
                        id: key,
                        type: typeof row0[key] as DDL2.IFieldType,
                        default: row0[key]
                    });
            }
            return immFields(retVal);
        };
    }

    exec(): Promise<void> {
        return Promise.resolve();
    }

    dataFunc(): (inDB: ImmDB) => ImmDB {
        return (inDB: ImmDB) => {
            return immDB(inDB.fields, [this.payload()]);
        };
    }

    //  ===
    total(): number {
        return 1;
    }
}
Form.prototype._class += " Form";
