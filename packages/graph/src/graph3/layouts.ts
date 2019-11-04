import { Widget } from "@hpcc-js/common";
import { dispatch as d3Dispatch } from "d3-dispatch";
import { forceCenter as d3ForceCenter, forceLink as d3ForceLink, forceManyBody as d3ForceManyBody, forceSimulation as d3ForceSimulation } from "d3-force";
import { Edge } from "./edge";

export interface VertexPlaceholder {
    id: string;
    widget: Widget;

    //  D3 Assigned Properties  ---
    index?: number; // The node’s zero-based index into nodes
    x?: number; // The node’s current x-position
    y?: number; // The node’s current y-position
    fx?: number; // The node’s fixed x-position
    fy?: number; // The node’s fixed y-position
    vx?: number; // The node’s current x-velocity
    vy?: number; // The node’s current y-velocity

    //  HPCC Assigned Properties  ---
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
}

export interface ILayout {
    on(eventID: "start" | "tick" | "end", callback: () => void): this;

    start(): this;
    stop(): this;
    running(): boolean;
}

export class Layout implements ILayout {
    protected _vertices: { [id: string]: VertexPlaceholder } = {};
    protected _edges: { [id: string]: EdgePlaceholder } = {};

    protected _dispatch = d3Dispatch("start", "tick", "end");
    protected _running = false;

    constructor(vertices: VertexPlaceholder[], edges: EdgePlaceholder[]) {
        vertices.forEach(v => this._vertices[v.id] = this._vertices[v.id] || v);
        edges.forEach(e => this._edges[e.id] = this._edges[e.id] || e);
    }

    on(eventID: "start" | "tick" | "end", callback: (...args: any[]) => void) {
        this._dispatch.on(eventID, callback);
        return this;
    }

    start() {
        this._dispatch.call("start");
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

export class NullDirected extends Layout {

}

export class ForceDirected extends Layout {

    _links;
    _charge;
    _center;
    _simulation: any;

    constructor(vertices: VertexPlaceholder[], edges: EdgePlaceholder[], width: number, height: number) {
        super(vertices, edges);
        this._links = d3ForceLink(edges)
            .id(d => d.id)
            .distance(300)
            ;
        this._charge = d3ForceManyBody();
        this._center = d3ForceCenter(width / 2, height / 2);
        this._simulation = d3ForceSimulation(vertices)
            .force("link", this._links)
            .force("charge", this._charge)
            .force("center", this._center)
            .stop()
            ;

        this._simulation.on("tick", () => {
            this._dispatch.call("tick");
        });

        this._simulation.on("end", () => {
            this._running = false;
            this._dispatch.call("end");
        });
    }

    on(eventID: "start" | "tick" | "end", callback: (...args: any[]) => void) {
        this._dispatch.on(eventID, callback);
        return this;
    }

    start() {
        this._dispatch.call("start");
        this._running = true;
        this._simulation.restart();
        return this;
    }

    stop() {
        this._simulation.stop();
        return this;
    }

    running(): boolean {
        return this._running;
    }
}
