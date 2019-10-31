import { Widget } from "@hpcc-js/common";
import { d3, ElementT, SVGZoomSurface } from "@hpcc-js/core";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { Edge } from "./edge";
import { ForceDirected, ILayout } from "./layouts";

export interface Lineage {
    parent: Widget;
    child: Widget;
}

export interface IGraphData {
    subgraphs?: Widget[];
    vertices: Widget[];
    edges: Edge[];
    hierarchy?: Lineage[];
}

export class Graph extends SVGZoomSurface {

    protected _graphData = new GraphCollection<Widget, Edge>()
        .idFunc(d => d.id())
        .sourceFunc(e => e.sourceVertex().id())
        .targetFunc(e => e.targetVertex().id())
        ;

    protected _edgeG: ElementT<SVGGElement, this>;
    protected _vertexG: ElementT<SVGGElement, this>;

    protected _dragHandler = d3.drag()
        .on("start", (d: Widget) => {
            this._layout.fixVertexPos(d.id(), this._layout.vertexPos(d.id()));
        })
        .on("drag", (d: Widget) => {
            /*
            const pos = d3.mouse(this._svgElement.node());
            const px = pos[0];
            const py = pos[1];
            const [x, y] = [px, py]; // this._projection.invert([px, py]);
            */
            this._layout
                .fixVertexPos(d.id(), [d3.event().x, d3.event().y])
                ;
            if (this._layout.running()) {
            } else {
                this.moveEdges();
                this.moveVertices();
            }
        })
        .on("end", (d: Widget) => {
            this._layout
                .fixVertexPos(d.id())
                // .start()
                ;
        })
        ;
    protected _nodes: d3.Selection<SVGGElement, Widget, d3.BaseType, this> = d3.selectAll(null);
    protected _links: d3.Selection<SVGGElement, Edge, d3.BaseType, this> = d3.selectAll(null);

    constructor() {
        super();
    }

    data(): IGraphData;
    data(_: IGraphData, merge?: boolean): this;
    data(_?: IGraphData, merge?: boolean): IGraphData | this {
        if (_ === void 0) {
            return {
                subgraphs: this._graphData.subgraphs(),
                vertices: this._graphData.vertices(),
                edges: this._graphData.edges(),
                hierarchy: []
            };
        }
        if (_.subgraphs) {
            _.subgraphs.forEach(sg => this._graphData.addSubgraph(sg));
        }
        _.vertices.forEach(v => this._graphData.addVertex(v));
        _.edges.forEach(e => this._graphData.addEdge(e));
        return this;
    }

    projectX(point: { x?: number, y?: number, fx?: number, fy?: number }) {
        return point.fx || point.x || 0;
    }

    projectY(point: { x?: number, y?: number, fx?: number, fy?: number }) {
        return point.fy || point.y || 0;
    }

    project(point: { x?: number, y?: number, fx?: number, fy?: number }) {
        return [point.fx || point.x || 0, point.fy || point.y || 0];
        /*
        return this._projection([
            Math.max(-180, Math.min(180, point.fx || point.x || 0)),
            Math.max(-89, Math.min(89, point.fy || point.y || 0))
        ]);
        */
    }

    _layout: ILayout;
    startLayout() {
        const size = this.size();
        this._layout = new ForceDirected(this._graphData.vertices().map(v => ({ id: v.id() })), this._graphData.edges().map(e => ({ id: e.id(), source: e.sourceVertex().id(), target: e.targetVertex().id() })), size.width, size.height)
            .on("tick", () => {
                this.moveEdges();
                this.moveVertices();
            })
            .start()
            ;
    }

    enter(element) {
        super.enter(element);
        this._edgeG = element.append("g");
        this._vertexG = element.append("g");
    }

    update(element) {
        super.update(element);
        this.updateEdges();
        this.updateVertices();
        this.startLayout();
    }

    updateVertices() {
        this._nodes = this._vertexG.selectAll<SVGGElement, Widget>(".vertexPlaceholder")
            .data(this._graphData.vertices(), d => d.id())
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d) {
                        d.target(this);
                    })
                    .call(this._dragHandler)
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        d.target(null);
                    })
                    .remove()
            ).each(function (d) {
                d.render();
            })
            ;
        return this._nodes;
    }

    moveVertices() {
        this._nodes
            .attr("transform", (d: any) => {
                const [x, y] = this._layout.vertexPos(d.id());
                return `translate(${x} ${y})`;
            })
            ;
    }

    updateEdges() {
        this._links = this._edgeG.selectAll<SVGGElement, Edge>(".edgePlaceholder")
            .data(this._graphData.edges(), d => d.id())
            .join(
                enter => enter.append("g")
                    .attr("class", "edgePlaceholder")
                    .each(function (d) {
                        d.target(this);
                    })
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        d.target(null);
                    })
                    .remove()
            ).each(function (d) {
                d.render();
            })
            ;
    }

    moveEdges() {
        this._graphData.edges().forEach(e => e.move(this._layout.edgePoints(e.id())));
    }

    exit(element) {
        super.exit(element);
    }

    zoomed(transform) {
        super.zoomed(transform);
    }

}
