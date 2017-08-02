import { MultiChart } from "@hpcc-js/chart";
import { PropertyExt, Surface, Widget } from "@hpcc-js/common";
import { IAnyVisualization, IDashboard, IDatasource, IOutput, ITableVisualization, StringStringDict, VisualizationType } from "@hpcc-js/ddl-shim";
import { Edge, IGraphData, Lineage, Vertex } from "@hpcc-js/graph";
import { Persist } from "@hpcc-js/other";
import { DockPanel, WidgetAdapter } from "@hpcc-js/phosphor";
import { Databomb } from "../datasources/databomb";
import { WUResult } from "../datasources/wuresult";
import { View } from "../views/view";
import { Viz } from "./viz";

export class Dashboard extends DockPanel {
    private subgraphMap: { [key: string]: Surface } = {};
    private vertexMap: { [key: string]: Vertex } = {};
    private edgeMap: { [key: string]: Edge } = {};

    protected _prevActive;

    private _visualizations: Viz[] = [];
    visualizations() {
        return [...this._visualizations];
    }

    visualization(w: string | PropertyExt): Viz {
        if (typeof w === "string") {
            return this._visualizations.filter(viz => viz.id() === w)[0];
        }
        return this._visualizations.filter(v => v.vizProps() === w)[0];
    }

    addVisualization(viz: Viz): this {
        this._visualizations.push(viz);
        return this;
    }

    views(): View[] {
        return this._visualizations.map(viz => viz.view());
    }

    view(id: string): View | undefined {
        return this.views().filter(view => view.id() === id)[0];
    }

    update(domNode, element) {
        const previous = this.widgets();
        const current = this.visualizations().map(viz => viz.vizProps());
        const removed = previous.filter(x => current.indexOf(x) === -1);
        const added = current.filter(x => previous.indexOf(x) === -1);
        const updated = this.visualizations().filter(viz => added.indexOf(viz.vizProps()) === -1);
        for (const w of removed) {
            this.removeWidget(w);
        }
        const context = this;
        for (const w of added) {
            this.addWidget(w, this.visualization(w).view().label());
            const wa: any = this.getWidgetAdapter(w);
            const origActivateRequest = wa.onActivateRequest;
            wa.onActivateRequest = function (msg): void {
                origActivateRequest.apply(this, arguments);
                if (context._prevActive !== this._widget) {
                    context._prevActive = this._widget;
                    context.ActiveChanged(context._visualizations.filter(v => v.vizProps() === this._widget)[0], this._widget, wa);
                }
            };
        }
        for (const viz of updated) {
            const wa: any = this.getWidgetAdapter(viz.vizProps());
            wa.title.label = viz.view().label();
        }
        super.update(domNode, element);
    }

    ActiveChanged(v: Viz, w: Widget, wa: WidgetAdapter) {
    }

    //  Graph  ---
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
        this.vertexMap = {};
        this.edgeMap = {};

        const hierarchy: Lineage[] = [];
        const dsVertices: Widget[] = [];
        const sgVertices: Widget[] = [];
        const vVertices: Widget[] = [];
        const edges: Edge[] = [];

        const context = this;
        function createVertex(sourceID: string, id: string, label: string, data: any): string {
            const retval: Vertex = context.createVertex(id, label, data);
            vVertices.push(retval);
            if (sourceID) {
                edges.push(context.createEdge(sourceID, id));
            }
            return id;
        }

        for (const viz of this._visualizations) {
            const view = viz.view();
            const ds = view.datasource();
            let prevID = "";
            prevID = createVertex(prevID, ds.hash(), `${ds.label()}`, ds);
            if (view.hasFilter()) {
                prevID = createVertex(prevID, view.id() + "_f", `${view.label()}:  Filter`, view);
            }
            if (view.hasGroupBy()) {
                prevID = createVertex(prevID, view.id() + "_gb", `${view.label()}:  GroupBy`, view);
            }
            if (view.hasComputedFields()) {
                prevID = createVertex(prevID, view.id() + "_cf", `${view.label()}:  Computed\nFields`, view);
            }
            if (view.hasSortBy()) {
                prevID = createVertex(prevID, view.id() + "_sb", `${view.label()}:  Sort`, view);
            }
            if (view.hasLimit()) {
                prevID = createVertex(prevID, view.id() + "_l", `${view.label()}:  Limit`, view);
            }
            prevID = createVertex(prevID, view.id(), `${view.label()}:  Output`, view);

            view.filters().forEach(filter => {
                if (filter.source()) {
                    const filterEdge: Edge = this.createEdge(this.visualization(filter.source()).view().id(), view.id() + "_f")
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

    createDDLOutputs(ds: WUResult | Databomb | any): IOutput {
        if (ds instanceof WUResult) {
            return {
                id: ds.resultName(),
                from: ds.resultName()
            };
        }
    }

    createDDLDatasources(): IDatasource[] {
        return this.visualizations().map(viz => {
            const ds = viz.view().datasource();
            return {
                id: ds.id(),
                databomb: ds instanceof Databomb,
                WUID: ds instanceof WUResult,
                outputs: [this.createDDLOutputs(ds)]
            };
        });
    }

    createDDLVisualizations(): IAnyVisualization[] {
        return this.visualizations().map(viz => {
            const widget: MultiChart = viz.widget() as any;
            const view = viz.view();
            const ds = view.datasource();
            let sourceOutput = "";
            if (ds instanceof WUResult) {
                sourceOutput = (ds as WUResult).resultName();
            }
            return {
                id: viz.id(),
                title: viz.view().label(),
                type: "TABLE" as VisualizationType,
                label: view.outFields().map(field => field.id),
                source: {
                    id: view.datasource().id(),
                    output: sourceOutput,
                    mappings: {
                        value: view.outFields().map(field => field.id)
                    }
                },
                properties: {
                    chartType: widget.chartType()
                } as StringStringDict
            } as ITableVisualization;
        });
    }

    createDDL(): IDashboard {
        return {
            visualizations: this.createDDLVisualizations(),
            datasources: this.createDDLDatasources()
        };
    }

    createLayout(): object {
        return this._visualizations.map(viz => {
            return Persist.serializeToObject(viz.widget());
        });
    }
}
Dashboard.prototype._class += " dashboard_dashboard";
