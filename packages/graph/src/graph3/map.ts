import { d3, SVGZoomSurface } from "@hpcc-js/core";
import { geoMercator as d3GeoMercator } from "d3-geo";
import { tile as d3Tile, tileWrap as d3TileWrap } from "d3-tile";

function url(x, y, z) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=pk.eyJ1IjoibGVzY2htb28iLCJhIjoiY2psY2FqY3l3MDhqNDN3cDl1MzFmZnkwcCJ9.HRoFwmz1j80gyz18ruggqw`;
}

export class Map extends SVGZoomSurface {
    protected _levels: any;

    protected _projection = d3GeoMercator()
        .scale(1 / (2 * Math.PI))
        .translate([0, 0])
        ;

    protected _tile = d3Tile()
        .tileSize(512)
        .clampX(false)
        ;

    constructor() {
        super();
    }

    enter(element) {
        super.enter(element);

        const { width, height } = this.size();

        this._tile
            .extent([[0, 0], [width, height]])
            ;

        this._zoom
            .scaleExtent([1 << 8, 1 << 22])
            .extent([[0, 0], [width, height]])
            ;

        const deltas = [-100, -4, -1, 0];
        this._levels = this._svgElement.insert("g", ":first-child")
            .attr("pointer-events", "none")
            .selectAll("g")
            .data(deltas)
            .join("g")
            ;

        this._svgElement
            .call(this._zoom.transform, transform)
            ;

        function transform() {
            return d3.zoomIdentity.translate(width >> 1, height >> 1).scale(1 << 12);
        }
    }

    zoomed(transform) {
        const graphTransform = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k >> 12);
        super.zoomed(graphTransform);
        const context = this;
        this._levels.each(function (delta) {
            const tiles = context._tile.zoomDelta(delta)(transform);

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

        context._projection
            .scale(transform.k / (2 * Math.PI))
            .translate([transform.x, transform.y])
            ;
    }
}
