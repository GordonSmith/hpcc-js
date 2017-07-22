import { PropertyExt, Surface, Widget } from "@hpcc-js/common";
import { IDatasource } from "@hpcc-js/dgrid";
import { Edge, IGraphData, Lineage, Vertex } from "@hpcc-js/graph";
import { Databomb, NullDatasource } from "./datasources/databomb";
import { LogicalFile } from "./datasources/logicalfile";
import { WUResult } from "./datasources/wuresult";
import { deserialize as d2 } from "./serialization";
import { FlatView } from "./views/flatview";
import { NullView } from "./views/nullview";
import { View, ViewDatasource } from "./views/view";

export type CDatasource = ViewDatasource | View;
export class Model extends PropertyExt {
    private _datasources: CDatasource[] = [];
    private _nullDatasource = new NullDatasource();
    private _views: View[] = [];
    private _nullView = new NullView(this, "");

    private subgraphMap: { [key: string]: Surface } = {};
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

    createSurface(id: string, label: string, data: any): Surface {
        let retVal: Surface = this.subgraphMap[id];
        if (!retVal) {
            retVal = new Surface()
                .classed({ subgraph: true })
                .showIcon(false)
                .columns(["DS"])
                .data([[data]])
                ;
            this.subgraphMap[id] = retVal;
        }
        retVal.title(`[${id}] - ${label}`);
        retVal.getBBox(true);
        return retVal;
    }

    createVertex(id: string, label: string, data: any, showID: boolean = false): Vertex {
        let retVal: Vertex = this.vertexMap[id];
        if (!retVal) {
            retVal = new Vertex()
                .columns(["DS"])
                .data([[data]])
                .icon_shape_diameter(0)
                ;
            this.vertexMap[id] = retVal;
        }
        retVal.text(showID ? `[${id}]\n${label}` : label);
        retVal.getBBox(true);
        return retVal;
    }

    createEdge(sourceID: string, targetID: string) {
        const edgeID = `${sourceID}->${targetID}`;
        let retVal = this.edgeMap[edgeID];
        if (!retVal) {
            retVal = new Edge()
                .sourceVertex(this.vertexMap[sourceID])
                .targetVertex(this.vertexMap[targetID])
                ;
            this.edgeMap[edgeID] = retVal;
        }
        return retVal;
    }

    createGraph(): IGraphData {
        this.subgraphMap = {};
        const hierarchy: Lineage[] = [];
        const dsVertices: Widget[] = this.datasources().map(ds => {
            return this.createVertex(ds.id(), ds.label(), ds);
        });
        const sgVertices: Widget[] = [];
        const vVertices: Widget[] = [];
        const edges: Edge[] = [];
        const lastID: { [viewID: string]: string } = {};

        const context = this;
        function createSubVertex(parent: Widget, sourceID: string, id: string, label: string, data: any): string {
            const retval: Vertex = context.createVertex(id, label, data);
            vVertices.push(retval);
            hierarchy.push({ parent, child: retval });
            edges.push(context.createEdge(sourceID, id));
            return id;
        }

        for (const view of this._views) {
            const sg: Surface = this.createSurface(view.id(), view.label(), view);
            sgVertices.push(sg);

            let prevID = view.datasource().id();
            if (view.hasFilter()) {
                prevID = createSubVertex(sg, prevID, view.id(), "Filter", view);
            }
            if (view instanceof FlatView) {
                if (view.hasGroupBy()) {
                    prevID = createSubVertex(sg, prevID, view.id() + "_gb", "Group By", view);
                }
                if (view.hasComputedFields()) {
                    prevID = createSubVertex(sg, prevID, view.id() + "_cf", "Computed\nFields", view);
                }
            }
            if (view.hasSortBy()) {
                prevID = createSubVertex(sg, prevID, view.id() + "_s", "Sort", view);
            }
            if (view.hasLimit()) {
                prevID = createSubVertex(sg, prevID, view.id() + "_l", "Limit", view);
            }
            if (prevID === view.datasource().id()) { //  No activities
                prevID = createSubVertex(sg, prevID, view.id() + "_o", "Output", view);
            }
            lastID[view.id()] = prevID;
            view.filters().forEach(filter => {
                if (filter.source()) {
                    const filterView = this.view(filter.source());
                    const filterEdge: Edge = this.createEdge(lastID[filterView.id()], view.id())
                        .strokeDasharray("1,5")
                        .text("Sel:")
                        ;
                    edges.push(filterEdge);
                }
            });
        }

        return {
            vertices: dsVertices.concat(vVertices).concat(sgVertices),
            edges,
            hierarchy
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
