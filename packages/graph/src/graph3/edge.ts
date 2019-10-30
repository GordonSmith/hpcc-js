import { SVGGWidget } from "@hpcc-js/core";
import { curveBasis as d3CurveBasis, curveBundle as d3CurveBundle, curveCardinal as d3CurveCardinal, curveCatmullRom as d3CurveCatmullRom, curveLinear as d3CurveLinear, line as d3Line } from "d3-shape";

const Curve = {
    basis: d3CurveBasis,
    bundle: d3CurveBundle,
    cardinal: d3CurveCardinal,
    catmullRom: d3CurveCatmullRom,
    linear: d3CurveLinear
};

export type Point = [number, number];

export interface EdgeItem {
    id: string;
    source: string;
    target: string;
    label?: string;
    [key: string]: any;
}

export class Edge3 extends SVGGWidget {

    protected _path: any;
    protected _title: any;

    constructor() {
        super();
    }

    calcArc(points: Point[]): Point[] {
        const curveDepth = 16;
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

    move(points: Point[]) {
        const line = d3Line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(Curve.basis)
            // .tension(0.75)
            (this.calcArc(points))
            ;

        this._path
            .attr("d", line)
            ;
        return this;
    }

    enter(element) {
        super.enter(element);
        this._path = element.append("path")
            .attr("stroke", "black")
            .attr("fill", "none")
            ;
        this._title = this._path.append("title");
        this.move([[0, 0], [0, 0]]);
    }

    update(element) {
        super.update(element);
        this._title.text("XXX");
    }
}
