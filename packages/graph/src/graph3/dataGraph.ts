import { publish } from "@hpcc-js/core";
import { compare2 } from "@hpcc-js/util";
import { EdgeProps, VertexProps } from "./components/icon";
import { Graph } from "./graph";

export class DataGraph extends Graph {

    @publish([], "Vertex Columns")
    vertexColumns: publish<string[], this>;
    @publish([], "Vertices (Nodes)")
    vertices: publish<string[][], this>;
    @publish("", "Vertex ID column")
    vertexIDColumn: publish<string, this>;
    @publish("", "Vertex label column")
    vertexLabelColumn: publish<string, this>;
    @publish("fa-user", "Vertex default FAChar")
    vertexFAChar: publish<string, this>;
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

    private _prevVertices: readonly VertexProps[] = [];
    private _masterVertices: VertexProps[] = [];
    private _masterVerticesMap: { [key: string]: VertexProps } = {};
    mergeVertices() {
        const columns = this.vertexColumns();
        const idIdx = this.indexOf(columns, this.vertexIDColumn(), "id");
        const labelIdx = this.indexOf(columns, this.vertexLabelColumn(), "label");
        const faCharIdx = this.indexOf(columns, this.vertexFACharColumn(), "faChar");
        const vertices: VertexProps[] = this.vertices().map(v => {
            return {
                id: v[idIdx],
                text: v[labelIdx],
                faChar: v[faCharIdx] || this.vertexFAChar()
            };
        });
        const diff = compare2(this._prevVertices, vertices, d => d.id);
        diff.removed.forEach(item => {
            this._masterVertices = this._masterVertices.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterVertices.push(item);
            this._masterVerticesMap[item.id] = item;
        });
        this._prevVertices = vertices;
    }

    _prevEdges: readonly EdgeProps[] = [];
    _masterEdges: EdgeProps[] = [];
    mergeEdges() {
        const columns = this.edgeColumns();
        const idIdx = this.indexOf(columns, this.edgeIDColumn(), "id");
        const sourceIdx = this.indexOf(columns, this.edgeSourceColumn(), "source");
        const targetIdx = this.indexOf(columns, this.edgeTargetColumn(), "target");
        const edges: EdgeProps[] = this.edges().map(e => {
            return {
                id: e[idIdx] || e[sourceIdx] + "->" + e[targetIdx],
                source: this._masterVerticesMap[e[sourceIdx]],
                target: this._masterVerticesMap[e[targetIdx]]
            };
        });
        const diff = compare2(this._masterEdges, edges, d => d.id);
        diff.removed.forEach(item => {
            this._masterEdges = this._masterEdges.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterEdges.push(item);
        });
        this._prevEdges = edges;
    }

    update(element) {
        this.mergeVertices();
        this.mergeEdges();
        this.data({ vertices: this._masterVertices, edges: this._masterEdges });
        super.update(element);
    }
}
