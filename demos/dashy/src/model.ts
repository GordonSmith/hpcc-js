import { PropertyExt } from "@hpcc-js/common";
import { IDatasource } from "@hpcc-js/dgrid";
import { Edge, Vertex } from "@hpcc-js/graph";
import { Databomb, LogicalFile, NullDatasource, WUResult } from "./datasource";
import { deserialize as d2 } from "./serialization";
import { NestedView, View, ViewDatasource } from "./view";

export type CDatasource = ViewDatasource | View;
export class Model extends PropertyExt {
    private _datasources: CDatasource[] = [];
    views: Array<View | NestedView> = [];
    private _nullDatasource = new NullDatasource()

    private vertexMap: { [key: string]: Vertex } = {};
    private edgeMap: { [key: string]: Edge } = {};

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

    datasource(label): IDatasource | undefined {
        const retVal = this._datasources.filter(ds => ds.label() === label);
        if (retVal.length) {
            return retVal[0];
        }
        return this._nullDatasource;
    }

    createGraph() {
        const vertices: Vertex[] = this.datasources().concat(this.views as any).map(ds => {
            let retVal: Vertex = this.vertexMap[ds.id()];
            if (!retVal) {
                retVal = new Vertex()
                    .columns(["DS"])
                    .data([[ds]])
                    .text(ds.label())
                    ;
                this.vertexMap[ds.id()] = retVal;
            }
            return retVal;
        });
        const edges: Edge[] = this.views.map(view => {
            const edgeID = `${view.datasource().id()}->${view.id()}`;
            let retVal: Edge = this.edgeMap[edgeID];
            if (!retVal) {
                retVal = new Edge()
                    .sourceVertex(this.vertexMap[view.datasource().id()])
                    .targetVertex(this.vertexMap[view.id()])
                    ;
                this.edgeMap[edgeID] = retVal;
            }
            return retVal;
        });
        return {
            vertices,
            edges
        };
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
