import { publish, Widget } from "@hpcc-js/common";
import { compare2 } from "@hpcc-js/util";
import { Edge } from "./Edge";
import { Graph } from "./Graph";
import { Vertex } from "./Vertex";

export class DataGraph extends Graph {

    @publish([], "any", "Vertex Columns")
    vertexColumns: publish<this, string[]>;
    @publish([], "any", "Vertices (Nodes)")
    vertices: publish<this, string[][]>;
    @publish("", "any", "Vertex ID column")
    vertexIDColumn: publish<this, string>;
    @publish("", "any", "Vertex label column")
    vertexLabelColumn: publish<this, string>;
    @publish("fa-user", "any", "Vertex default FAChar")
    vertexFAChar: publish<this, string>;
    @publish("", "any", "Vertex FAChar column")
    vertexFACharColumn: publish<this, string>;

    @publish([], "any", "Edge columns")
    edgeColumns: publish<this, string[]>;
    @publish([], "any", "Edges (Edges)")
    edges: publish<this, string[][]>;
    @publish("", "any", "Edge ID column")
    edgeIDColumn: publish<this, string>;
    @publish("", "any", "Edge label column")
    edgeLabelColumn: publish<this, string>;
    @publish("", "any", "Edge source ID column")
    edgeSourceColumn: publish<this, string>;
    @publish("", "any", "Edge target ID column")
    edgeTargetColumn: publish<this, string>;

    constructor() {
        super();
    }

    indexOf(columns: readonly string[], column: string, defColumn: string = ""): number {
        const retVal = columns.indexOf(column);
        return retVal >= 0 ? retVal : columns.indexOf(defColumn);
    }

    private _prevVertices: readonly Vertex[] = [];
    private _masterVertices: Vertex[] = [];
    private _masterVerticesMap: { [key: string]: Vertex } = {};
    mergeVertices() {
        const columns = this.vertexColumns();
        const idIdx = this.indexOf(columns, this.vertexIDColumn(), "id");
        const labelIdx = this.indexOf(columns, this.vertexLabelColumn(), "label");
        const faCharIdx = this.indexOf(columns, this.vertexFACharColumn(), "faChar");
        const vertices: Vertex[] = this.vertices().map(v => {
            return new Vertex()
                .id(this.id() + "_" + v[idIdx])
                .text(v[labelIdx])
                .faChar(v[faCharIdx] || this.vertexFAChar())
                ;
        });
        const diff = compare2(this._prevVertices, vertices, d => d.id());
        diff.removed.forEach(item => {
            this._masterVertices = this._masterVertices.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterVertices.push(item);
            this._masterVerticesMap[item.id()] = item;
        });
        this._prevVertices = vertices;
    }

    protected _prevEdges: readonly Edge[] = [];
    protected _masterEdges: Edge[] = [];
    mergeEdges() {
        const columns = this.edgeColumns();
        // const idIdx = this.indexOf(columns, this.edgeIDColumn(), "id");
        const sourceIdx = this.indexOf(columns, this.edgeSourceColumn(), "source");
        const targetIdx = this.indexOf(columns, this.edgeTargetColumn(), "target");
        const edges: Edge[] = this.edges().map(e => {
            return new Edge()
                .id(this.id() + "_" + e[sourceIdx] + "--" + e[targetIdx])
                .sourceVertex(this._masterVerticesMap[this.id() + "_" + e[sourceIdx]])
                .targetVertex(this._masterVerticesMap[this.id() + "_" + e[targetIdx]])
                ;
        });
        const diff = compare2(this._masterEdges, edges, d => d.id());
        diff.removed.forEach(item => {
            this._masterEdges = this._masterEdges.filter(i => i.id !== item.id);
        });
        diff.added.forEach(item => {
            this._masterEdges.push(item);
        });
        this._prevEdges = edges;
    }

    update(domNode, element) {
        this.mergeVertices();
        this.mergeEdges();
        this.data({ vertices: this._masterVertices, edges: this._masterEdges });
        super.update(domNode, element);
    }

    render(callback?: (w: Widget) => void): this {
        console.log("Vertices:  " + this.vertices().length);
        console.log("Edges:  " + this.edges().length);
        const start = performance.now();
        super.render(w => {
            const end = performance.now();
            console.log(end - start);
            if (callback) {
                callback(w);
            }
        });
        return this;
    }
}
DataGraph.prototype._class += " graph_DataGraph";
