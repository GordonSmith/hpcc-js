import { ElementT, Size } from "@hpcc-js/core";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { EdgeProps, VertexProps } from "../components/icon";

export interface VertexPlaceholder {
    id: string;
    element?: ElementT<SVGGElement, VertexPlaceholder>;
    props: VertexProps;

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

    //  Geo Locations  ---
    lat?: number;
    lng?: number;
}

export interface EdgePlaceholder {
    id: string;
    element?: ElementT<SVGLineElement, VertexPlaceholder>;
    props: EdgeProps;
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
    moveEdgePlaceholder(ep: EdgePlaceholder, transition: boolean): this;
    moveEdges(transition: boolean): this;
    moveVertexPlaceholder(vp: VertexPlaceholder, transition: boolean, moveEdges: boolean): this;
    moveVertices(transition: boolean): this;
    project(lat: number, lng: number): [number, number];
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
