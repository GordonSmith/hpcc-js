import { Leaflet } from "./Leaflet";
import { Lines } from "./Path";
import { Pins } from "./Pins";

class Vertices extends Pins {

    _idColIdx: number;

    constructor() {
        super(true);
    }

    onAnimationEnd(callback) {
        this._featureGroup.on("animationend", callback);
    }

    layerID(row) {
        return row[this._idColIdx];
    }

    getMarker(id) {
        return this._featureGroup.getLayer(id);
    }

    getMarkers() {
        return this._featureGroup.getLayers();
    }

    getVisibleParent(colID: string) {
        const marker = this._featureGroup.getLayer(colID);
        return this._featureGroup.getVisibleParent(marker);
    }
}

export class Graph extends Leaflet {

    protected _vertexLayer = new Vertices();
    protected _edgeLayer = new Lines()
        .columns(["fromLat", "fromLng", "toLat", "toLng"])
        .latitudeColumn("fromLat")
        .longtitudeColumn("fromLng")
        .latitude2Column("toLat")
        .longtitude2Column("toLng")
        ;

    constructor() {
        super();
        this.layers([this._edgeLayer, this._vertexLayer]);
        this._vertexLayer.onAnimationEnd(() => {
            this.updateEdges();
        });
    }

    protected _dataIdx: { [id: string]: any[] } = {};
    update(domNode, element) {
        const columns = this.columns();
        const data = this.data();
        this._vertexLayer._idColIdx = columns.indexOf(this.linkIDColumn());
        this._dataIdx = {};
        data.forEach(row => this._dataIdx[row[this._vertexLayer._idColIdx]] = row);
        this._edgeLayer.data([]);
        this._vertexLayer
            .columns(columns)
            .data(data)
            .layerUpdate(this._leafletMap)
            ;
        /*
    this._edgeLayer
        .data(this.links().map(l => [
            dataIdx[l[0]][latIdx],
            dataIdx[l[0]][lngIdx],
            dataIdx[l[1]][latIdx],
            dataIdx[l[1]][lngIdx]
        ]))
        ;
         */
        super.update(domNode, element);
    }

    updateEdges() {
        this._edgeLayer
            .data(this.links().map(l => {
                const fromMarker = this._vertexLayer.getVisibleParent(this._dataIdx[l[0]][this._vertexLayer._idColIdx]);
                const toMarker = this._vertexLayer.getVisibleParent(this._dataIdx[l[1]][this._vertexLayer._idColIdx]);
                return [fromMarker._latlng.lat, fromMarker._latlng.lng, toMarker._latlng.lat, toMarker._latlng.lng];
            }));
        this._edgeLayer.layerUpdate(this._leafletMap);
    }

    /*
    layerUpdate(map: Map) {
        const columns = this.columns();
        const faCharIdx = columns.indexOf(this.faCharColumn());
        const faCharColorIdx = columns.indexOf(this.faCharColorColumn());
        const strokeColorIdx = columns.indexOf(this.strokeColorColumn());
        const fillColorIdx = columns.indexOf(this.fillColorColumn());
        super.layerUpdate(map, (row) => {
            return {
                icon: BeautifyIcon({
                    iconShape: "marker",
                    icon: this.propValue(faCharIdx, row, this.faChar()),
                    textColor: this.propValue(faCharColorIdx, row, this.faCharColor()),
                    borderColor: this.propValue(strokeColorIdx, row, this.strokeColor()),
                    backgroundColor: this.propValue(fillColorIdx, row, this.fillColor()),
                    props: {
                        owner: this,
                        row
                    }
                }),
                draggable: false
            };
        });
    }
    */
}
Graph.prototype._class += " map_Graph";

export interface Graph extends Pins {
    links(): object[];
    links(_: object[]): this;
    linkIDColumn(): string;
    linkIDColumn(_: string): this;
}

Graph.prototype.publish("links", [], "array", "Data Links");
Graph.prototype.publish("linkIDColumn", null, "string", "Column ID to use for links", function () { return this.columns(); }, { optional: true });
//  Pins  ---
Graph.prototype.publishProxy("latitudeColumn", "_vertexLayer");
Graph.prototype.publishProxy("longtitudeColumn", "_vertexLayer");
Graph.prototype.publishProxy("omitNullLatLong", "_vertexLayer");
Graph.prototype.publishProxy("tooltipColumn", "_vertexLayer");
Graph.prototype.publishProxy("tooltipDirection", "_vertexLayer");
Graph.prototype.publishProxy("tooltipOffsetX", "_vertexLayer");
Graph.prototype.publishProxy("tooltipOffsetY", "_vertexLayer");
Graph.prototype.publishProxy("popupColumn", "_vertexLayer");
Graph.prototype.publishProxy("popupOffsetX", "_vertexLayer");
Graph.prototype.publishProxy("popupOffsetY", "_vertexLayer");
Graph.prototype.publishProxy("faChar", "_vertexLayer");
Graph.prototype.publishProxy("faCharColumn", "_vertexLayer");
Graph.prototype.publishProxy("faCharColor", "_vertexLayer");
Graph.prototype.publishProxy("faCharColorColumn", "_vertexLayer");
Graph.prototype.publishProxy("strokeColor", "_vertexLayer");
Graph.prototype.publishProxy("strokeColorColumn", "_vertexLayer");
Graph.prototype.publishProxy("fillColor", "_vertexLayer");
Graph.prototype.publishProxy("fillColorColumn", "_vertexLayer");
