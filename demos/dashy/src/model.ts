import { PropertyExt } from "@hpcc-js/common";
import { IDatasource } from "@hpcc-js/dgrid";
import { Viz } from "./dashboard/viz";
import { Databomb, NullDatasource } from "./datasources/databomb";
import { DatasourceClass } from "./datasources/dsPicker";
import { LogicalFile } from "./datasources/logicalfile";
import { Workunit } from "./datasources/workunit";
import { WUResult } from "./datasources/wuresult";
import { deserialize as d2 } from "./serialization";
import { NullView } from "./views/nullview";
import { View } from "./views/view";

export type CDatasource = DatasourceClass | View | Workunit;
export class Model extends PropertyExt {
    private _workunits: Workunit[] = [];
    private _datasources: CDatasource[] = [];
    private _nullDatasource = new NullDatasource();
    private _views: View[] = [];
    private _nullView = new NullView(this, "");
    private _visualizations: Viz[] = [];
    private _nullVisualization = new Viz(this, "");

    clear() {
        this._workunits = [];
        this._datasources = [];
        this._views = [];
    }

    workunits() {
        return [...this._workunits];
    }

    addWorkunit(workunit: Workunit): this {
        this._workunits.push(workunit);
        return this;
    }

    datasources() {
        const retVal = [...this._datasources];
        for (const wu of this.workunits()) {
            for (const wuResult of wu.results()) {
                retVal.push(wuResult);
            }
        }
        return retVal;
    }

    addDatasource(datasource: CDatasource): this {
        this._datasources.push(datasource);
        return this;
    }

    datasourceIDs() {
        return this.datasources().map(ds => ds.id());
    }

    datasource(id: string): IDatasource | undefined {
        const retVal = this.datasources().filter(ds => ds.id() === id);
        if (retVal.length) {
            return retVal[0] as IDatasource;
        }
        return this._nullDatasource;
    }

    addView(view: View): this {
        this._views.push(view);
        return this;
    }

    viewIDs() {
        return this._views.map(view => view.id());
    }

    view(id: string): View | undefined {
        const retVal = this._views.filter(view => view.id() === id);
        if (retVal.length) {
            return retVal[0] as View;
        }
        return this._nullView;
    }

    visualizations() {
        return [...this._visualizations];
    }

    visualizationIDs() {
        return this._visualizations.map(viz => viz.id());
    }

    addVisualization(viz: Viz): this {
        this._visualizations.push(viz);
        return this;
    }

    filteredBy(viz: Viz): Viz[] {
        return this._visualizations.filter(otherViz => {
            const filterIDs = otherViz.view().validFilters().map(filter => filter.source());
            return filterIDs.indexOf(viz.id()) >= 0;
        });
    }

    visualization(id: string): Viz {
        const retVal = this.visualizations().filter(ds => ds.id() === id);
        if (retVal.length) {
            return retVal[0];
        }
        return this._nullVisualization;
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
