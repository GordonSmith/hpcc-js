import { publish } from "@hpcc-js/core";
import { compare2 } from "@hpcc-js/util";
import { CurveEdge, Edge } from "./edge";
import { Graph } from "./graph";
import { Vertex } from "./Vertex";

interface VertexItem {
    id: string;
    label: string;
    faChar: string;
    __widget?: Vertex;
}

interface EdgeItem {
    id: string;
    source: string;
    target: string;
    __widget?: Edge;
}

export class DataGraph extends Graph {

    @publish([], "Vertex Columns")
    vertexColumns: publish<string[], this>;
    @publish([], "Vertices (Nodes)")
    vertices: publish<string[][], this>;
    @publish("", "Vertex ID column")
    vertexIDColumn: publish<string, this>;
    @publish("", "Vertex label column")
    vertexLabelColumn: publish<string, this>;
    @publish("", "Vertex FAChar column")
    vertexFACharColumn: publish<string, this>;

    @publish([], "Edge columns")
    edgeColumns: publish<string[], this>;
    @publish([], "Edges (Edges)")
    edges: publish<string[][], this>;
    @publish("", "Edge ID column")
    edgeIDColumn: publish<string, this>;
    @publish("", "Edge label column")
    edgeLabelColumn: publish<string, this>;
    @publish("", "Edge source ID column")
    edgeSourceColumn: publish<string, this>;
    @publish("", "Edge target ID column")
    edgeTargetColumn: publish<string, this>;

    constructor() {
        super();
    }

    indexOf(columns: readonly string[], column: string, defColumn: string = ""): number {
        const retVal = columns.indexOf(column);
        return retVal >= 0 ? retVal : columns.indexOf(defColumn);
    }

    private _prevVertices: readonly VertexItem[] = [];
    private _masterVertices: VertexItem[] = [];
    private _masterVerticesMap: { [key: string]: Vertex } = {};
    mergeVertices() {
        const columns = this.vertexColumns();
        const idIdx = this.indexOf(columns, this.vertexIDColumn(), "id");
        const labelIdx = this.indexOf(columns, this.vertexLabelColumn(), "label");
        const faCharIdx = this.indexOf(columns, this.vertexFACharColumn(), "faChar");
        const vertices: VertexItem[] = this.vertices().map(v => {
            return {
                id: v[idIdx],
                label: v[labelIdx],
                faChar: v[faCharIdx]
            };
        });
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
    _masterEdges: EdgeItem[] = [];
    mergeEdges() {
        const columns = this.edgeColumns();
        const idIdx = this.indexOf(columns, this.edgeSourceColumn(), "id");
        const sourceIdx = this.indexOf(columns, this.edgeSourceColumn(), "source");
        const targetIdx = this.indexOf(columns, this.edgeTargetColumn(), "target");
        const edges: EdgeItem[] = this.edges().map(e => {
            return {
                id: e[idIdx] || e[sourceIdx] + "->" + e[targetIdx],
                source: e[sourceIdx],
                target: e[targetIdx]
            };
        });
        const diff = compare2(this._masterEdges, edges, d => d.id);
        diff.removed.forEach(item => {
            this._masterEdges = this._masterEdges.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterEdges.push({
                ...item,
                __widget: new CurveEdge()
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
