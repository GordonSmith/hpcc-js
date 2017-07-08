import { PropertyExt } from "@hpcc-js/common";
import { Databomb, LogicalFile, WUResult } from "./datasource";
import { deserialize as d2 } from "./serialization";
import { NestedView, View, ViewDatasource } from "./view";

export type CDatasource = ViewDatasource | View;
export class Model extends PropertyExt {
    private _datasources: CDatasource[] = [];
    views: Array<View | NestedView> = [];

    datasources() {
        return [...this._datasources];
    }

    addDatasource(datasource: CDatasource): this {
        this._datasources.push(datasource);
        return this;
    }

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
