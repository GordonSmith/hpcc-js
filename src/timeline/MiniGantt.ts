import { extent as d3Extent } from "d3-array";
import { scaleBand as d3ScaleBand } from "d3-scale";
import { SVGWidget } from "../common/SVGWidget";
import { Axis } from "../chart/Axis";
import { Text } from "../common/Text";

import "./MiniGantt.css";

export class MiniGantt extends SVGWidget {
    protected topAxis: Axis;
    protected bottomAxis: Axis;
    protected verticalBands;
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
        this.verticalBands = d3ScaleBand()
            .paddingOuter(0.2)
            .paddingInner(0.2)
            ;
    }

    extent() {
        return d3Extent(this.data(), (d) => {
            return d[1];
        });
    }

    dataStartPos(d) {
        return this.bottomAxis.scalePos(d[1]);
    }

    dataEndPos(d) {
        return this.bottomAxis.scalePos(d[2]);
    }

    dataWidth(d) {
        return this.dataEndPos(d) - this.dataStartPos(d);
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
        const events = this.data().filter(d => !d[2]);// || d[0] === "WhenQueryStarted");
        const ranges = this.data().filter(d => !(!d[2]));// || d[0] === "WhenQueryStarted"));
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

        interface bucketInfo {
            endPos: number;
        }
        const buckets: bucketInfo[] = [];
        ranges.forEach(d => {
            for (let i = 0; i < buckets.length; ++i) {
                const bucket = buckets[i];
                if (bucket.endPos + 3 < this.dataStartPos(d)) {
                    d.bucket = i;
                    bucket.endPos = this.dataEndPos(d);
                    break;
                }
            }
            if (d.bucket === undefined) {
                d.bucket = buckets.length;
                buckets.push({
                    endPos: this.dataEndPos(d)
                });
            }
        });

        this.verticalBands
            .range([-height / 2 + topAxisBBox.height, height / 2 - bottomAxisBBox.height])
            .domain(buckets.map((_d, i) => i))
            ;

        const rects = this.svgEvents.selectAll(".rect").data(ranges, d => {
            return d[0];
        });
        const enterRects = rects.enter().append("rect")
            .attr("class", "rect")
            .attr("x", d => this.dataStartPos(d) - width / 2)
            .attr("y", d => this.verticalBands(d.bucket))
            .attr("width", d => this.dataWidth(d))
            .attr("height", this.verticalBands.bandwidth())
            ;
        enterRects.append("title")
            ;
        enterRects.each(function (d) {
            d._text = new Text()
                .target(this)
                .text(d[0])
                .render()
                ;
        });
        enterRects.merge(rects).select("title")
            .text(d => d[0])
            ;
        enterRects.merge(rects).select("text")
            .attr("transform", d => `translate(${this.dataStartPos(d) - width / 2},${this.verticalBands(d.bucket)})`)
            .text(d => d[0])
            ;
        rects.exit().remove();

        const lines = this.svgEvents.selectAll(".line").data(events, d => {
            return d[0];
        });
        lines.enter().append("line")
            .attr("class", "line")
            .attr("x1", d => this.dataStartPos(d) - width / 2)
            .attr("x2", d => this.dataStartPos(d) - width / 2)
            .attr("y1", -height / 2 + topAxisBBox.height)
            .attr("y2", height / 2 - bottomAxisBBox.height)
            .merge(lines)
            ;
        lines.exit().remove();
    };
}
MiniGantt.prototype._class += " timeline_MiniGantt";
