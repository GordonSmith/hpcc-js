import { Widget } from "@hpcc-js/common";
import { d3, ElementT, SVGZoomSurface } from "@hpcc-js/core";
import { Graph2 as GraphCollection } from "@hpcc-js/util";
import { geoMercator as d3GeoMercator } from "d3-geo";
import { tile as d3Tile, tileWrap as d3TileWrap } from "d3-tile";
import { Vertex } from "../Vertex";
import { Edge } from "./edge";
import { EdgePlaceholder, GeoForceDirected, ILayout, VertexPlaceholder } from "./layouts/index";

export interface Lineage {
    parent: Widget;
    child: Widget;
}

export interface IGraphData {
    subgraphs?: Widget[];
    vertices: Widget[];
    edges: Edge[];
    hierarchy?: Lineage[];
}

function safeRaise(domNode: Element) {
    const target = domNode;
    let nextSibling = target.nextSibling;
    while (nextSibling) {
        target.parentNode.insertBefore(nextSibling, target);
        nextSibling = target.nextSibling;
    }
}

// --- Map Support ---
function url(x, y, z) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=pk.eyJ1IjoibGVzY2htb28iLCJhIjoiY2psY2FqY3l3MDhqNDN3cDl1MzFmZnkwcCJ9.HRoFwmz1j80gyz18ruggqw`;
}
// --- Map Support ---

export class Graph extends SVGZoomSurface {

    protected _graphData = new GraphCollection<VertexPlaceholder, EdgePlaceholder>()
        .idFunc(d => d.id)
        .sourceFunc(e => e.source.id)
        .targetFunc(e => e.target.id)
        ;

    protected _edgeG: ElementT<SVGGElement, this>;
    protected _vertexG: ElementT<SVGGElement, this>;

    protected _dragHandler = d3.drag<Element, VertexPlaceholder>();
    protected _nodes: d3.Selection<SVGGElement, VertexPlaceholder, d3.BaseType, this> = d3.selectAll(null);
    protected _links: d3.Selection<SVGGElement, EdgePlaceholder, d3.BaseType, this> = d3.selectAll(null);

    // --- Map Support ---
    private _mapScale = 1 << 15;

    protected _levels: any;

    protected _projection = d3GeoMercator()
        .scale(this._mapScale / (2 * Math.PI))
        ;

    protected _tile = d3Tile()
        .tileSize(512)
        .clampX(false)
        ;
    // --- Map Support ---

    constructor() {
        super();
        const context = this;
        this._dragHandler
            .on("start", function (d) {
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
                d.fx = d.sx + (d3.event().x - d.sx) / context._transformScale;
                d.fy = d.sy + (d3.event().y - d.sy) / context._transformScale;
                context.moveVertexPlaceholder(d, false, true);
                context._graphData.singleNeighbors(d.id).forEach(n => {
                    n.fx = n.sx + d.fx - d.sx;
                    n.fy = n.sy + d.fy - d.sy;
                    context.moveVertexPlaceholder(n, false, true);
                });
            })
            .on("end", d => {
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
                this._layout.start();
            })
            ;
    }

    data(): IGraphData;
    data(_: IGraphData, merge?: boolean): this;
    data(_?: IGraphData, merge?: boolean): IGraphData | this {
        if (_ === void 0) {
            return {
                subgraphs: this._graphData.subgraphs(),
                vertices: this._graphData.vertices().map(d => d.widget),
                edges: this._graphData.edges().map(d => d.widget),
                hierarchy: []
            };
        }
        if (_.subgraphs) {
            _.subgraphs.forEach(sg => this._graphData.addSubgraph(sg));
        }
        _.vertices.forEach(v => this._graphData.addVertex({
            id: v.id(),
            widget: v
        }));
        _.edges.forEach(e => this._graphData.addEdge({
            id: e.id(),
            widget: e,
            source: this._graphData.vertex(e.sourceVertex().id()),
            target: this._graphData.vertex(e.targetVertex().id())
        }));
        return this;
    }

    layoutData() {
        return this._graphData;
    }

    _layout: ILayout;
    setLayout(layout: ILayout) {
        if (this._layout) {
            this._layout.stop();
        }
        this._layout = layout;
        this._layout.start();
    }

    project(lat: number, lng: number): [number, number] {
        return this._projection([lng, lat]);
    }

    moveEdgePlaceholder(ep: EdgePlaceholder, transition: boolean): this {
        ep.widget.move(ep.points || [
            [(ep.source.fx || ep.source.x || 0) * this._transformScale, (ep.source.fy || ep.source.y || 0) * this._transformScale],
            [(ep.target.fx || ep.target.x || 0) * this._transformScale, (ep.target.fy || ep.target.y || 0) * this._transformScale]
        ], transition);
        delete ep.points;
        return this;
    }

    moveEdges(transition: boolean): this {
        this._graphData.edges().forEach(e => this.moveEdgePlaceholder(e, transition));
        return this;
    }

    moveVertexPlaceholder(vp: VertexPlaceholder, transition: boolean, moveNeighbours: boolean): this {
        (transition ? vp.element.transition() : vp.element)
            .attr("transform", `translate(${(vp.fx || vp.x || 0) * this._transformScale} ${(vp.fy || vp.y || 0) * this._transformScale})`)
            ;
        if (moveNeighbours) {
            this._graphData.edges(vp.id).forEach(e => this.moveEdgePlaceholder(e, transition));
        }
        return this;
    }

    moveVertices(transition: boolean): this {
        this._graphData.vertices().forEach(v => this.moveVertexPlaceholder(v, transition, false));
        return this;
    }

    updateVertices(): this {
        this._nodes = this._vertexG.selectAll<SVGGElement, VertexPlaceholder>(".vertexPlaceholder")
            .data(this._graphData.vertices(), d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "vertexPlaceholder")
                    .each(function (d) {
                        d.widget.target(this);
                        d.element = d3.select(this);
                        if (d.widget instanceof Vertex) {
                            switch (d.widget.text()) {
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
                                case "ValjeanXXX":
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
                        d.widget.target(null);
                    })
                    .remove()
            ).each(function (d) {
                d.widget.render();
            })
            ;
        return this;
    }

    updateEdges(): this {
        this._links = this._edgeG.selectAll<SVGGElement, EdgePlaceholder>(".edgePlaceholder")
            .data(this._graphData.edges(), d => d.id)
            .join(
                enter => enter.append("g")
                    .attr("class", "edgePlaceholder")
                    .each(function (d) {
                        d.widget.target(this);
                    })
                ,
                update => update,
                exit => exit
                    .each(function (d) {
                        d.widget.target(null);
                    })
                    .remove()
            ).each(function (d) {
                d.widget.render();
            })
            ;
        return this;
    }

    enter(element) {
        super.enter(element);
        this._zoom.scaleExtent([0.0078125, 4096]);

        // --- Map Support ---
        const deltas = [-100, -4, -1, 0];
        this._levels = this._svgElement.insert("g", ":first-child")
            .attr("pointer-events", "none")
            .selectAll("g").data(deltas)
            .join("g")
            ;
        // --- Map Support ---

        this._edgeG = element.append("g");
        this._vertexG = element.append("g");
    }

    update(element) {
        super.update(element);

        this.updateEdges();
        this.updateVertices();

        // --- Map Support ---
        this.zoomed(d3.zoomTransform(this._svgElement.node()));
        // --- Map Support ---

        if (!this._layout) {
            this.setLayout(new GeoForceDirected(this));
        }
    }

    exit(element) {
        super.exit(element);
    }

    _minScale = 0.75;
    _maxScale = 1; // 9999999999999999999999999999.0;
    _prevWidth;
    _prevHeight;
    _prevTransformScale;
    _transformScale = 1;
    zoomed(transform) {
        super.zoomed(transform);
        const { width, height } = this.size();

        // --- Map Support ---
        const context = this;
        const mapTransform = transform.translate(width >> 1, height >> 1).scale(this._mapScale);
        this._levels.each(function (delta) {
            const tiles = context._tile.zoomDelta(delta)(mapTransform);

            d3.select(this)
                .selectAll("image")
                .data(tiles, d => d as any)
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
        // --- Map Support ---

        if (transform.k < this._minScale) {
            this._vertexG.attr("transform", `scale(${this._minScale / transform.k})`);
            this._edgeG.attr("transform", `scale(${this._minScale / transform.k})`);
            this._transformScale = transform.k / this._minScale;
        } else if (transform.k > this._maxScale) {
            this._vertexG.attr("transform", `scale(${this._maxScale / transform.k})`);
            this._edgeG.attr("transform", `scale(${this._maxScale / transform.k})`);
            this._transformScale = transform.k / this._maxScale;
        } else {
            this._transformScale = 1;
            this._vertexG.attr("transform", null);
            this._edgeG.attr("transform", null);
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
