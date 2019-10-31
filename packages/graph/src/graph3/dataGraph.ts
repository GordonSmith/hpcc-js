import { publish } from "@hpcc-js/core";
import { compare2 } from "@hpcc-js/util";
import { CurveEdge as LineEdge } from "./edge";
import { Graph } from "./graph";
import { Vertex } from "./Vertex";

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

export class DataGraph extends Graph {

    @publish([], "Vertices (Nodes)")
    vertices: publish<VertexItem[], this>;

    @publish([], "Edges (Edges)")
    edges: publish<EdgeItem[], this>;

    constructor() {
        super();
    }

    _prevVertices: readonly VertexItem[] = [];
    _masterVertices: VertexItemEx[] = [];
    _masterVerticesMap: { [key: string]: Vertex } = {};
    mergeVertices() {
        const vertices = this.vertices();
        const diff = compare2(this._prevVertices, vertices, d => d.id);
        diff.removed.forEach(item => {
            this._masterVertices = this._masterVertices.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            const vertex = new Vertex()
                .text(item.label)
                ;
            this._masterVertices.push({
                ...item,
                __widget: vertex
            });
            this._masterVerticesMap[item.id] = vertex;
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
                    .sourceVertex(this._masterVerticesMap[item.source])
                    .targetVertex(this._masterVerticesMap[item.target])
            });
        });
        this._prevEdges = edges;
    }

    update(element) {
        this.mergeVertices();
        this.mergeEdges();
        this.data({ vertices: this._masterVertices.map(mv => mv.__widget), edges: this._masterEdges.map(me => me.__widget) });
        super.update(element);
    }
}
