import { Palette } from "@hpcc-js/common";
import { h3ToGeoBoundary } from "@hpcc-js/h3-js-umd";
import { extent as d3Extent } from "d3-array";
import { Map, Polygon } from "leaflet";
import { ClusterLayer } from "./FeatureLayer";

export class H3Indexes extends ClusterLayer {

    _palette;

    hasBounds(): boolean {
        return true;
    }

    layerUpdate(map: Map) {
        super.layerUpdate(map);

        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        const columns = this.columns();
        const h3IndexCol = columns.indexOf(this.h3IndexColumn());
        const valueCol = columns.indexOf(this.valueColumn());

        const data = this.data().filter(row => !!row[h3IndexCol]);
        const extent = d3Extent(data, row => row[valueCol]);

        this.clear();
        this.data().filter(row => !!row[h3IndexCol]).forEach(row => {
            const points = h3ToGeoBoundary(row[h3IndexCol]);
            this.add(new Polygon(points, {
                color: this._palette(extent[1]),
                fillColor: this._palette(row[valueCol], extent[0], extent[1]),
                fillOpacity: this.opacity(),
                origRow: row
            } as any).on("click", e => this.clickHandler(e, row)));
        });
    }

    //  Events  ---
    clickHandler(e, row) {
    }
}
H3Indexes.prototype._class += " map_H3Indexes";
H3Indexes.prototype._palette = Palette.rainbow("default");

export interface H3Indexes {
    paletteID(): string;
    paletteID(_: string): this;
    paletteID_exists(): boolean;
    useClonedPalette(): boolean;
    useClonedPalette(_: boolean): this;
    useClonedPalette_exists(): boolean;

    h3IndexColumn(): string;
    h3IndexColumn(_: string);
    valueColumn(): string;
    valueColumn(_: string);

    opacity(): number;
    opacity(_: number): this;
    opacity_default(_: number): this;
    opacity_exists(): boolean;
}

H3Indexes.prototype.publish("paletteID", "YlOrRd", "set", "Color palette for this widget", H3Indexes.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
H3Indexes.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });
H3Indexes.prototype.publish("h3IndexColumn", null, "set", "H3 Index column", function () { return this.columns(); }, { optional: true });
H3Indexes.prototype.publish("valueColumn", null, "set", "Value column", function () { return this.columns(); }, { optional: true });
H3Indexes.prototype.publish("opacity", 0.5, "number", "Opacity", null, { tags: ["Advanced"] });
