import { drag as d3Drag, event as d3Event, HTMLWidget, select as d3Select, Widget, zoom as d3Zoom, zoomTransform as d3ZoomTransform } from "@hpcc-js/common";
import * as React from "@hpcc-js/preact-shim";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { geoMercator as d3GeoMercator } from "d3-geo";
import { curveBasis as d3CurveBasis, line as d3Line } from "d3-shape";
import { tile as d3Tile, tileWrap as d3TileWrap } from "d3-tile";
import "d3-transition";
import { GraphLayoutType } from "./Graph";
import { EdgeProps, SubgraphProps, Vertex, VertexProps } from "./icon";
import { Circle, Dagre, EdgePlaceholder, ForceDirected, ForceDirectedAnimated, ILayout, Null, VertexPlaceholder } from "./layouts/index";

const line = d3Line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3CurveBasis);

import "../src/Graph2.css";

type Point = [number, number];
export class LiteSVGZoomWidget extends HTMLWidget {
    _svgDef: any;
    _zoomElement: any;
    _zoom = d3Zoom();

    constructor() {
        super();
        this._tag = "svg";
        this._drawStartPos = "origin";
    }

    resize(size?) {
        const retVal = super.resize(size);
        if (this._element) {
            this._element
                .style("width", this._size.width + "px")
                .style("height", this._size.height + "px")
                ;
        }
        return retVal;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        this.resize();
        this._svgDef = element.append("def");
        this._zoomElement = element.append("g");
        this._zoom.on("zoom", () => this.zoomed(d3Event.transform));
        element.call(this._zoom);
    }

    update(domNode, element) {
        super.update(domNode, element);
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    zoomed(transform) {
        this._zoomElement.attr("transform", transform);
    }
}
LiteSVGZoomWidget.prototype._class += " graph_SVGZoomLiteWidget";

export interface Lineage2 {
    parent: Widget;
    child: Widget;
}

export interface IGraphData2 {
    subgraphs?: SubgraphProps[];
    vertices: VertexProps[];
    edges: EdgeProps[];
    hierarchy?: Lineage2[];
}

function safeRaise(domNode: Element) {
    const target = domNode;
    let nextSibling = target.nextSibling;
    while (nextSibling) {
        target.parentNode.insertBefore(nextSibling, target);
        nextSibling = target.nextSibling;
    }
}

function url(x, y, z) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=pk.eyJ1IjoibGVzY2htb28iLCJhIjoiY2psY2FqY3l3MDhqNDN3cDl1MzFmZnkwcCJ9.HRoFwmz1j80gyz18ruggqw`;
}

export class LiteMapWidget extends LiteSVGZoomWidget {

    protected _mapVisible = true;
    private _mapScale = 1 << 15;

    protected _levels: any;

    protected _projection = d3GeoMercator()
        .scale(this._mapScale / (2 * Math.PI))
        ;

    protected _tile = d3Tile()
        .tileSize(512)
        .clampX(false)
        ;

    project(lat: number, lng: number): [number, number] {
        return this._projection([lng, lat]);
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        this._zoom.scaleExtent([0.0078125, 4096]);
        const deltas = [-100, -4, -1, 0];
        this._levels = element.insert("g", "g")
            .attr("pointer-events", "none")
            .selectAll("g").data(deltas)
            .join("g")
            ;

        this.mapZoomed(d3ZoomTransform(this._element.node()));
    }

    mapZoomed(transform) {
        const { width, height } = this.size();

        const context = this;
        const mapTransform = transform.translate(width >> 1, height >> 1).scale(this._mapScale);
        this._levels.each(function (delta) {
            const tiles = context._mapVisible ? context._tile.zoomDelta(delta)(mapTransform) : [];
            d3Select(this).selectAll("image").data(tiles, d => d as any)
                .join("image")
                .attr("xlink:href", d => {
                    const tmp = d3TileWrap(d) as [number, number, number];
                    return url(...tmp);
                })
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .attr("width", tiles.scale)
                .attr("height", tiles.scale)
                ;
        });

        this._projection
            .translate([width >> 1, height >> 1])
            ;
    }

    zoomed(transform) {
        super.zoomed(transform);
        this.mapZoomed(transform);
    }
}

export class Graph2 extends LiteMapWidget {

    protected _graphData = new GraphCollection<VertexPlaceholder, EdgePlaceholder>()
        .idFunc(d => d.id)
        .sourceFunc(e => e.source.id)
        .targetFunc(e => e.target.id)
        ;

    protected _edgeG: any;
    protected _subgraphG: any;
    protected _vertexG: any;

    protected _dragHandler = d3Drag<Element, VertexPlaceholder>();

    constructor() {
        super();
        const context = this;
        this._dragHandler
            .on("start", function (d) {
                d3Select(this).classed("grabbed", true);
                d.fx = d.sx = d.x;
                d.fy = d.sy = d.y;
                safeRaise(this);
                context.moveVertexPlaceholder(d, false, true);
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.fx = n.sx = n.x;
                    n.fy = n.sy = n.y;
                });
            })
            .on("drag", d => {
                d.fx = d.sx + (d3Event.x - d.sx) / context._transformScale;
                d.fy = d.sy + (d3Event.y - d.sy) / context._transformScale;
                context.moveVertexPlaceholder(d, false, true);
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.fx = n.sx + d.fx - d.sx;
                    n.fy = n.sy + d.fy - d.sy;
                    context.moveVertexPlaceholder(n, false, true);
                });
            })
            .on("end", function (d) {
                d.x = d.fx;
                d.y = d.fy;
                d.fx = d.sx = undefined;
                d.fy = d.sy = undefined;
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.x = n.fx;
                    n.y = n.fy;
                    n.fx = n.sx = undefined;
                    n.fy = n.sy = undefined;
                });
                d3Select(this).classed("grabbed", false);
                context._layoutAlgo.start();
            })
            ;
    }

    data(): IGraphData2;
    data(_: IGraphData2, merge?: boolean): this;
    data(_?: IGraphData2, merge?: boolean): IGraphData2 | this {
        if (_ === void 0) {
            return {
                subgraphs: this._graphData.subgraphs().map(d => d.props),
                vertices: this._graphData.vertices().map(d => d.props),
                edges: this._graphData.edges().map(d => d.props),
                hierarchy: []
            };
        }

        this._graphData.mergeSubgraphs((_.subgraphs || []).map(sg => ({
            id: sg.id,
            props: sg
        })));

        this._graphData.mergeVertices(_.vertices.map(v => ({
            id: v.id,
            props: v
        })));

        this._graphData.mergeEdges(_.edges.map(e => ({
            id: e.id,
            props: e,
            source: this._graphData.vertex(e.source.id),
            target: this._graphData.vertex(e.target.id)
        })));

        return this;
    }

    graphData(): GraphCollection<VertexPlaceholder, EdgePlaceholder> {
        return this._graphData;
    }

    protected _layoutAlgo: ILayout;
    setLayout(layout: ILayout) {
        if (this._layoutAlgo) {
            this._layoutAlgo.stop();
        }
        this._layoutAlgo = layout;
        this._layoutAlgo.start();
    }

    moveEdgePlaceholderLine(ep: EdgePlaceholder, transition: boolean): this {
        ep.element && (transition ? ep.element.transition() : ep.element)
            .attr("x1", ep.source.props.x)
            .attr("y1", ep.source.props.y)
            .attr("x2", ep.target.props.x)
            .attr("y2", ep.target.props.y)
            ;
        delete ep.points;
        return this;
    }

    protected calcArc(points: Point[], curveDepth = 16): Point[] {
        if (points.length === 2 && curveDepth) {
            const dx = points[0][0] - points[1][0];
            const dy = points[0][1] - points[1][1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist) {
                const midX = (points[0][0] + points[1][0]) / 2 - dy * curveDepth / 100;
                const midY = (points[0][1] + points[1][1]) / 2 + dx * curveDepth / 100;
                return [points[0], [midX, midY], points[1]];
            }
        }
        return points;
    }

    moveEdgePlaceholder(ep: EdgePlaceholder, transition: boolean): this {
        const d = line(this.calcArc([[ep.source.props.x, ep.source.props.y], [ep.target.props.x, ep.target.props.y]]));
        ep.element && (transition ? ep.element.transition() : ep.element)
            .attr("d", d)
            .attr("y1", ep.source.props.y)
            .attr("x2", ep.target.props.x)
            .attr("y2", ep.target.props.y)
            ;
        delete ep.points;
        return this;
    }

    moveVertexPlaceholder(vp: VertexPlaceholder, transition: boolean, moveNeighbours: boolean): this {
        const rf = 10;
        vp.props.x = Math.round((vp.fx || vp.x || 0) * this._transformScale * rf) / rf;
        vp.props.y = Math.round((vp.fy || vp.y || 0) * this._transformScale * rf) / rf;
        vp.element && (transition ? vp.element.transition() : vp.element)
            .attr("transform", `translate(${vp.props.x} ${vp.props.y})`)
            ;
        if (moveNeighbours) {
            this._graphData.edges(vp.id).forEach(e => this.moveEdgePlaceholder(e, transition));
        }
        return this;
    }

    moveEdges(transition: boolean): this {
        this._graphData.edges().forEach(e => this.moveEdgePlaceholder(e, transition));
        return this;
    }

    moveVertices(transition: boolean): this {
        this._graphData.vertices().forEach(v => this.moveVertexPlaceholder(v, transition, false));
        return this;
    }

    updateEdges(): this {
        this._edgeG.selectAll(".edgePlaceholder")
            .data(this._graphData.edges(), d => d.id)
            .join(
                enter => enter.append("path")
                    .attr("class", "edgePlaceholder")
                    .each(function (d) {
                        d.element = d3Select(this);
                    })
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        delete d.element;
                    })
                    .remove()
            )
            ;
        return this;
    }

    updateVertices(): this {
        this._vertexG.selectAll(".vertexPlaceholder")
            .data(this._graphData.vertices(), d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d) {
                        d.element = d3Select(this);
                        if (d.props instanceof Vertex) {
                            switch (d.props.text) {
                                case "Jondrette":
                                    d.lat = 51.8985;
                                    d.lng = -8.4756;
                                    break;
                                case "Myriel":
                                    d.lat = 48.8566;
                                    d.lng = 2.3522;
                                    break;
                                case "Combeferre":
                                    d.lat = 51.5074;
                                    d.lng = 0.1278;
                                    break;
                                case "Valjean":
                                    d.lat = 40.7128;
                                    d.lng = -74.0060;
                                    break;
                            }
                        }
                    })
                    .on("mouseover", function (d) {
                        safeRaise(this);
                    })
                    .call(this._dragHandler)
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        delete d.element;
                    })
                    .remove()
            ).each(function (d) {
                React.render(React.createElement(Vertex, d.props), this);
            })
            ;
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);

        this._edgeG = this._zoomElement.append("g");
        this._subgraphG = this._zoomElement.append("g");
        this._vertexG = this._zoomElement.append("g");
    }

    private _prevLayout;
    update(domNode, element) {
        super.update(domNode, element);

        this.updateEdges();
        this.updateVertices();

        if (this._prevLayout !== this.layout()) {
            this._prevLayout = this.layout();
            switch (this._prevLayout) {
                case "None":
                    this.setLayout(new Null(this));
                    break;
                case "Circle":
                    this.setLayout(new Circle(this));
                    break;
                case "ForceDirected":
                    this.setLayout(new ForceDirected(this));
                    break;
                case "ForceDirected2":
                    this.setLayout(new ForceDirectedAnimated(this));
                    break;
                case "Hierarchy":
                    this.setLayout(new Dagre(this));
                    break;
            }
        }
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    private _minScale = 0.75;
    private _maxScale = 1.0;
    private _prevWidth;
    private _prevHeight;
    private _prevTransformScale;
    private _transformScale = 1;
    zoomed(transform) {
        super.zoomed(transform);
        const { width, height } = this.size();

        if (transform.k < this._minScale) {
            this._edgeG.attr("transform", `scale(${this._minScale / transform.k})`);
            this._subgraphG.attr("transform", `scale(${this._minScale / transform.k})`);
            this._vertexG.attr("transform", `scale(${this._minScale / transform.k})`);
            this._transformScale = transform.k / this._minScale;
        } else if (transform.k > this._maxScale) {
            this._edgeG.attr("transform", `scale(${this._maxScale / transform.k})`);
            this._subgraphG.attr("transform", `scale(${this._maxScale / transform.k})`);
            this._vertexG.attr("transform", `scale(${this._maxScale / transform.k})`);
            this._transformScale = transform.k / this._maxScale;
        } else {
            this._transformScale = 1;
            this._edgeG.attr("transform", null);
            this._subgraphG.attr("transform", null);
            this._vertexG.attr("transform", null);
        }

        if (this._prevTransformScale !== this._transformScale ||
            this._prevWidth !== width ||
            this._prevHeight !== height) {
            this._prevTransformScale = this._transformScale;
            this._prevWidth = width;
            this._prevHeight = height;
            this
                .moveVertices(false)
                .moveEdges(false)
                ;
        }
    }
}
Graph2.prototype._class += " graph_Graph2";

export interface Graph2 {
    allowDragging(): boolean;
    allowDragging(_: boolean): this;
    dragSingleNeighbors(): boolean;
    dragSingleNeighbors(_: boolean): this;
    layout(): GraphLayoutType;
    layout(_: GraphLayoutType): this;
    // scale: { (): string; (_: string): this; };
    applyScaleOnLayout(): boolean;
    applyScaleOnLayout(_: boolean): this;
    highlightOnMouseOverVertex(): boolean;
    highlightOnMouseOverVertex(_: boolean): this;
    highlightOnMouseOverEdge(): boolean;
    highlightOnMouseOverEdge(_: boolean): this;
    transitionDuration(): number;
    transitionDuration(_: number): this;
    showEdges(): boolean;
    showEdges(_: boolean): this;
    snapToGrid(): number;
    snapToGrid(_: number): this;
    selectionClearOnBackgroundClick(): boolean;
    selectionClearOnBackgroundClick(_: boolean): this;

    centroidColor(): string;
    centroidColor(_: string): this;
    highlightSelectedPathToCentroid(): boolean;
    highlightSelectedPathToCentroid(_: boolean): this;

    hierarchyRankDirection(): string;
    hierarchyRankDirection(_: string): this;
    hierarchyNodeSeparation(): number;
    hierarchyNodeSeparation(_: number): this;
    hierarchyEdgeSeparation(): number;
    hierarchyEdgeSeparation(_: number): this;
    hierarchyRankSeparation(): number;
    hierarchyRankSeparation(_: number): this;
    hierarchyDigraph(): boolean;
    hierarchyDigraph(_: boolean): this;

    forceDirectedLinkDistance(): number;
    forceDirectedLinkDistance(_: number): this;
    forceDirectedLinkStrength(): number;
    forceDirectedLinkStrength(_: number): this;
    forceDirectedFriction(): number;
    forceDirectedFriction(_: number): this;
    forceDirectedCharge(): number;
    forceDirectedCharge(_: number): this;
    forceDirectedChargeDistance(): number;
    forceDirectedChargeDistance(_: number): this;
    forceDirectedTheta(): number;
    forceDirectedTheta(_: number): this;
    forceDirectedGravity(): number;
    forceDirectedGravity(_: number): this;
}

Graph2.prototype.publish("allowDragging", true, "boolean", "Allow Dragging of Vertices", null, { tags: ["Advanced"] });
Graph2.prototype.publish("dragSingleNeighbors", false, "boolean", "Dragging a Vertex also moves its singleton neighbors", null, { tags: ["Advanced"] });
Graph2.prototype.publish("layout", "Circle", "set", "Default Layout", ["Circle", "ForceDirected", "ForceDirected2", "Hierarchy", "None"], { tags: ["Basic"] });
Graph2.prototype.publish("scale", "100%", "set", "Zoom Level", ["all", "width", "selection", "100%", "90%", "75%", "50%", "25%", "10%"], { tags: ["Basic"] });
Graph2.prototype.publish("applyScaleOnLayout", false, "boolean", "Shrink to fit on Layout", null, { tags: ["Basic"] });
Graph2.prototype.publish("highlightOnMouseOverVertex", false, "boolean", "Highlight Vertex on Mouse Over", null, { tags: ["Basic"] });
Graph2.prototype.publish("highlightOnMouseOverEdge", false, "boolean", "Highlight Edge on Mouse Over", null, { tags: ["Basic"] });
Graph2.prototype.publish("transitionDuration", 250, "number", "Transition Duration", null, { tags: ["Intermediate"] });
Graph2.prototype.publish("showEdges", true, "boolean", "Show Edges", null, { tags: ["Intermediate"] });
Graph2.prototype.publish("snapToGrid", 0, "number", "Snap to Grid", null, { tags: ["Private"] });
Graph2.prototype.publish("selectionClearOnBackgroundClick", false, "boolean", "Clear selection on background click");

Graph2.prototype.publish("centroidColor", "#00A000", "html-color", "Centroid Color", null, { tags: ["Basic"] });
Graph2.prototype.publish("highlightSelectedPathToCentroid", false, "boolean", "Highlight path to Center Vertex (for selected vertices)", null, { tags: ["Basic"] });

Graph2.prototype.publish("hierarchyRankDirection", "TB", "set", "Direction for Rank Nodes", ["TB", "BT", "LR", "RL"], { tags: ["Advanced"] });
Graph2.prototype.publish("hierarchyNodeSeparation", 50, "number", "Number of pixels that separate nodes horizontally in the layout", null, { tags: ["Advanced"] });
Graph2.prototype.publish("hierarchyEdgeSeparation", 10, "number", "Number of pixels that separate edges horizontally in the layout", null, { tags: ["Advanced"] });
Graph2.prototype.publish("hierarchyRankSeparation", 50, "number", "Number of pixels between each rank in the layout", null, { tags: ["Advanced"] });
Graph2.prototype.publish("hierarchyDigraph", true, "boolean", "Directional Graph2", null, { tags: ["Advanced"] });

Graph2.prototype.publish("forceDirectedLinkDistance", 300, "number", "Target distance between linked nodes", null, { tags: ["Advanced"] });
Graph2.prototype.publish("forceDirectedLinkStrength", 1, "number", "Strength (rigidity) of links", null, { tags: ["Advanced"] });
Graph2.prototype.publish("forceDirectedFriction", 0.9, "number", "Friction coefficient", null, { tags: ["Advanced"] });
Graph2.prototype.publish("forceDirectedCharge", -25, "number", "Charge strength ", null, { tags: ["Advanced"] });
Graph2.prototype.publish("forceDirectedChargeDistance", 10000, "number", "Maximum distance over which charge forces are applied", null, { tags: ["Advanced"] });
Graph2.prototype.publish("forceDirectedTheta", 0.8, "number", "Barnes–Hut approximation criterion", null, { tags: ["Advanced"] });
Graph2.prototype.publish("forceDirectedGravity", 0.1, "number", "Gravitational strength", null, { tags: ["Advanced"] });

const _origScale = Graph2.prototype.scale;
Graph2.prototype.scale = function (_?, transitionDuration?) {
    const retVal = _origScale.apply(this, arguments);
    if (arguments.length) {
        this.zoomTo(_, transitionDuration);
    }
    return retVal;
};
