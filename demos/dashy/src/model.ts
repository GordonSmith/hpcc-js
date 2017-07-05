import { PropertyExt } from "@hpcc-js/common";
import { Databomb, LogicalFile, WUResult } from "./datasource";
import { deserialize as d2 } from "./serialization";
import { NestedView, View } from "./view";

export class Model extends PropertyExt {
    _datasources: Array<WUResult | LogicalFile | Databomb> = [];
    views: Array<View | NestedView> = [];

    datasourceLabels() {
        return this._datasources.map(ds => ds.label());
    }

    datasource(label) {
        return this._datasources.filter(ds => ds.label() === label)[0];
    }
}
Model.prototype._class += " Model";

export function deserialize(json: string | object) {
    return d2(json, (classID) => {
        switch (classID) {
            case "Model":
                return new Model();
            case "WUResult":
                return new WUResult();
            case "LogicalFile":
                return new LogicalFile();
            case "Databomb":
                return new Databomb();
        }
    });
}
