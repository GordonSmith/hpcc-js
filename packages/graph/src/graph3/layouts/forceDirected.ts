import { forceCenter as d3ForceCenter, forceLink as d3ForceLink, forceManyBody as d3ForceManyBody, forceSimulation as d3ForceSimulation } from "d3-force";
import { Layout } from "./layout";

export class ForceDirected extends Layout {

    _links;
    _charge;
    _center;
    _simulation: any;

    start() {
        super.start();
        const size = this._graph.size();
        const data = this._graph.layoutData();
        this._links = d3ForceLink(data.edges())
            .id(d => d.id)
            .distance(300)
            ;
        this._charge = d3ForceManyBody();
        this._center = d3ForceCenter(size.width / 2, size.height / 2);
        this._simulation = d3ForceSimulation(data.vertices())
            .force("link", this._links)
            .force("charge", this._charge)
            .force("center", this._center)
            .stop()
            ;

        this._simulation.on("tick", () => {
            this._graph
                .moveEdges(true)
                .moveVertices(true)
                ;
        });

        this._simulation.on("end", () => {
            this._running = false;
        });

        this._simulation.restart();
        return this;
    }

    stop() {
        this._simulation.stop();
        return super.stop();
    }
}
