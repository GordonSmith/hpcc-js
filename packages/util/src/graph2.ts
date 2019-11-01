class GraphItem<T = any> {
    protected _graph: Graph2;
    readonly _: T;
    id(): string {
        return this._graph.id(this._);
    }

    constructor(g: Graph2, _: T) {
        this._graph = g;
        this._ = _;
    }
}

class ChildGraphItem<S = any> extends GraphItem<S> {

    private _parent: Subgraph;

    constructor(g: Graph2, _: S) {
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
}

class Subgraph<S = any> extends ChildGraphItem<S> {

    private _children: ChildGraphItem[] = [];

    constructor(g: Graph2, _: S) {
        super(g, _);
    }

    children(): ChildGraphItem[] {
        return this._children;
    }

    addChild(_: ChildGraphItem) {
        this._children.push(_);
    }

    removeChild(_: ChildGraphItem) {
        this._children = this._children.filter(row => row.id !== _.id);
    }
}

class Vertex<V = any> extends ChildGraphItem<V> {

    private _inEdges: Edge[] = [];
    private _outEdges: Edge[] = [];

    constructor(g: Graph2, _: V) {
        super(g, _);
    }

    edges() {
        return [...this._inEdges, ...this._outEdges];
    }

    edgeCount() {
        return this._outEdges.length + this._inEdges.length;
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

class Edge<E = any> extends GraphItem<E> {

    _source: Vertex;
    _target: Vertex;

    constructor(g: Graph2, _: E, source: Vertex, target: Vertex) {
        super(g, _);
        this._source = source;
        this._target = target;
    }
}

type SubgraphMap<T> = { [id: string]: Subgraph<T> };
type VertexMap<T> = { [id: string]: Vertex<T> };
type EdgeMap<T> = { [id: string]: Edge<T> };

export class Graph2<V = any, E = any, S = any> {

    private _directed: boolean;
    private _subgraphs: SubgraphMap<S> = {};
    private _vertices: VertexMap<V> = {};
    private _edges: EdgeMap<E> = {};

    constructor(directed = true) {
        this._directed = directed;
    }

    clear(): this {
        this._subgraphs = {};
        this._vertices = {};
        this._edges = {};
        return this;
    }

    isDirected(): boolean {
        return this._directed;
    }

    values<T>(obj: { [id: string]: GraphItem<T> }) {
        const retVal: T[] = [];
        for (const key in obj) {
            retVal.push(obj[key]._);
        }
        return retVal;
    }

    _idFunc = (_: any): string => typeof _.id === "function" ? _.id() : _.id;
    idFunc(_: (_: S | V | E) => string): this {
        this._idFunc = _;
        return this;
    }

    _sourceFunc = (_: any): string => typeof _.source === "function" ? _.source() : _.source;
    sourceFunc(_: (_: E) => string): this {
        this._sourceFunc = _;
        return this;
    }

    _targetFunc = (_: any): string => typeof _.target === "function" ? _.target() : _.target;
    targetFunc(_: (_: E) => string): this {
        this._targetFunc = _;
        return this;
    }

    id(_: S | V | E): string {
        return this._idFunc(_);
    }

    // Subgraphs  ---
    subgraphs(): S[] {
        return this.values(this._subgraphs);
    }

    subgraphExists(id: string): boolean {
        return !!this._subgraphs[id];
    }

    subgraph(id: string): S {
        return this._subgraphs[id]._;
    }

    addSubgraph(s: S, parent?: S): this {
        const s_id = this._idFunc(s);
        if (this._subgraphs[s_id]) throw new Error(`Subgraph '${s_id}' already exists.`);
        const subgraph = new Subgraph(this, s);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this._subgraphs[p_id]) throw new Error(`Subgraph '${p_id}' does not exist.`);
            subgraph.parent(this._subgraphs[p_id]);
        }
        this._subgraphs[s_id] = subgraph;
        return this;
    }

    removeSubgraph(id: string, promoteChildren = true): this {
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
        return this;
    }

    subgraphParent(id: string): S | undefined;
    subgraphParent(id: string, parentID: string): this;
    subgraphParent(id: string, parentID?: string): S | undefined | this {
        const item = this._subgraphs[id];
        if (!item) throw new Error(`Vertex '${id}' does not exist.`);
        if (parentID === void 0) {
            const parent = item.parent();
            return parent ? parent._ as S : undefined;
        }
        const parent = this._subgraphs[parentID];
        if (!parent) throw new Error(`Vertex parent '${parent}' does not exist.`);
        item.parent(parent);
        return this;
    }

    // Vertices  ---
    vertices(): V[] {
        return this.values(this._vertices);
    }

    vertexExists(id: string): boolean {
        return !!this._vertices[id];
    }

    vertex(id: string): V {
        return this._vertices[id]._;
    }

    private _neighbors(id: string): Vertex[] {
        return [...this._vertices[id].outEdges().map(e => e._target), ...this._vertices[id].inEdges().map(e => e._source)];
    }

    neighbors(id: string): V[] {
        return this._neighbors(id).map(n => n._);
    }

    singleNeighbors(id: string): V[] {
        return this._neighbors(id).filter(n => n.edgeCount() === 1).map(n => n._);
    }

    addVertex(v: V, parent?: S): this {
        const v_id = this._idFunc(v);
        if (this._vertices[v_id]) throw new Error(`Vertex '${v_id}' already exists.`);
        const vertex = new Vertex(this, v);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this.subgraphExists(p_id)) throw new Error(`Subgraph '${p_id}' does not exist.`);
            vertex.parent(this._subgraphs[p_id]);
        }
        this._vertices[v_id] = vertex;
        return this;
    }

    removeVertex(id: string): this {
        if (!this._vertices[id]) throw new Error(`Vertex '${id}' does not exist.`);
        this._vertices[id].edges().forEach(e => {
            this.removeEdge(e.id(), false);
        });
        delete this._vertices[id];
        return this;
    }

    vertexParent(id: string): S | undefined;
    vertexParent(id: string, parentID: string): this;
    vertexParent(id: string, parentID?: string): S | undefined | this {
        const item = this._vertices[id];
        if (!item) throw new Error(`Vertex '${id}' does not exist.`);
        if (parentID === void 0) {
            const parent = item.parent();
            return parent ? parent._ as S : undefined;
        }
        const parent = this._subgraphs[parentID];
        if (!parent) throw new Error(`Vertex parent '${parent}' does not exist.`);
        item.parent(parent);
        return this;
    }
    // Edges  ---
    edges(): E[] {
        return this.values(this._edges);
    }

    edgeExists(id: string): boolean {
        return !!this._edges[id];
    }

    edge(id: string): E {
        return this._edges[id]._;
    }

    addEdge(e: E): this {
        const e_id = this._idFunc(e);
        const e_source = this._sourceFunc(e);
        const e_target = this._targetFunc(e);
        if (this._edges[e_id]) throw new Error(`Edge '${e_id}' already exists.`);
        if (!this.vertexExists(e_source)) throw new Error(`Edge Source '${e_source}' does not exist.`);
        if (!this.vertexExists(e_target)) throw new Error(`Edge Target '${e_target}' does not exist.`);
        const edge = new Edge(this, e, this._vertices[e_source], this._vertices[e_target]);
        this._edges[e_id] = edge;
        this._vertices[e_source].addOutEdge(edge);
        this._vertices[e_target].addInEdge(edge);
        return this;
    }

    removeEdge(id: string, updateVertices = true): this {
        if (!this._edges[id]) throw new Error(`Vertex '${id}' does not exist.`);
        const edge = this._edges[id];
        if (updateVertices) {
            const e_source = this._sourceFunc(edge);
            if (!this.vertexExists(e_source)) throw new Error(`Edge Source'${e_source}' does not exist.`);
            this._vertices[e_source].removeOutEdge(id);
            const e_target = this._targetFunc(edge);
            if (!this.vertexExists(e_target)) throw new Error(`Edge Target'${e_target}' does not exist.`);
            this._vertices[e_target].removeInEdge(id);
        }
        delete this._edges[id];
        return this;
    }
}
