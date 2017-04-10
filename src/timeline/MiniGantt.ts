import { extent as d3Extent } from "d3-array";
import { scaleBand as d3ScaleBand } from "d3-scale";
import { SVGWidget } from "../common/SVGWidget";
import { publish } from "../common/PropertyExt";
import { Axis } from "../chart/Axis";
import { TextBox } from "../common/TextBox";

import "./MiniGantt.css";

export class MiniGantt extends SVGWidget {
    protected topAxis: Axis;
    protected bottomAxis: Axis;
    protected verticalBands;
    protected svgEvents;
    protected svg;
    protected svgGuide;

    @publish(2, "Force new lane if start/end is within X pixels")
    overlapTolerence: { (): number; (_: number): MiniGantt; };

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
        const data: bucketInfo[] = [];
        ranges.forEach(d => {
            for (let i = 0; i < data.length; ++i) {
                const bucket = data[i];
                if (bucket.endPos + this.overlapTolerence() < this.dataStartPos(d)) {
                    d.bucket = i;
                    bucket.endPos = this.dataEndPos(d);
                    break;
                }
            }
            if (d.bucket === undefined) {
                d.bucket = data.length;
                data.push({
                    endPos: this.dataEndPos(d)
                });
            }
        });

        this.verticalBands
            .range([-height / 2 + topAxisBBox.height, height / 2 - bottomAxisBBox.height])
            .domain(data.map((_d, i) => i))
            ;

        const buckets = this.svgEvents.selectAll(".buckets").data(ranges, d => d[0]);
        const enterBuckets = buckets.enter().append("g")
            .attr("class", "buckets")
            .each(function (d) {
                d._text = new TextBox()
                    .target(this)
                    .anchor("start")
                    ;
            });
        enterBuckets
            .merge(buckets)
            .attr("transform", d => `translate(${this.dataStartPos(d) - width / 2}, ${this.verticalBands(d.bucket)})`)
            .each(d => {
                d._text
                    .pos({ x: this.dataWidth(d) / 2, y: this.verticalBands.bandwidth() / 2 })
                    .fixedSize({ width: this.dataWidth(d), height: this.verticalBands.bandwidth() })
                    .text(d[0])
                    .tooltip(d[0])
                    .render()
                    ;
            });

        buckets.exit().remove();

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

