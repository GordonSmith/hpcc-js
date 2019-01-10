import * as h3js from "h3-js";

export const geoToH3: (lat: number, lng: number, res: number) => string = h3js.geoToH3;
export const h3ToGeoBoundary: (h3Index: string, formatAsGeoJson?) => Array<[number, number]> = h3js.h3ToGeoBoundary;
export const polyfill: (points: Array<[number, number]>, res: number) => string[] = h3js.polyfill;

//  ---
import * as geojson2h3 from "geojson2h3";

type GeoJSONFeature = object;
export const featureToH3Set: (feature: GeoJSONFeature, resolution: number) => string[] = geojson2h3.featureToH3Set;
export const h3ToFeature: (hexAddress: string, properties?: object) => GeoJSONFeature = geojson2h3.h3ToFeature;
export const h3SetToFeature: (hexagons: string[], properties?: object) => GeoJSONFeature = geojson2h3.h3SetToFeature;
export const h3SetToMultiPolygonFeature: (hexagons: string[], properties?: object) => GeoJSONFeature = geojson2h3.h3SetToMultiPolygonFeature;
export const h3SetToFeatureCollection: (hexagons: string[], getProperties: (hexAddress: string) => object) => GeoJSONFeature = geojson2h3.h3SetToFeatureCollection;
