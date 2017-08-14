import { Surface, Widget } from "@hpcc-js/common";
import { Edge, IGraphData, Lineage, Vertex } from "@hpcc-js/graph";
import { Activity } from "../views/activities/activity";
import { View } from "../views/view";
import { Dashboard } from "./dashboard";
import { Viz } from "./viz";

export class GraphAdapter {
    private _dashboard: Dashboard;
    private subgraphMap: { [key: string]: Surface } = {};
    private vertexMap: { [key: string]: Vertex } = {};
    private edgeMap: { [key: string]: Edge } = {};

    constructor(dashboard: Dashboard) {
        this._dashboard = dashboard;
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
        retVal.title(`${label}`);
        retVal.getBBox(true);
        return retVal;
    }

    createVertex(id: string, label: string, data: any, fillColor: string = "#dcf1ff"): Vertex {
        let retVal: Vertex = this.vertexMap[id];
        if (!retVal) {
            retVal = new Vertex()
                .columns(["DS"])
                .data([[data]])
                .icon_shape_diameter(0)
                .textbox_shape_colorFill(fillColor)
                ;
            this.vertexMap[id] = retVal;
        }
        retVal.text(label);
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
        this.vertexMap = {};
        this.edgeMap = {};

        const hierarchy: Lineage[] = [];
        const dsVertices: Widget[] = [];
        const sgVertices: Widget[] = [];
        const vVertices: Widget[] = [];
        const edges: Edge[] = [];

        const context = this;
        function createDatasource(sourceID: string, id: string, label: string, data: any): string {
            const retval: Vertex = context.createVertex(id, label, data);
            vVertices.push(retval);
            if (sourceID) {
                edges.push(context.createEdge(sourceID, id));
            }
            return id;
        }
        function createActivity(sourceID: string, viz: Viz, view: View, activity: Activity): string {
            const surface: Surface = context.createSurface(view.id(), `${view.label()} [${viz.id()}]`, { viz, view });
            if (vVertices.indexOf(surface) === -1) {
                vVertices.push(surface);
            }
            const vertex: Vertex = context.createVertex(activity.id(), `${activity.classID()}`, { viz, view, activity }, activity.exists() ? null : "lightgray");
            vVertices.push(vertex);
            if (sourceID) {
                edges.push(context.createEdge(sourceID, activity.id()));
            }
            hierarchy.push({ parent: surface, child: vertex });
            return activity.id();
        }

        const dsDedup = {};
        const lastID = {};
        for (const viz of this._dashboard.visualizations()) {
            const view = viz.view();
            // const ds = view.rawDatasource();
            const ds2 = view.dataSource();
            dsDedup[ds2.id()] = ds2.hash();
            const firstID = createDatasource("", ds2.hash(), `${ds2.label()}`, { viz: undefined, activity: ds2 });
            let prevID = firstID;
            prevID = createActivity(prevID, viz, view, view.filters());
            prevID = createActivity(prevID, viz, view, view.groupBy());
            prevID = createActivity(prevID, viz, view, view.sort());
            prevID = createActivity(prevID, viz, view, view.limit());
            lastID[view.id()] = prevID;
        }

        for (const viz of this._dashboard.visualizations()) {
            const view = viz.view();
            view.updatedBy().forEach(updateInfo => {
                const filterEdge: Edge = this.createEdge(lastID[this._dashboard.visualization(updateInfo.from).view().id()], dsDedup[updateInfo.to.id()] || updateInfo.to.id())
                    .weight(10)
                    .strokeDasharray("1,5")
                    .text("updates")
                    ;
                edges.push(filterEdge);
            });
        }

        return {
            vertices: dsVertices.concat(vVertices).concat(sgVertices),
            edges,
            hierarchy
        };
    }
}
