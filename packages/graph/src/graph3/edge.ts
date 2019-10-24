import { publish, SVGGWidget } from "@hpcc-js/core";

export type Point = { x: number, y: number };

export interface EdgeItem {
    id: string;
    source: string;
    target: string;
    label?: string;
    [key: string]: any;
}

export class Edge3 extends SVGGWidget {

    @publish({ x: 0, y: 0 }, "Source Vertex")
    sourcePoint: publish<Point, this>;

    @publish({ x: 0, y: 0 }, "Target Vertex")
    targetPoint: publish<Point, this>;

    protected _line: any;
    protected _title: any;

    constructor() {
        super();
    }

    moveSource(x: number, y: number) {
        // this.sourcePoint({ x, y });
        this._line
            .attr("x1", x)
            .attr("y1", y)
            ;
        return this;
    }

    moveTarget(x: number, y: number) {
        // this.targetPoint({ x, y });
        this._line
            .attr("x2", x)
            .attr("y2", y)
            ;
        return this;
    }

    move(x1: number, y1: number, x2: number, y2: number) {
        this.moveSource(x1, y1);
        this.moveTarget(x2, y2);
        return this;
    }

    enter(element) {
        super.enter(element);
        this._line = element.append("line");
        this._title = this._line.append("title");
    }

    update(element) {
        super.update(element);
        const sourcePoint = this.sourcePoint();
        const targetPoint = this.targetPoint();
        this._line
            .attr("stroke", "black")
            .attr("x1", sourcePoint.x)
            .attr("y1", sourcePoint.y)
            .attr("x2", targetPoint.x)
            .attr("y2", targetPoint.y)
            ;
        this._title.text("XXX");
    }
}
