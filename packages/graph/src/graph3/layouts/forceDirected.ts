import { forceCenter as d3ForceCenter, forceLink as d3ForceLink, forceManyBody as d3ForceManyBody, forceSimulation as d3ForceSimulation } from "d3-force";
import { Layout } from "./layout";

export const defaultOptions = {
    linkDistance: 300,
    linkStrength: 1,
    velocityDecay: 0.9,
    charge: -25,
    chargeDistance: 10000,
    theta: 0.8,
    gravity: 0.1
};

export class ForceDirectedBase extends Layout {

    protected _links;
    protected _charge;
    protected _center;
    protected _simulation;

    constructor(graph, readonly _options = defaultOptions) {
        super(graph);
    }

    start() {
        super.start();
        const size = this._graph.size();
        const data = this._graph.layoutData();
        this._links = d3ForceLink(data.edges())
            .id(d => d.id)
            .distance(this._options.linkDistance)
            .strength(this._options.linkStrength)
            ;
        this._charge = d3ForceManyBody()
            .strength(d => this._options.charge * Math.max(d.width, d.height))
            ;
        this._center = d3ForceCenter(size.width / 2, size.height / 2);
        this._simulation = d3ForceSimulation()
            .force("link", this._links)
            .force("charge", this._charge)
            .force("center", this._center)
            .nodes(data.vertices().map(v => {
                const { width, height } = v.widget.getBBox();
                v["width"] = width;
                v["height"] = height;
                return v;
            }))
            .stop()
            ;

        return this;
    }

    stop() {
        this._simulation.stop();
        return super.stop();
    }
}

export class ForceDirected extends ForceDirectedBase {

    start() {
        super.start();
        this._simulation
            .velocityDecay(0.1)
            .restart()
            ;
        let total = this._graph.layoutData().vertices().length;
        total = Math.min(total * total, 500);
        for (let i = 0; i < total; ++i) {
            this._simulation.tick();
        }
        this._simulation.stop();
        this._graph
            .moveVertices(true)
            .moveEdges(true)
            ;
        this.stop();

        return this;
    }
}

export class ForceDirectedAnimated extends ForceDirectedBase {

    start() {
        super.start();
        this._simulation
            .velocityDecay(this._options.velocityDecay)
            .on("tick", () => {
                this._graph
                    .moveVertices(false)
                    .moveEdges(false)
                    ;
            })
            .on("end", () => {
                this._running = false;
            })
            .restart()
            ;
        return this;
    }
}
