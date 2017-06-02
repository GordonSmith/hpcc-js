import * as d3Geo from "d3-geo";
import { geoMercator } from "d3-geo";
import { albersUsaPr } from "./Utility";

enum Type {
    AzimuthalEqualArea,
    AzimuthalEquidistant,
    Gnomonic,
    Orthographic,
    Stereographic,
    AlbersUsa,
    AlbersUsaPr,
    Albers,
    ConicConformal,
    ConicEqualArea,
    ConicEquidistant,
    Equirectangular,
    Mercator,
    TransverseMercator
}
export const types: string[] = [];
export const projections: { [key: string]: any } = {};
for (const key in Type) {
    if (typeof key === "string") {
        types.push(key);
        if (key === "AlbersUsaPr") {
            projections[key] = albersUsaPr;
        } else {
            projections[key] = d3Geo[`geo${key}`];
        }
    }
}

export function resolve(id: string): any {
    const retVal = projections[id];
    if (retVal) {
        return retVal();
    }
    console.log("Unknown projection:  " + id);
    return geoMercator();
}
