import { Widget } from "@hpcc-js/common";
import { SVGGWidget } from "@hpcc-js/core";
import { curveBasis as d3CurveBasis, curveBundle as d3CurveBundle, curveCardinal as d3CurveCardinal, curveCatmullRom as d3CurveCatmullRom, curveLinear as d3CurveLinear, line as d3Line } from "d3-shape";

const Curve = {
    basis: d3CurveBasis,
    bundle: d3CurveBundle,
    cardinal: d3CurveCardinal,
    catmullRom: d3CurveCatmullRom,
    linear: d3CurveLinear
};

const DEFAULT_STROKE = "gray";

export type Point = [number, number];

export abstract class Edge extends SVGGWidget {

    protected _sourceVertex: Widget;
    protected _targetVertex: Widget;

    constructor() {
        super();
    }

    sourceVertex(): Widget;
    sourceVertex(_: Widget): this;
    sourceVertex(_?: Widget): Widget | this {
        if (!arguments.length) return this._sourceVertex;
        this._sourceVertex = _;
        return this;
    }

    targetVertex(): Widget;
    targetVertex(_: Widget): this;
    targetVertex(_?: Widget): Widget | this {
        if (!arguments.length) return this._targetVertex;
        this._targetVertex = _;
        return this;
    }

    abstract move(points: Point[]);
}

export class LineEdge extends Edge {

    protected _line: any;
    protected _title: any;

    constructor() {
        super();
    }

    move(points: Point[]) {
        this._line
            .attr("x1", points[0][0])
            .attr("y1", points[0][1])
            .attr("x2", points[1][0])
            .attr("y2", points[1][1])
            ;
        return this;
    }

    enter(element) {
        super.enter(element);
        this._line = element.append("line")
            .attr("stroke", DEFAULT_STROKE)
            .attr("fill", "none")
            ;
        this._title = this._line.append("title");
        this.move([[0, 0], [0, 0]]);
    }

    update(element) {
        super.update(element);
    }
}

export class CurveEdge extends Edge {

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
            .attr("stroke", DEFAULT_STROKE)
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
