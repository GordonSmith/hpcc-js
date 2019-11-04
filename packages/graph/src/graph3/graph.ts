import { Widget } from "@hpcc-js/common";
import { d3, ElementT, SVGZoomSurface } from "@hpcc-js/core";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { Edge } from "./edge";
import { EdgePlaceholder, ForceDirected, ILayout, VertexPlaceholder } from "./layouts";
// import { Map } from "./map";

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

function safeRaise(domNode: Element) {
    const target = domNode;
    let nextSibling = target.nextSibling;
    while (nextSibling) {
        target.parentNode.insertBefore(nextSibling, target);
        nextSibling = target.nextSibling;
    }
}

export class Graph extends SVGZoomSurface {

    protected _graphData = new GraphCollection<VertexPlaceholder, EdgePlaceholder>()
        .idFunc(d => d.id)
        .sourceFunc(e => e.source.id)
        .targetFunc(e => e.target.id)
        ;

    protected _edgeG: ElementT<SVGGElement, this>;
    protected _vertexG: ElementT<SVGGElement, this>;

    protected _dragHandler = d3.drag<Element, VertexPlaceholder>();
    protected _nodes: d3.Selection<SVGGElement, VertexPlaceholder, d3.BaseType, this> = d3.selectAll(null);
    protected _links: d3.Selection<SVGGElement, EdgePlaceholder, d3.BaseType, this> = d3.selectAll(null);

    constructor() {
        super();
        const context = this;
        this._dragHandler
            .on("start", function (d) {
                d.fx = d.sx = d.x;
                d.fy = d.sy = d.y;
                safeRaise(this);
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.fx = n.sx = n.x;
                    n.fy = n.sy = n.y;
                });
            })
            .on("drag", d => {
                /*
                const pos = d3.mouse(this._svgElement.node());
                const px = pos[0];
                const py = pos[1];
                const [x, y] = [px, py]; // this._projection.invert([px, py]);
                */
                d.fx = d3.event().x;
                d.fy = d3.event().y;
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.fx = n.sx + d.fx - d.sx;
                    n.fy = n.sy + d.fy - d.sy;
                });
                if (!this._layout.running()) {
                    this.moveEdges();
                    this.moveVertices();
                }
            })
            .on("end", d => {
                d.x = d.fx;
                d.y = d.fy;
                d.fx = d.sx = undefined;
                d.fy = d.sy = undefined;
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.x = n.fx;
                    n.y = n.fy;
                    n.fx = n.sx = undefined;
                    n.fy = n.sy = undefined;
                });
                // this.startLayout();
            })
            ;

    }

    data(): IGraphData;
    data(_: IGraphData, merge?: boolean): this;
    data(_?: IGraphData, merge?: boolean): IGraphData | this {
        if (_ === void 0) {
            return {
                subgraphs: this._graphData.subgraphs(),
                vertices: this._graphData.vertices().map(d => d.widget),
                edges: this._graphData.edges().map(d => d.widget),
                hierarchy: []
            };
        }
        if (_.subgraphs) {
            _.subgraphs.forEach(sg => this._graphData.addSubgraph(sg));
        }
        _.vertices.forEach(v => this._graphData.addVertex({
            id: v.id(),
            widget: v
        }));
        _.edges.forEach(e => this._graphData.addEdge({
            id: e.id(),
            widget: e,
            source: this._graphData.vertex(e.sourceVertex().id()),
            target: this._graphData.vertex(e.targetVertex().id())
        }));
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
        const { width, height } = this.size();
        this._layout = new ForceDirected(this._graphData.vertices(), this._graphData.edges(), width, height)
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
        this._nodes = this._vertexG.selectAll<SVGGElement, VertexPlaceholder>(".vertexPlaceholder")
            .data(this._graphData.vertices(), d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d) {
                        d.widget.target(this);
                    })
                    .on("mouseover", function (d) {
                        safeRaise(this);
                    })
                    .call(this._dragHandler)
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        d.widget.target(null);
                    })
                    .remove()
            ).each(function (d) {
                d.widget.render();
            })
            ;
        return this._nodes;
    }

    moveVertices() {
        this._nodes
            .attr("transform", d => `translate(${d.fx || d.x || 0} ${d.fy || d.y || 0})`)
            ;
    }

    updateEdges() {
        this._links = this._edgeG.selectAll<SVGGElement, EdgePlaceholder>(".edgePlaceholder")
            .data(this._graphData.edges(), d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "edgePlaceholder")
                    .each(function (d) {
                        d.widget.target(this);
                    })
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        d.widget.target(null);
                    })
                    .remove()
            ).each(function (d) {
                d.widget.render();
            })
            ;
    }

    moveEdges() {
        this._graphData.edges().forEach(e => e.widget.move([
            [e.source.fx || e.source.x || 0, e.source.fy || e.source.y || 0],
            [e.target.fx || e.target.x || 0, e.target.fy || e.target.y || 0]
        ]));
    }

    exit(element) {
        super.exit(element);
    }

    zoomed(transform) {
        super.zoomed(transform);
    }

}
