import * as d3 from "./d3";
import { SVGSurface } from "./surface";

export class SVGZoomSurface extends SVGSurface {

    protected _svgElement: any;
    protected _zoom = d3.zoom<any, this>()
        .scaleExtent([0.1, 1.5])
        ;

    preEnter() {
        super.preEnter();
        this._svgElement = this._element;
        this._element = this._svgElement.append("g");
        const { width, height } = this.size();
        this._zoom
            .extent([[0, 0], [width, height]])
            .on("zoom", () => this.zoomed(d3.event.transform))
            ;

        this._svgElement.call(this._zoom);
    }

    zoomed(transform) {
        this._element.attr("transform", transform);
    }
}
