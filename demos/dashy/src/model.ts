import { PropertyExt } from "@hpcc-js/common";
import { IDatasource } from "@hpcc-js/dgrid";
import { Edge, Vertex } from "@hpcc-js/graph";
import { Databomb, NullDatasource } from "./datasources/databomb";
import { LogicalFile } from "./datasources/logicalfile";
import { WUResult } from "./datasources/wuresult";
import { deserialize as d2 } from "./serialization";
import { NullView } from "./views/nullview";
import { View, ViewDatasource } from "./views/view";

export type CDatasource = ViewDatasource | View;
export class Model extends PropertyExt {
    private _datasources: CDatasource[] = [];
    private _nullDatasource = new NullDatasource();
    private _views: View[] = [];
    private _nullView = new NullView(this, "");

    private vertexMap: { [key: string]: Vertex } = {};
    private edgeMap: { [key: string]: Edge } = {};

    datasources() {
        return [...this._datasources];
    }

    addDatasource(datasource: CDatasource): this {
        this._datasources.push(datasource);
        return this;
    }

    datasourceIDs() {
        return this._datasources.map(ds => ds.id());
    }

    datasource(id: string): IDatasource | undefined {
        const retVal = this._datasources.filter(ds => ds.id() === id);
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

    createGraph() {
        const vertices: Vertex[] = this.datasources().concat(this._views as any).map(ds => {
            let retVal: Vertex = this.vertexMap[ds.id()];
            if (!retVal) {
                retVal = new Vertex()
                    .columns(["DS"])
                    .data([[ds]])
                    .icon_shape_diameter(0)
                    ;
                this.vertexMap[ds.id()] = retVal;
            }
            retVal.text(`[${ds.id()}]\n${ds.label()}`);
            retVal.getBBox(true);
            return retVal;
        });
        const edges: Edge[] = [];
        this._views.forEach(view => {
            const dsEdgeID = `${view.datasource().id()}->${view.id()}`;
            let dsEdge: Edge = this.edgeMap[dsEdgeID];
            if (!dsEdge) {
                dsEdge = new Edge()
                    .sourceVertex(this.vertexMap[view.datasource().id()])
                    .targetVertex(this.vertexMap[view.id()])
                    ;
                this.edgeMap[dsEdgeID] = dsEdge;
            }
            edges.push(dsEdge);
            view.filters().forEach(filter => {
                if (filter.source()) {
                    const filterView = this.view(filter.source());
                    const filterEdgeID = `${filterView.id()}->${view.id()}`;
                    let filterEdge: Edge = this.edgeMap[filterEdgeID];
                    if (!filterEdge) {
                        filterEdge = new Edge()
                            .sourceVertex(this.vertexMap[filterView.id()])
                            .targetVertex(this.vertexMap[view.id()])
                            .strokeDasharray("1,5")
                            ;
                        this.edgeMap[filterEdgeID] = filterEdge;
                    }
                    filterEdge.text("Sel:");
                    edges.push(filterEdge);
                }
            });
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
