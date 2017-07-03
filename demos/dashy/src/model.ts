import { PropertyExt } from "@hpcc-js/common";
import { Databomb, LogicalFile, WUResult } from "./datasource";
import { deserialize as d2 } from "./serialization";
import { View } from "./view";

export class Model extends PropertyExt {
    datasources: Array<WUResult | LogicalFile | Databomb> = [];
    views: View[] = [];
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
