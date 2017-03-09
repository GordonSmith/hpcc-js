import { forceSimulation as d3ForceSimulation } from "d3-force";
import * as dagre from "dagre";

export function Circle(graphData?, width?, height?, radius?) {
    const context = this;
    this.pos = {};

    //  Initial Positions  ---
    const padding = 0;
    radius = radius || (width < height ? width - padding : height - padding) / 2;
    const order = graphData.nodeCount();
    let currStep = -Math.PI / 2;
    const step = 2 * Math.PI / order;
    graphData.eachNode(function (u, value) {
        const size = value.getBBox(true);
        const maxSize = Math.max(size.width, size.height);
        context.pos[u] = {
            x: value.fixed ? value.x : Math.cos(currStep) * (radius - maxSize),
            y: value.fixed ? value.y : Math.sin(currStep) * (radius - maxSize),
            width: size.width,
            height: size.height
        };
        currStep += step;
    });
}
Circle.prototype.nodePos = function (u) {
    return this.pos[u];
};
Circle.prototype.edgePoints = function (_e) {
    return [];
};

export function None(graphData, _width, _height, _radius) {
    const context = this;
    this.pos = {};

    graphData.eachNode(function (u, value) {
        context.pos[u] = {
            x: value.x,
            y: value.y,
            width: value.width,
            height: value.height
        };
    });
}
None.prototype.nodePos = function (u) {
    return this.pos[u];
};
None.prototype.edgePoints = function (_e) {
    return [];
};

export function ForceDirected(graphData, _width, _height, options) {
    options = options || {};
    const context = this;
    this.pos = {};

    this.vertices = [];
    this.vertexMap = {};
    graphData.eachNode(function (u) {
        const value = graphData.node(u);
        const size = value.getBBox(true);
        const newItem = {
            id: u,
            x: value.pos().x,
            y: value.pos().y,
            width: size.width,
            height: size.height,
            value
        };
        context.vertices.push(newItem);
        context.vertexMap[u] = newItem;
    });
    this.edges = [];
    graphData.eachEdge(function (_e, s, t) {
        context.edges.push({
            source: context.vertexMap[s],
            target: context.vertexMap[t]
        });
    });
    this.force = d3ForceSimulation()
        //.linkDistance(options.linkDistance)
        //.linkStrength(options.linkStrength)
        //.friction(options.friction)
        //.charge(function (d) {
        //    const cs = d.value.getBBox();
        //    return options.charge * Math.max(cs.width, cs.height);
        //})
        //.chargeDistance(options.chargeDistance)
        //.theta(options.theta)
        //.gravity(options.gravity)
        .nodes(this.vertices)
        //.links(this.edges)
        ;
    if (options.oneShot) {
        this.force.start();
        let total = graphData.nodeCount();
        total = Math.min(total * total, 500);
        for (let i = 0; i < total; ++i) {
            this.force.tick();
        }
        this.force.stop();
    }
}
ForceDirected.prototype.nodePos = function (u) {
    return this.vertexMap[u];
};
ForceDirected.prototype.edgePoints = function (_e) {
    return [];
};

export function Hierarchy(graphData, _width, _height, options) {
    const digraph = new dagre.graphlib.Graph({ multigraph: true, compound: true })
        .setGraph(options)
        .setDefaultNodeLabel(function () { return {}; })
        .setDefaultEdgeLabel(function () { return {}; })
        ;
    graphData.eachNode(function (u) {
        const value = graphData.node(u);
        const clientSize = value.getBBox();
        digraph.setNode(u, {
            width: clientSize.width,
            height: clientSize.height
        });
    });
    graphData.eachEdge(function (e, s, t) {
        const value = graphData.edge(e);
        digraph.setEdge(s, t, {
            weight: value.weight()
        }, value._id);
    });
    graphData.eachNode(function (u) {
        digraph.setParent(u, graphData.parent(u));
    });
    this.dagreLayout = dagre.layout(digraph);
    const deltaX = -digraph.graph().width / 2;
    const deltaY = -digraph.graph().height / 2;
    digraph.nodes().forEach(function (u) {
        const value = digraph.node(u);
        value.x += deltaX;
        value.y += deltaY;
    });
    digraph.edges().forEach(function (e) {
        const value = digraph.edge(e);
        for (let i = 0; i < value.points.length; ++i) {
            value.points[i].x += deltaX;
            value.points[i].y += deltaY;
        }
    });
    this.digraph = digraph;
}
Hierarchy.prototype.nodePos = function (u) {
    return this.digraph.node(u);
};
Hierarchy.prototype.edgePoints = function (edge) {
    return this.digraph.edge(edge._sourceVertex.id(), edge._targetVertex.id(), edge._id).points;
};
