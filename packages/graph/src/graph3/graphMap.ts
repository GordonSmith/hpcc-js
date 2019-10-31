import { d3, ElementT, publish } from "@hpcc-js/core";
import { compare, compare2 } from "@hpcc-js/util";
import { forceCenter as d3ForceCenter, forceLink as d3ForceLink, forceManyBody as d3ForceManyBody, forceSimulation as d3ForceSimulation } from "d3-force";
import { Vertex } from "../Vertex";
import { LineEdge } from "./edge";
import { Graph } from "./graph";
import { ForceDirected } from "./layouts";
import { Map } from "./map";

interface VertexItem {
    id: string;
    label: string;
    [key: string]: any;
}

interface VertexItemEx extends VertexItem {
    __widget: Vertex;
}

interface EdgeItem {
    id: string;
    source: string;
    target: string;
    label?: string;
    [key: string]: any;
}

interface EdgeItemEx extends EdgeItem {
    __widget: LineEdge;
}

export class GraphMap extends Map {

    @publish([], "Vertices (Nodes)")
    vertices: publish<VertexItem[], this>;

    @publish([], "Edges (Edges)")
    edges: publish<EdgeItem[], this>;

    _edgeG: ElementT<SVGGElement, this>;
    _vertexG: ElementT<SVGGElement, this>;

    _dragHandler = d3.drag()
        .on("start", (d: any) => {
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (d: any) => {
            const pos = d3.mouse(this._svgElement.node());
            const px = pos[0];
            const py = pos[1];
            const [x, y] = this._projection.invert([px, py]);
            d.fx = x;
            d.fy = y;
            // this.startLayout();
            this.moveEdges();
            this.moveVertices();
        })
        .on("end", (d: any) => {
            d.x = d.fx;
            d.y = d.fy;
            d.fx = null;
            d.fy = null;
            //            this.startLayout();
        })
        ;
    _nodes: d3.Selection<SVGGElement, VertexItemEx, d3.BaseType, this> = d3.selectAll(null);
    _links: d3.Selection<SVGGElement, EdgeItem, d3.BaseType, this> = d3.selectAll(null);

    constructor() {
        super();
    }

    _prevVertices: readonly VertexItem[] = [];
    _masterVertices: VertexItemEx[] = [];
    mergeVertices() {
        const vertices = this.vertices();
        const diff = compare(this._prevVertices, vertices);
        diff.removed.forEach(item => {
            this._masterVertices = this._masterVertices.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterVertices.push({
                ...item,
                __widget: new Vertex()
            });
        });
        this._prevVertices = vertices;
    }

    _prevEdges: readonly EdgeItem[] = [];
    _masterEdges: EdgeItemEx[] = [];
    mergeEdges() {
        const edges = this.edges();
        const diff = compare(this._masterEdges, edges);
        diff.removed.forEach(item => {
            this._masterEdges = this._masterEdges.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterEdges.push({
                ...item,
                __widget: new LineEdge()
            });
        });
        this._prevEdges = edges;
    }

    startLayout() {
        const simulation = d3ForceSimulation(this._masterVertices)
            .force("link", d3ForceLink(this._masterEdges).id(d => d.id))
            .force("charge", d3ForceManyBody())
            .force("center", d3ForceCenter(0, 0)) // size.width / 2, size.height / 2))
            ;

        simulation.on("tick", () => {
            this.moveEdges();
            this.moveVertices();
        });
    }

    enter(element) {
        super.enter(element);
        this._edgeG = element.append("g");
        this._vertexG = element.append("g");
    }

    update(element) {
        super.update(element);
        this.mergeVertices();
        this.mergeEdges();
        this.updateEdges();
        this.updateVertices();

        this.startLayout();
    }

    updateVertices() {
        const context = this;
        this._nodes = this._vertexG.selectAll<SVGGElement, VertexItem>(".vertexPlaceholder")
            .data(this._masterVertices, d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d: VertexItemEx) {
                        d.__widget.target(this);
                    })
                    .call(this._dragHandler)
                ,
                update => update,
                exit => exit
                    .each(function (d: VertexItemEx) {
                        d.__widget.target(null);
                    })
                    .remove()
            ).each(function (d: VertexItemEx) {
                const [x, y] = context._projection([d.x || 0, d.y || 0]);
                d3.select(this)
                    .attr("transform", d => `translate(${x} ${y})`)
                    ;

                d.__widget
                    .render()
                    ;
            })
            ;
        return this._nodes;
    }

    project(point: { x?: number, y?: number, fx?: number, fy?: number }) {
        return this._projection([
            Math.max(-180, Math.min(180, point.fx || point.x || 0)),
            Math.max(-89, Math.min(89, point.fy || point.y || 0))
        ]);
    }

    moveVertices() {
        this._nodes
            .attr("transform", (d: any) => {
                const [x, y] = this.project(d);
                return `translate(${x} ${y})`;
            })
            ;
    }

    updateEdges() {
        this._links = this._edgeG.selectAll<SVGGElement, EdgeItem>(".edgePlaceholder")
            .data(this._masterEdges, d => d.id)
            .join(enter => enter.append("g")
                .attr("class", "edgePlaceholder")
                .each(function (d: EdgeItemEx) {
                    d.__widget.target(this);
                }),
                update => update,
                exit => exit
                    .each(function (d: EdgeItem) {
                        d.__widget.target(null);
                    })
                    .remove()
            ).each(function (d: EdgeItemEx) {
                d.__widget.render();
            })
            ;
    }

    moveEdges() {
        this._links
            .each((d: any) => {
                const [x1, y1] = this.project(d.source);
                const [x2, y2] = this.project(d.target);
                d.__widget.move(x1, y1, x2, y2);
            })
            ;
    }

    exit(element) {
        super.exit(element);
    }

    zoomed(transform) {
        super.zoomed(transform);
        /*
        this.moveEdges();
        this.moveVertices();
        */
    }

}

export class SimpleGraph extends Graph {

    @publish([], "Vertices (Nodes)")
    vertices: publish<VertexItem[], this>;

    @publish([], "Edges (Edges)")
    edges: publish<EdgeItem[], this>;

    constructor() {
        super();
    }

    _prevVertices: readonly VertexItem[] = [];
    _masterVertices: VertexItemEx[] = [];
    mergeVertices() {
        const vertices = this.vertices();
        const diff = compare2(this._prevVertices, vertices, d => d.id);
        diff.removed.forEach(item => {
            this._masterVertices = this._masterVertices.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterVertices.push({
                ...item,
                __widget: new Vertex()
            });
        });
        this._prevVertices = vertices;
    }

    _prevEdges: readonly EdgeItem[] = [];
    _masterEdges: EdgeItemEx[] = [];
    mergeEdges() {
        const edges = this.edges();
        const diff = compare2(this._masterEdges, edges, d => d.id);
        diff.removed.forEach(item => {
            this._masterEdges = this._masterEdges.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterEdges.push({
                ...item,
                __widget: new LineEdge()
            });
        });
        this._prevEdges = edges;
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

    startLayout() {
        const size = this.size();
        const layout = new ForceDirected(this._masterVertices, this._masterEdges, size.width, size.height);
        layout.on("tick", () => {
            this.moveEdges();
            this.moveVertices();
        });
        layout.start();
    }

    enter(element) {
        super.enter(element);
        this._edgeG = element.append("g");
        this._vertexG = element.append("g");
    }

    update(element) {
        super.update(element);
        this.mergeVertices();
        this.mergeEdges();
        this.updateEdges();
        this.updateVertices();

        this.startLayout();
    }

    updateVertices() {
        this._nodes = this._vertexG.selectAll<SVGGElement, VertexItem>(".vertexPlaceholder")
            .data(this._masterVertices, d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d: VertexItemEx) {
                        d.__widget.target(this);
                    })
                    .call(this._dragHandler)
                ,
                update => update,
                exit => exit
                    .each(function (d: VertexItemEx) {
                        d.__widget.target(null);
                    })
                    .remove()
            ).each(function (d: VertexItemEx) {
                d.__widget
                    .text(d.label)
                    .render()
                    ;
            }) as any
            ;
        return this._nodes;
    }

    moveVertices() {
        this._nodes
            .attr("transform", (d: any) => {
                const [x, y] = this.project(d);
                return `translate(${x} ${y})`;
            })
            ;
    }

    updateEdges() {
        this._links = this._edgeG.selectAll<SVGGElement, EdgeItem>(".edgePlaceholder")
            .data(this._masterEdges, d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "edgePlaceholder")
                    .each(function (d: EdgeItemEx) {
                        d.__widget.target(this);
                    })
                ,
                update => update,
                exit => exit
                    .each(function (d: EdgeItemEx) {
                        d.__widget.target(null);
                    })
                    .remove()
            ).each(function (d: EdgeItemEx) {
                d.__widget
                    .render()
                    ;
            }) as any
            ;
    }

    moveEdges() {
        const context = this;
        this._links.each((d: any) => {
            d.__widget
                .move([context.project(d.source), context.project(d.target)])
                ;
        });
    }

    exit(element) {
        super.exit(element);
    }

    zoomed(transform) {
        super.zoomed(transform);
        /*
        this.moveEdges();
        this.moveVertices();
        */
    }

}
