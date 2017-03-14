import { max as d3Max, min as d3Min } from "d3-array";
import { brushX as d3BrushX, brushY as d3BrushY } from "d3-brush";
import { hsl as d3Hsl } from "d3-color";
import { SVGWidget } from "../common/SVGWidget";
import * as Utility from "../common/Utility";
import { Axis } from "./Axis";
import "./XYAxis.css";

export class XYAxis extends SVGWidget {
    protected domainAxis: Axis;
    protected valueAxis: Axis;
    protected xAxis: Axis;
    protected yAxis: Axis;
    protected xBrush;
    protected yBrush;
    protected margin;
    protected focusChart;
    _palette;

    constructor() {
        super();
        Utility.SimpleSelectionMixin.call(this);

        this._drawStartPos = "origin";

        this.domainAxis = new Axis()
            .classed({ domain: true })
            .orientation_default("bottom")
            .type_default("ordinal")
            .overlapMode_default("stagger")
            .shrinkToFit_default("high")
            .extend_default(0)
            ;
        this.valueAxis = new Axis()
            .classed({ value: true })
            .orientation_default("left")
            .type_default("linear")
            .shrinkToFit_default("high")
            ;
        const context = this;
        this.xBrush = d3BrushX()
            .on("brush", function () {
                return context.brushMoved();
            })
            ;
        this.yBrush = d3BrushY()
            .on("brush", function () {
                return context.brushMoved();
            })
            ;
    }

    protected _prevBrush;
    resetSelection() {
        this._prevBrush = null;
        return this;
    };

    columns(_?) {
        return super.columns.apply(this, arguments);
    };

    parseData(d) {
        return this.domainAxis.parse(d);
    };

    parseValue(d) {
        return this.valueAxis.parse(d, true);
    };

    formatData(d) {
        return this.domainAxis.format(d);
    };

    formatValue(d) {
        return this.valueAxis.format(d);
    };

    parsedData() {
        const retVal = this.data().map(function (row) {
            let prevValue = 0;
            return row.map(function (cell, idx) {
                if (idx === 0) {
                    return this.parseData(cell);
                }
                if (idx >= this.columns().length) {
                    return cell;
                }
                const _retVal = this.yAxisStacked() ? [prevValue, prevValue + this.parseValue(cell)] : this.parseValue(cell);
                prevValue += this.parseValue(cell);
                return _retVal;
            }, this);
        }, this);
        return retVal;
    };

    protected svg;
    protected svgRegions;
    protected svgDomainGuide;
    protected svgValueGuide;
    protected svgData;
    protected svgDataClipRect;
    protected _selection;
    protected svgFocus;
    protected svgBrush;
    enter(_domNode, element) {
        SVGWidget.prototype.enter.apply(this, arguments);
        this.svg = element.append("g");
        this.svgRegions = element.append("g");
        this.svgDomainGuide = this.svg.append("g");
        this.svgValueGuide = this.svg.append("g");
        this.svgData = this.svg.append("g");

        this.svgDataClipRect = this.svg.append("clipPath")
            .attr("id", this.id() + "_clippath")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            ;
        this.svgData = this.svg.append("g")
            .attr("clip-path", "url(#" + this.id() + "_clippath)")
            ;
        this._selection.widgetElement(this.svgData);

        this.svgFocus = element.append("g");

        this.domainAxis
            .target(this.svg.node())
            .guideTarget(this.svgDomainGuide.node())
            ;
        this.valueAxis
            .target(this.svg.node())
            .guideTarget(this.svgValueGuide.node())
            ;

        //  Brush  ---
        this.svgBrush = element.append("g")
            .attr("class", "brush")
            ;
    };

    resizeBrushHandle(d, width, height) {
        let e;
        let x;
        let y;
        if (d === "e" || d === "w") {
            e = +(d === "e");
            x = e ? 1 : -1;
            y = height / 3;
            return "M" + (0.5 * x) + "," + y +
                "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) +
                "V" + (2 * y - 6) +
                "A6,6 0 0 " + e + " " + (0.5 * x) + "," + (2 * y) +
                "Z" +
                "M" + (2.5 * x) + "," + (y + 8) +
                "V" + (2 * y - 8) +
                "M" + (4.5 * x) + "," + (y + 8) +
                "V" + (2 * y - 8);
        } else {
            e = +(d === "s");
            y = e ? 1 : -1;
            x = width / 3;
            return "M" + x + ", " + (0.5 * y) +
                "A6,6 0 0 " + (e + 1) % 2 + " " + (x + 6) + "," + (6.5 * y) +
                "H" + (2 * x - 6) +
                "A6,6 0 0 " + (e + 1) % 2 + " " + (2 * x) + "," + (0.5 * y) +
                "Z" +
                "M" + (x + 8) + "," + (2.5 * y) +
                "H" + (2 * x - 8) +
                "M" + (x + 8) + "," + (4.5 * y) +
                "H" + (2 * x - 8);
        }
    };

XYAxis.prototype.brushMoved = Utility.debounce(function brushed() {
        var selected = this.parsedData().filter(function (d) {
        var pos = d[0];
            if (this.xAxisType() === "ordinal") {
                pos = this.domainAxis.d3Scale(pos) + (this.domainAxis.d3Scale.bandwidth ? this.domainAxis.d3Scale.bandwidth() / 2 : 0);
            }
            if (this.orientation() === "horizontal") {
                return (pos >= this.xBrush.extent()[0] && pos <= this.xBrush.extent()[1]);
            }
            return (pos >= this.yBrush.extent()[0] && pos <= this.yBrush.extent()[1]);
        }, this);
        this.selection(selected);
    }, 250);

    dataPos(d) {
        return this.domainAxis.scalePos(d);
    };

    valuePos(d) {
        return this.valueAxis.scalePos(d);
    };

    setScaleRange(width, height) {
        this.xAxis.width(width);
        this.yAxis.height(height);
    };

    calcMargin(_domNode, element, isHorizontal) {
        const margin = {
            top: !isHorizontal && this.selectionMode() ? 10 : 2,
            right: isHorizontal && (this.selectionMode() || this.xAxisFocus()) ? 10 : 2,
            bottom: (this.xAxisFocus() ? this.xAxisFocusHeight() : 0) + 2,
            left: 2
        };
        const width = this.width() - margin.left - margin.right;
        const height = this.height() - margin.top - margin.bottom;

        let xHeight = 30;
        let yWidth = 30;
        for (let i = 0; i < 10; ++i) {
            this.xAxis.width(width - yWidth).height(0);
            const xAxisOverlap = this.xAxis.calcOverflow(element);

            this.yAxis.width(0).height(height - xHeight);
            const yAxisOverlap = this.yAxis.calcOverflow(element);

            const newXHeight = xAxisOverlap.depth;
            const newYWidth = yAxisOverlap.depth;

            if (newXHeight === xHeight && newYWidth === yWidth) {
                xHeight = newXHeight;
                yWidth = newYWidth;
                break;
            }
            xHeight = newXHeight;
            yWidth = newYWidth;
        }
        this.xAxis
            .x(width / 2 + yWidth / 2 + margin.left)
            .y(height + margin.top)
            .width(width - yWidth)
            ;
        this.yAxis
            .x(margin.left)
            .y(height / 2 - xHeight / 2 + margin.top)
            .height(height - xHeight)
            ;
        margin.left += yWidth;
        margin.bottom += xHeight;
        return margin;
    };

    updateRegions(_domNode, _element, isHorizontal) {
        const context = this;

        const regions = this.svgRegions.selectAll(".region").data(this.regions());
        regions.enter().append("rect")
            .attr("class", "region")
            ;
        if (isHorizontal) {
            regions
                .attr("x", function (d) { return context.dataPos(d.x0); })
                .attr("y", 0)
                .attr("width", function (d) { return context.dataPos(d.x1) - context.dataPos(d.x0); })
                .attr("height", this.height())
                .style("stroke", function (d) { return context._palette(d.colorID); })
                .style("fill", function (d) { return d3Hsl(context._palette(d.colorID)).brighter(); })
                ;
        } else {
            regions
                .attr("x", 0)
                .attr("y", function (d) { return context.dataPos(d.x0); })
                .attr("width", this.width())
                .attr("height", function (d) { return context.dataPos(d.x0) - context.dataPos(d.x1); })
                .style("stroke", function (d) { return context._palette(d.colorID); })
                .style("fill", function (d) { return d3Hsl(context._palette(d.colorID)).brighter(); })
                ;
        }
        regions.exit().remove();
    };

    protected _prevXAxisType;
    update(domNode, element) {
        const context = this;

        const isHorizontal = this.orientation() === "horizontal";
        this.updateRegions(domNode, element, isHorizontal);

        this.domainAxis
            .orientation(isHorizontal ? "bottom" : "left")
            .title(this.columns()[0])
            ;
        this.valueAxis
            .orientation(isHorizontal ? "left" : "bottom")
            ;
        this.xAxis = isHorizontal ? this.domainAxis : this.valueAxis;
        this.yAxis = isHorizontal ? this.valueAxis : this.domainAxis;
        const xBrush = isHorizontal ? this.xBrush : this.yBrush;
        const yBrush = isHorizontal ? this.yBrush : this.xBrush;
        const xBrushExtent = xBrush.extent();
        const yBrushExtent = yBrush.extent();

        //  Update Domain  ---
        switch (this.xAxisType()) {
            case "ordinal":
                this.domainAxis.ordinals(this.data().map(function (d) { return d[0]; }));
                break;
            default:
                const domainMin = this.xAxisDomainLow() ? this.xAxisDomainLow() : this.domainAxis.parseInvert(d3Min(this.parsedData(), function (data) {
                    return data[0];
                }));
                const domainMax = this.xAxisDomainHigh() ? this.xAxisDomainHigh() : this.domainAxis.parseInvert(d3Max(this.parsedData(), function (data) {
                    return data[0];
                }));
                if (domainMin !== undefined && domainMax !== undefined) {
                    this.domainAxis
                        .low(domainMin)
                        .high(domainMax)
                        ;
                }
                break;
        }

        const min = this.yAxisDomainLow() ? this.yAxisDomainLow() : this.valueAxis.parseInvert(d3Min(this.parsedData(), function (data: any[]) {
            return d3Min(data.filter(function (cell, i) { return i > 0 && context.columns()[i] && context.columns()[i].indexOf("__") !== 0 && cell !== null; }), function (d) { return d instanceof Array ? d[0] : d; });
        }));
        const max = this.yAxisDomainHigh() ? this.yAxisDomainHigh() : this.valueAxis.parseInvert(d3Max(this.parsedData(), function (data: any[]) {
            return d3Max(data.filter(function (cell, i) { return i > 0 && context.columns()[i] && context.columns()[i].indexOf("__") !== 0 && cell !== null; }), function (d) { return d instanceof Array ? d[1] : d; });
        }));
        this.valueAxis
            .low(min)
            .high(max)
            ;

        //  Calculate Margins  ---
        this.margin = this.calcMargin(domNode, element, isHorizontal);

        //  Update Range  ---
        let width = this.width() - this.margin.left - this.margin.right;
        if (width < 0) width = 0;
        let height = this.height() - this.margin.top - this.margin.bottom;
        if (height < 0) height = 0;
        const maxCurrExtent = isHorizontal ? width : height;
        const maxOtherExtent = isHorizontal ? height : width;

        //  Render  ---
        this.domainAxis
            .tickLength(this.xAxisGuideLines() ? maxOtherExtent : 0)
            .render()
            ;
        this.valueAxis
            .tickLength(this.yAxisGuideLines() ? maxCurrExtent : 0)
            .render()
            ;

        this.svgDataClipRect
            .attr("width", width)
            .attr("height", height)
            ;
        this.svgData.transition()
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            ;

        this.xBrush
            .x(this.domainAxis.d3Scale)
            ;
        this.yBrush
            .y(this.domainAxis.d3Scale)
            ;
        if (this.selectionMode()) {
            if (this._prevXAxisType !== this.xAxisType()) {
                this._prevXAxisType = this.xAxisType();
                this._prevBrush = null;
            }
            if (!this._prevBrush) {
                switch (this.xAxisType()) {
                    case "ordinal":
                        xBrush.extent([0, maxCurrExtent]);
                        break;
                    default:
                        xBrush.extent(this.domainAxis.d3Scale.domain());
                        break;
                }
            } else if (this._prevBrush && this._prevBrush.orientation !== this.orientation()) {
                switch (this.xAxisType()) {
                    case "ordinal":
                        xBrush.extent([maxCurrExtent - yBrushExtent[0] * maxCurrExtent / this._prevBrush.maxCurrExtent, maxCurrExtent - yBrushExtent[1] * maxCurrExtent / this._prevBrush.maxCurrExtent]);
                        break;
                    default:
                        xBrush.extent(yBrushExtent);
                        break;
                }
            } else {
                switch (this.xAxisType()) {
                    case "ordinal":
                        if (this._prevBrush) {
                            const ratio = maxCurrExtent / this._prevBrush.maxCurrExtent;
                            xBrush.extent([xBrushExtent[0] * ratio, xBrushExtent[1] * ratio]);
                        }
                        break;
                    default:
                        const domain = this.domainAxis.d3Scale.domain();
                        if (xBrushExtent[0] < domain[0] || xBrushExtent[0] > domain[1]) {
                            xBrushExtent[0] = domain[0];
                        }
                        if (xBrushExtent[1] < domain[0] || xBrushExtent[1] > domain[1]) {
                            xBrushExtent[1] = domain[1];
                        }
                        xBrush.extent(xBrushExtent);
                        break;
                }
            }
            this._prevBrush = {
                orientation: this.orientation(),
                maxCurrExtent
            };
        }

        this.svgBrush
            .attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
            .style("display", this.selectionMode() ? null : "none")
            .call(xBrush)
            .selectAll(".background").transition()
            .attr("width", width)
            .attr("height", height)
            ;

        this.svgBrush.selectAll(".extent, .resize rect").transition()
            .attr(isHorizontal ? "y" : "x", 0)
            .attr(isHorizontal ? "height" : "width", maxOtherExtent)
            ;

        const handlePath = this.svgBrush.selectAll(".resize").selectAll("path").data(function (d) { return d; });
        handlePath.enter().append("path");
        handlePath.transition()
            .attr("d", function (d) { return context.resizeBrushHandle(d, width, height); })
            ;

        this.updateFocusChart(domNode, element, this.margin, width, height, isHorizontal);
        this.updateChart(domNode, element, this.margin, width, height, isHorizontal, 250);
    };

    updateFocusChart(domNode, element, margin, width, height, isHorizontal) {
        const context: any = this;
        const focusChart = this.svgFocus.selectAll("#" + this.id() + "_focusChart").data(this.xAxisFocus() ? [true] : []);
        focusChart.enter().append("g")
            .attr("id", this.id() + "_focusChart")
            .attr("class", "focus")
            .each(function () {
                context.focusChart = new context.constructor()
                    .target(this)
                    ;
                context.focusChart.xBrush
                    .on("brush.focus", function () {
                        syncAxis();
                        context.updateChart(domNode, element, margin, width, height, isHorizontal, 0);
                    })
                    ;
            })
            ;
        focusChart
            .each(function () {
                context.copyPropsTo(context.focusChart);
                context.focusChart
                    .xAxisFocus(false)
                    .selectionMode(true)
                    .tooltipStyle("none")
                    .orientation("horizontal")
                    .xAxisGuideLines(false)
                    .xAxisDomainLow(null)
                    .xAxisDomainHigh(null)
                    .yAxisGuideLines(false)
                    .x(context.width() / 2)
                    .y(context.height() - context.xAxisFocusHeight() / 2)
                    .width(context.width())
                    .height(context.xAxisFocusHeight())
                    .columns(context.columns())
                    .data(context.data())
                    .render()
                    ;
                syncAxis();
            })
            ;
        focusChart.exit()
            .each(function () {
                if (context.focusChart) {
                    context.focusChart
                        .target(null)
                        ;
                    delete context.focusChart;
                }
            })
            .remove()
            ;

        function syncAxis() {
            if (context.focusChart.xAxisType() !== "ordinal") {
                context.xAxis.domain(context.focusChart.xBrush.extent());
            } else {
                const brushExtent = context.focusChart.xBrush.extent();
                const brushWidth = brushExtent[1] - brushExtent[0];
                const scale = brushWidth / width;
                context.xAxis.range([-brushExtent[0] / scale, (width - brushExtent[0]) / scale]);
            }
            context.xAxis.svgAxis.call(context.xAxis.d3Axis);
            context.xAxis.svgGuides.call(context.xAxis.d3Guides);
        }
    };

    updateChart(_domNode, _element, _margin, _width, _height, _isHorizontal, _duration) {
    };

    exit(_domNode, _element) {
        SVGWidget.prototype.exit.apply(this, arguments);
    };

    selection(_selected) {
    };

    orientation: { (): string; (_: string): XYAxis; };
    orientation_default: { (): string; (_: string): XYAxis; };
    selectionMode: { (): boolean; (_: boolean): XYAxis; };
    imageUrl: { (): string; (_: string): XYAxis; };
    xAxisTickCount: { (): number; (_: number): XYAxis; };
    xAxisTickFormat: { (): string; (_: string): XYAxis; };
    xAxisType: { (): string; (_: string): XYAxis; };
    xAxisType_default: { (): string; (_: string): XYAxis; };
    xAxisTypeTimePattern: { (): string; (_: string): XYAxis; };
    xAxisDomainLow: { (): string; (_: string): XYAxis; };
    xAxisDomainHigh: { (): string; (_: string): XYAxis; };

    xAxisOverlapMode: { (): string; (_: string): XYAxis; };
    xAxisLabelRotation: { (): number; (_: number): XYAxis; };
    xAxisDomainPadding: { (): number; (_: number): XYAxis; };
    xAxisGuideLines: { (): boolean; (_: boolean): XYAxis; };
    xAxisGuideLines_default: { (): boolean; (_: boolean): XYAxis; };
    xAxisFocus: { (): boolean; (_: boolean): XYAxis; };
    xAxisFocusHeight: { (): number; (_: number): XYAxis; };

    yAxisTitle: { (): string; (_: string): XYAxis; };
    yAxisTickCount: { (): number; (_: number): XYAxis; };
    yAxisTickFormat: { (): string; (_: string): XYAxis; };
    yAxisType: { (): string; (_: string): XYAxis; };
    yAxisType_default: { (): string; (_: string): XYAxis; };
    yAxisTypeTimePattern: { (): string; (_: string): XYAxis; };
    yAxisTypePowExponent: { (): number; (_: number): XYAxis; };
    yAxisTypeLogBase: { (): number; (_: number): XYAxis; };
    yAxisStacked: { (): boolean; (_: boolean): XYAxis; };
    yAxisDomainLow: { (): string; (_: string): XYAxis; };
    yAxisDomainHigh: { (): string; (_: string): XYAxis; };
    yAxisDomainPadding: { (): number; (_: number): XYAxis; };
    yAxisGuideLines: { (): boolean; (_: boolean): XYAxis; };
    yAxisGuideLines_default: { (): boolean; (_: boolean): XYAxis; };

    regions: { (): any[]; (_: string): XYAxis; };
    sampleData: { (): string; (_: string): XYAxis; };

}
XYAxis.prototype._class += " chart_XYAxis";
XYAxis.prototype.mixin(Utility.SimpleSelectionMixin);

XYAxis.prototype.publish("orientation", "horizontal", "set", "Selects orientation for the axis", ["horizontal", "vertical"]);
XYAxis.prototype.publish("selectionMode", false, "boolean", "Range Selector");

XYAxis.prototype.publishProxy("xAxisTickCount", "domainAxis", "tickCount");
XYAxis.prototype.publishProxy("xAxisTickFormat", "domainAxis", "tickFormat");
XYAxis.prototype.publishProxy("xAxisType", "domainAxis", "type");
XYAxis.prototype.publishProxy("xAxisTypeTimePattern", "domainAxis", "timePattern");
XYAxis.prototype.publish("xAxisDomainLow", null, "string", "X-Axis Low", null, { optional: true, disable: (w) => { return w.xAxisType() === "ordinal"; } });
XYAxis.prototype.publish("xAxisDomainHigh", null, "string", "X-Axis High", null, { optional: true, disable: (w) => { return w.xAxisType() === "ordinal"; } });
XYAxis.prototype.publishProxy("xAxisOverlapMode", "domainAxis", "overlapMode");
XYAxis.prototype.publishProxy("xAxisLabelRotation", "domainAxis", "labelRotation");
XYAxis.prototype.publishProxy("xAxisDomainPadding", "domainAxis", "extend");
XYAxis.prototype.publish("xAxisGuideLines", false, "boolean", "Y-Axis Guide Lines");
XYAxis.prototype.publish("xAxisFocus", false, "boolean", "X-Axis Focus", null, { disable: (w) => { return w.orientation() !== "horizontal"; } });
XYAxis.prototype.publish("xAxisFocusHeight", 80, "number", "X-Axis Focus Height", null, { disable: (w) => { return !w.xAxisFocus(); } });

XYAxis.prototype.publishProxy("yAxisTitle", "valueAxis", "title");
XYAxis.prototype.publishProxy("yAxisTickCount", "valueAxis", "tickCount");
XYAxis.prototype.publishProxy("yAxisTickFormat", "valueAxis", "tickFormat");
XYAxis.prototype.publishProxy("yAxisType", "valueAxis", "type");
XYAxis.prototype.publishProxy("yAxisTypeTimePattern", "valueAxis", "timePattern");
XYAxis.prototype.publishProxy("yAxisTypePowExponent", "valueAxis", "powExponent");
XYAxis.prototype.publishProxy("yAxisTypeLogBase", "valueAxis", "logBase");
XYAxis.prototype.publish("yAxisStacked", false, "boolean", "Stacked Chart", null, { tags: ["Basic"], disable: (w) => { return w.xAxisType() !== "ordinal" || w._class.indexOf("chart_Column") < 0; } });
XYAxis.prototype.publish("yAxisDomainLow", null, "string", "Y-Axis Low", null, { optional: true, disable: (w) => { return w.yAxisType() === "ordinal"; } });
XYAxis.prototype.publish("yAxisDomainHigh", null, "string", "Y-Axis High", null, { optional: true, disable: (w) => { return w.yAxisType() === "ordinal"; } });
XYAxis.prototype.publishProxy("yAxisDomainPadding", "valueAxis", "extend");
XYAxis.prototype.publish("yAxisGuideLines", true, "boolean", "Y-Axis Guide Lines");

XYAxis.prototype.publish("regions", [], "array", "Regions");

XYAxis.prototype.publish("sampleData", "", "set", "Display Sample Data", ["", "ordinal", "ordinalRange", "linear", "time-x", "time-y"]);
