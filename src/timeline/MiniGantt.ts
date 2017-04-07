import { extent as d3Extent } from "d3-array";
import { SVGWidget } from "../common/SVGWidget";
import { Axis } from "../chart/Axis";

import "./MiniGantt.css";

export class MiniGantt extends SVGWidget {
    protected topAxis: Axis;
    protected bottomAxis: Axis;
    protected svgCircles;
    protected svg;
    protected svgGuide;

    constructor() {
        super();
        this.topAxis = new Axis()
            .orientation("top")
            .type("time")
            .timePattern("%Y-%m-%dT%H:%M:%S.%LZ")
            .tickFormat("%H:%M:%S")
            ;
        this.bottomAxis = new Axis()
            .orientation("bottom")
            .type("time")
            .timePattern("%Y-%m-%dT%H:%M:%S.%LZ")
            .tickFormat("%H:%M:%S")
            ;
    }

    extent() {
        return d3Extent(this.data(), (d) => {
            return d[1];
        });
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        this.svg = element.append("g");
        this.svgGuide = this.svg.append("g");
        this.svgCircles = this.svg.append("g");
        this.topAxis
            .target(this.svg.node())
            .guideTarget(this.svgGuide.node())
            .overlapMode("stagger")
            ;
        this.bottomAxis
            .target(this.svg.node())
            .guideTarget(this.svgGuide.node())
            ;
    };

    update(domNode, element) {
        super.update(domNode, element);

        const width = this.width();
        const height = this.height();
        const extent = this.extent();

        this.topAxis
            .low(extent[0])
            .high(extent[1])
            .width(width)
            .height(height)
            .ticks(this.data().filter(d => d[2] === undefined || d[2] === null).map(d => { return { label: d[0], value: d[1] }; }))
            .render()
            ;
        const topAxisBBox = this.topAxis.getBBox();

        this.bottomAxis
            .low(extent[0])
            .high(extent[1])
            .width(width)
            .height(height)
            .render()
            ;
        const bottomAxisBBox = this.bottomAxis.getBBox();

        const circles = this.svgCircles.selectAll(".line").data(this.data(), d => d[0]);
        circles.enter().append("line")
            .attr("class", "line")
            .attr("x1", d => this.bottomAxis.scalePos(d[1]) - width / 2)
            .attr("x2", d => this.bottomAxis.scalePos(d[1]) - width / 2)
            .attr("y1", -height / 2 + topAxisBBox.height)
            .attr("y2", height / 2 - bottomAxisBBox.height)
            .merge(circles)
            ;

        circles.exit().remove();
    };
}
MiniGantt.prototype._class += " timeline_MiniGantt";
