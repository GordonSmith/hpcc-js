import { GraphLabel, graphlib, layout } from "dagre";
import { Layout } from "./layout";

export class Dagre extends Layout {

    _options: GraphLabel = {
    };

    start() {
        super.start();
        const size = this._graph.size();
        const data = this._graph.layoutData();
        const digraph = new graphlib.Graph({ multigraph: true, compound: false })
            .setGraph({
                compound: false

            })
            .setDefaultNodeLabel(function () { return {}; })
            .setDefaultEdgeLabel(function () { return {}; })
            ;
        data.vertices().forEach(vp => {
            digraph.setNode(vp.id, vp);
        });
        data.edges().forEach(ep => {
            digraph.setEdge(ep.source.id, ep.target.id, ep, ep.id);
        });
        /*
        graphData.eachNode(function (u) {
            digraph.setParent(u, graphData.parent(u));
        });
        */
        layout(digraph, { debugTiming: false } as GraphLabel);
        const deltaX = -digraph.graph().width / 2 + size.width / 2;
        const deltaY = -digraph.graph().height / 2 + size.height / 2;
        digraph.nodes().forEach(function (u) {
            const vp = digraph.node(u) as any;
            vp.x += deltaX;
            vp.y += deltaY;
        });
        digraph.edges().forEach(function (e) {
            const ep = digraph.edge(e) as any;
            ep.points = ep.points.map(p => [p.x + deltaX, p.y + deltaY]);
        });
        this._graph.moveEdges(true);
        this._graph.moveVertices(true);
        this.stop();
        return this;
    }
}
