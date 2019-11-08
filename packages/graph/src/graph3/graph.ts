import { Widget } from "@hpcc-js/common";
import { d3, ElementT, SVGZoomSurface } from "@hpcc-js/core";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { Edge } from "./edge";
import { Circle, Dagre, EdgePlaceholder, ForceDirected, ILayout, Null, VertexPlaceholder } from "./layouts/index";

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
                context.moveVertexPlaceholder(d, true, false);
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.fx = n.sx + d.fx - d.sx;
                    n.fy = n.sy + d.fy - d.sy;
                    context.moveVertexPlaceholder(n, true, false);
                });
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

    layoutData() {
        return this._graphData;
    }

    _layout: ILayout;
    setLayout(layout: ILayout) {
        if (this._layout) {
            this._layout.stop();
        }
        this._layout = layout;
        this._layout.start();
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
        if (!this._layout) {
            this.setLayout(new Null(this));
            setTimeout(() => {
                this.setLayout(new ForceDirected(this));
            }, 3000);
            setTimeout(() => {
                this.setLayout(new Dagre(this));
            }, 6000);
            return;
            setTimeout(() => {
                this.setLayout(new Circle(this));
            }, 9000);
            setTimeout(() => {
                this.setLayout(new Null(this));
            }, 12000);
            setTimeout(() => {
                this.setLayout(new Circle(this));
            }, 15000);
        }
    }

    updateVertices(): this {
        this._nodes = this._vertexG.selectAll<SVGGElement, VertexPlaceholder>(".vertexPlaceholder")
            .data(this._graphData.vertices(), d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d) {
                        d.widget.target(this);
                        d.element = d3.select(this);
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
        return this;
    }

    moveVertexPlaceholder(vp: VertexPlaceholder, moveEdges: boolean, transition: boolean): this {
        (transition ? vp.element.transition() : vp.element)
            .attr("transform", `translate(${vp.fx || vp.x || 0} ${vp.fy || vp.y || 0})`)
            ;
        if (moveEdges) {
            this._graphData.edges(vp.id).forEach(e => this.moveEdgePlaceholder(e, transition));
        }
        return this;
    }

    moveVertices(moveEdges: boolean, transition: boolean): this {
        this._graphData.vertices().forEach(v => this.moveVertexPlaceholder(v, false, transition));
        if (moveEdges) {
            this.moveEdges(transition);
        }
        return this;
    }

    updateEdges(): this {
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
        return this;
    }

    moveEdgePlaceholder(ep: EdgePlaceholder, transition: boolean): this {
        ep.widget.move(ep.points || [
            [ep.source.fx || ep.source.x || 0, ep.source.fy || ep.source.y || 0],
            [ep.target.fx || ep.target.x || 0, ep.target.fy || ep.target.y || 0]
        ], transition);
        delete ep.points;
        return this;
    }

    moveEdges(transition: boolean): this {
        this._graphData.edges().forEach(e => this.moveEdgePlaceholder(e, transition));
        return this;
    }

    exit(element) {
        super.exit(element);
    }

    zoomed(transform) {
        super.zoomed(transform);
    }

}
