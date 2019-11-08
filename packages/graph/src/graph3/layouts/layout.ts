import { Widget } from "@hpcc-js/common";
import { ElementT, Size } from "@hpcc-js/core";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { Edge } from "../edge";

export interface VertexPlaceholder {
    id: string;
    widget: Widget;
    element?: ElementT<SVGGElement, VertexPlaceholder>;

    //  D3 Assigned Properties  ---
    index?: number; // The node’s zero-based index into nodes
    x?: number; // The node’s current x-position
    y?: number; // The node’s current y-position
    fx?: number; // The node’s fixed x-position
    fy?: number; // The node’s fixed y-position
    vx?: number; // The node’s current x-velocity
    vy?: number; // The node’s current y-velocity

    //  HPCC Drag /Drop Assigned Properties  ---
    sx?: number; // The node’s drag start x
    sy?: number; // The node’s drag start y
}

export interface EdgePlaceholder {
    id: string;
    widget: Edge;
    source: VertexPlaceholder; // The link’s source node
    target: VertexPlaceholder; // The link’s target node

    //  D3 Assigned Properties  ---
    index?: number; // The zero-based index into links, assigned by this method

    //  Dagre Assigned Properties  ---
    points?: Array<[number, number]>;
}

export interface ILayout {
    start(): this;
    stop(): this;
    running(): boolean;
}

export interface IGraph {
    size(): Size;
    layoutData(): GraphCollection<VertexPlaceholder, EdgePlaceholder>;
    moveVertexPlaceholder(vp: VertexPlaceholder, moveEdges: boolean, transition: boolean): this;
    moveVertices(moveEdges: boolean, transition: boolean): this;
}

export class Layout implements ILayout {

    protected _graph: IGraph;
    protected _running = false;

    constructor(graph: IGraph) {
        this._graph = graph;
    }

    start() {
        this._running = true;
        return this;
    }

    stop() {
        this._running = false;
        return this;
    }

    running(): boolean {
        return this._running;
    }
}