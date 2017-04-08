import { extent as d3Extent } from "d3-array";
import { SVGWidget } from "../common/SVGWidget";
import { Axis } from "../chart/Axis";

import "./MiniGantt.css";

export class MiniGantt extends SVGWidget {
    protected topAxis: Axis;
    protected bottomAxis: Axis;
    protected svgEvents;
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
        this.svgEvents = this.svg.append("g");
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
        const events = this.data().filter(d => !d[2] || d[0] === "WhenQueryStarted");
        const ranges = this.data().filter(d => !(!d[2] || d[0] === "WhenQueryStarted"));
        const eventTicks = events.map(d => { return { label: d[0], value: d[1] }; });
        this.topAxis
            .low(extent[0])
            .high(extent[1])
            .width(width)
            .height(height)
            .ticks(eventTicks)
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

        const rects = this.svgEvents.selectAll(".rect").data(ranges, d => {
            return d[0];
        });
        rects.enter().append("rect")
            .attr("class", "rect")
            .attr("x", d => this.bottomAxis.scalePos(d[1]) - width / 2)
            .attr("y", (_d, i) => 10)
            .attr("width", d => (this.bottomAxis.scalePos(d[2]) - this.bottomAxis.scalePos(d[1])))
            .attr("height", 8)
            .merge(rects)
            ;
        rects.exit().remove();

        const lines = this.svgEvents.selectAll(".line").data(events, d => {
            return d[0];
        });
        lines.enter().append("line")
            .attr("class", "line")
            .attr("x1", d => this.bottomAxis.scalePos(d[1]) - width / 2)
            .attr("x2", d => this.bottomAxis.scalePos(d[1]) - width / 2)
            .attr("y1", -height / 2 + topAxisBBox.height)
            .attr("y2", height / 2 - bottomAxisBBox.height)
            .merge(lines)
            ;
        lines.exit().remove();
    };
}
MiniGantt.prototype._class += " timeline_MiniGantt";
