export interface IGraphItem {
    readonly id: string;
}

export interface ISubgraph extends IGraphItem {
}

export interface IVertex extends IGraphItem {
}

export interface IEdge extends IGraphItem {
    source: string;
    target: string;
}

class GraphItem<T extends IGraphItem = IGraphItem> {
    protected _graph: Graph2;
    readonly _: T;
    id(): string {
        return this._.id;
    }

    constructor(g: Graph2, _: T) {
        this._graph = g;
        this._ = _;
    }
}

class Subgraph<T extends ISubgraph = ISubgraph> extends GraphItem<T> {

    private _parent: Subgraph;
    private _children: Array<Subgraph | Vertex> = [];

    constructor(g: Graph2, _: T) {
        super(g, _);
    }

    parent(): Subgraph;
    parent(_: Subgraph): this;
    parent(_?: Subgraph): Subgraph | this {
        if (_ === void 0) return this._parent;
        if (this._parent !== _) {
            if (this._parent) {
                this._parent.removeChild(this);
            }
            this._parent = _;
            this._parent.addChild(this);
        }
        return this;
    }

    children(): Array<Subgraph | Vertex> {
        return this._children;
    }

    addChild(_: Subgraph | Vertex) {
        this._children.push(_);
    }

    removeChild(_: Subgraph | Vertex) {
        this._children = this._children.filter(row => row.id !== _.id);
    }
}

class Vertex<T extends IVertex = IVertex> extends GraphItem<T> {

    private _parent: Subgraph;
    private _inEdges: Edge[] = [];
    private _outEdges: Edge[] = [];

    constructor(g: Graph2, _: T) {
        super(g, _);
    }

    parent(): Subgraph;
    parent(_: Subgraph): this;
    parent(_?: Subgraph): Subgraph | this {
        if (_ === void 0) return this._parent;
        if (this._parent !== _) {
            if (this._parent) {
                this._parent.removeChild(this);
            }
            this._parent = _;
            this._parent.addChild(this);
        }
        return this;
    }

    edges() {
        return [...this._inEdges, ...this._outEdges];
    }

    inEdges() {
        return this._inEdges;
    }

    addInEdge(e: Edge) {
        this._inEdges.push(e);
    }

    removeInEdge(id: string) {
        this._outEdges = this._outEdges.filter(e => e._.id !== id);
    }

    outEdges() {
        return this._outEdges;
    }

    addOutEdge(e: Edge) {
        this._outEdges.push(e);
    }

    removeOutEdge(id: string) {
        this._outEdges = this._outEdges.filter(e => e._.id !== id);
    }
}

class Edge<T extends IEdge = IEdge> extends GraphItem<T> {

    constructor(g: Graph2, _: T) {
        super(g, _);
    }
}

type SubgraphMap<T extends ISubgraph> = { [id: string]: Subgraph<T> };
type VertexMap<T extends IVertex> = { [id: string]: Vertex<T> };
type EdgeMap<T extends IEdge = IEdge> = { [id: string]: Edge<T> };

export class Graph2<S extends ISubgraph = ISubgraph, V extends IVertex = IVertex, E extends IEdge = IEdge> {

    private _directed: boolean;
    private _subgraphs: SubgraphMap<S> = {};
    private _vertices: VertexMap<V> = {};
    private _edges: EdgeMap<E> = {};

    constructor(directed = true) {
        this._directed = directed;
    }

    clear() {
        this._subgraphs = {};
        this._vertices = {};
        this._edges = {};
    }

    isDirected(): boolean {
        return this._directed;
    }

    subgraphExists(e: ISubgraph): boolean {
        return !!this._subgraphs[e.id];
    }

    addsubgraph(s: S, parent?: S) {
        if (this._subgraphs[s.id]) throw new Error(`Subgraph '${s.id}' already exists.`);
        const subgraph = new Subgraph(this, s);
        if (parent) {
            if (this._subgraphs[parent.id]) throw new Error(`Subgraph '${parent.id}' does not exist.`);
            subgraph.parent(this._subgraphs[parent.id]);
        }
        this._subgraphs[s.id] = subgraph;
    }

    removeSubgraph(id: string, promoteChildren = true) {
        if (!this._subgraphs[id]) throw new Error(`Subgraph '${id}' does not exist.`);
        this._subgraphs[id].children().forEach(child => {
            if (promoteChildren) {
                child.parent(this._subgraphs[id].parent());
            } else {
                if (child instanceof Subgraph) {
                    this.removeSubgraph(child.id());
                } else {
                    this.removeVertex(child.id());
                }
            }
        });
        delete this._subgraphs[id];
    }

    vertex(id: string): IVertex {
        return this._vertices[id]._;
    }

    vertexExists(id: string): boolean {
        return !!this._vertices[id];
    }

    addVertex(v: V, parent?: S) {
        if (this._vertices[v.id]) throw new Error(`Vertex '${v.id}' already exists.`);
        const vertex = new Vertex(this, v);
        if (parent) {
            if (this._subgraphs[parent.id]) throw new Error(`Subgraph '${parent.id}' does not exist.`);
            vertex.parent(this._subgraphs[parent.id]);
        }
        this._vertices[v.id] = vertex;
    }

    removeVertex(id: string) {
        if (!this._vertices[id]) throw new Error(`Vertex '${id}' does not exist.`);
        this._vertices[id].edges().forEach(e => {
            this.removeEdge(e.id(), false);
        });
        delete this._vertices[id];
    }

    edge(id: string): IEdge {
        return this._edges[id]._;
    }

    edgeExists(id: string): boolean {
        return !!this._edges[id];
    }

    addEdge(e: E) {
        if (this._edges[e.id]) throw new Error(`Edge '${e.id}' already exists.`);
        if (!this.vertexExists(e.source)) throw new Error(`Edge Source'${e.source}' does not exist.`);
        if (!this.vertexExists(e.target)) throw new Error(`Edge Target'${e.target}' does not exist.`);
        const edge = new Edge(this, e);
        this._edges[e.id] = edge;
        this._vertices[e.source].addOutEdge(edge);
        this._vertices[e.target].addInEdge(edge);
    }

    removeEdge(id: string, updateVertices = true) {
        if (!this._edges[id]) throw new Error(`Vertex '${id}' does not exist.`);
        const edge = this._edges[id];
        if (updateVertices) {
            if (!this.vertexExists(edge._.source)) throw new Error(`Edge Source'${edge._.source}' does not exist.`);
            this._vertices[edge._.source].removeOutEdge(edge._.source);
            if (!this.vertexExists(edge._.target)) throw new Error(`Edge Target'${edge._.target}' does not exist.`);
            this._vertices[edge._.source].removeInEdge(edge._.target);
        }
        delete this._edges[id];
    }
}
