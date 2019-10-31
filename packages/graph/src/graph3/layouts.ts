import { dispatch as d3Dispatch } from "d3-dispatch";
import { forceCenter as d3ForceCenter, forceLink as d3ForceLink, forceManyBody as d3ForceManyBody, forceSimulation as d3ForceSimulation } from "d3-force";

export interface ILayout {
    on(eventID: "start" | "tick" | "end", callback: () => void): this;

    start(): this;
    stop(): this;
    running(): boolean;

    fixVertexPos(id: string, pos?: [number, number]): this;
    vertexPos(id: string): [number, number];
    edgePoints(id: string): Array<[number, number]>;
}

export class ForceDirected implements ILayout {
    protected _dispatch = d3Dispatch("start", "tick", "end");

    protected _vertices = {};
    protected _edges = {};
    _links;
    _charge;
    _center;
    _simulation: any;
    _running = false;

    constructor(vertices: any[], edges: any[], width: number, height: number) {
        vertices.forEach(v => this._vertices[v.id] = this._vertices[v.id] || v);
        edges.forEach(e => this._edges[e.id] = this._edges[e.id] || e);
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

    fixVertexPos(id: string, pos?: [number, number]): this {
        const v = this._vertices[id];
        if (pos === void 0) {
            v.x = v.fx || v.x;
            v.y = v.fy || v.y;
        }
        v.fx = pos && pos[0];
        v.fy = pos && pos[1];
        return this;
    }

    vertexPos(id: string): [number, number] {
        const v = this._vertices[id];
        return [v.fx || v.x || 0, v.fy || v.y || 0];

    }

    edgePoints(id: string): Array<[number, number]> {
        const e = this._edges[id];
        return [
            [e.source.fx || e.source.x || 0, e.source.fy || e.source.y || 0],
            [e.target.fx || e.target.x || 0, e.target.fy || e.target.y || 0]
        ];
    }
}
