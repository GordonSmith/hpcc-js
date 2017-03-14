import { select as d3Select } from "d3-selection";
import { area as d3Area, line as d3Line, curveLinear as d3CurveLinear, curveStep as d3CurveStep, curveStepBefore as d3CurveStepBefore, curveStepAfter as d3CurveStepAfter, curveBasis as d3CurveBasis, curveBundle as d3CurveBundle, curveCardinal as d3CurveCardinal, curveMonotoneX as d3CurveMonotoneX } from "d3-shape";
import { hsl as d3Hsl } from "d3-color";
import { SVGWidget } from "../common/SVGWidget";
import { INDChart } from "../api/INDChart";
import { ITooltip } from "../api/ITooltip";
import { XYAxis } from "./XYAxis";
import "./Scatter.css";

export function Scatter() {
    XYAxis.call(this);
    INDChart.call(this);
    ITooltip.call(this);

    this
        .xAxisGuideLines_default(true)
        .yAxisGuideLines_default(true)
        ;
}
Scatter.prototype = Object.create(XYAxis.prototype);
Scatter.prototype.constructor = Scatter;
Scatter.prototype._class += " chart_Scatter";
Scatter.prototype.implements(INDChart.prototype);
Scatter.prototype.implements(ITooltip.prototype);

Scatter.prototype.publish("paletteID", "default", "set", "Palette ID", Scatter.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
Scatter.prototype.publish("pointShape", "cross", "set", "Shape of the data points", ["circle", "rectangle", "cross"]);
Scatter.prototype.publish("pointSize", 6, "number", "Point Size");
Scatter.prototype.publish("interpolate", "", "set", "Interpolate Data", ["", "linear", "step", "step-before", "step-after", "basis", "bundle", "cardinal", "monotone"]);
Scatter.prototype.publish("interpolateFill", false, "boolean", "Fill Interpolation");
Scatter.prototype.publish("interpolateFillOpacity", 0.66, "number", "Fill Interpolation Opacity");
Scatter.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });

Scatter.prototype.xPos = function (d) {
    return this.orientation() === "horizontal" ? this.dataPos(d.label) : this.valuePos(d.value);
};

Scatter.prototype.yPos = function (d) {
    return this.orientation() === "horizontal" ? this.valuePos(d.value) : this.dataPos(d.label);
};

Scatter.prototype.curve = function () {
    switch (this.interpolate()) {
        case "linear":
            return d3CurveLinear;
        case "step":
            return d3CurveStep;
        case "step-before":
            return d3CurveStepBefore;
        case "step-after":
            return d3CurveStepAfter;
        case "basis":
            return d3CurveBasis;
        case "bundle":
            return d3CurveBundle;
        case "cardinal":
            return d3CurveCardinal;
        case "monotone":
        default:
            return d3CurveMonotoneX;
    }
};

Scatter.prototype.enter = function (_domNode, _element) {
    XYAxis.prototype.enter.apply(this, arguments);
    var context = this;
    this
        .tooltipHTML(function (d) {
            return context.tooltipFormat({ label: d.label, series: context.columns()[d.colIdx], value: d.value });
        })
        ;
};

Scatter.prototype.updateChart = function (_domNode, _element, _margin, _width, height, isHorizontal) {
    var context = this;

    this._palette = this._palette.switch(this.paletteID());
    if (this.useClonedPalette()) {
        this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
    }

    if (this._prevPointShape !== this.pointShape()) {
        this.svgData.selectAll(".data").remove();
        this._prevPointShape = this.pointShape();
    }

    function mapShape(shape) {
        switch (shape) {
            case "rectangle":
                return "rect";
            case "circle":
                return "circle";
            case "cross":
                return "path";
        }
    }

    var data = this.flattenData().map(function (d) {
        d.shape = mapShape(context.pointShape());
        return d;
    });

    var points = this.svgData.selectAll(".point").data(data, function (d, idx) { return d.shape + "_" + idx; });
    points.enter().append("g")
        .attr("class", "point")
        .each(function (d) {
            var element = d3Select(this);
            element
                .append("circle")
                .attr("class", "pointSelection")
                .on("mouseout.tooltip", context.tooltip.hide)
                .on("mousemove.tooltip", context.tooltip.show)
                .call(context._selection.enter.bind(context._selection))
                .on("click", function (d: any, _idx) {
                    context.click(context.rowToObj(context.data()[d.rowIdx]), context.columns()[d.colIdx], context._selection.selected(this));
                })
                .on("dblclick", function (d: any, _idx) {
                    context.dblclick(context.rowToObj(context.data()[d.rowIdx]), context.columns()[d.colIdx], context._selection.selected(this));
                })
                ;
            element
                .append(d.shape)
                .attr("class", "pointShape")
                ;
        })
        .merge(points)
        .each(function (d) {
            var elementSelection = d3Select(this).select(".pointSelection");
            elementSelection
                .attr("cx", function (d) { return context.xPos(d); })
                .attr("cy", function (d) { return context.yPos(d); })
                .attr("r", context.pointSize())
                ;

            var element = d3Select(this).select(".pointShape");
            switch (d.shape) {
                case "rect":
                    element
                        .attr("x", function (d) { return context.xPos(d) - context.pointSize() / 2; })
                        .attr("y", function (d) { return context.yPos(d) - context.pointSize() / 2; })
                        .attr("width", context.pointSize())
                        .attr("height", context.pointSize())
                        .style("fill", function (d: any, _idx) { return context._palette(context.columns()[d.colIdx]); })
                        ;
                    break;
                case "circle":
                    element
                        .attr("cx", function (d) { return context.xPos(d); })
                        .attr("cy", function (d) { return context.yPos(d); })
                        .attr("r", context.pointSize() / 2)
                        .style("fill", function (d: any, _idx) { return context._palette(context.columns()[d.colIdx]); })
                        ;
                    break;
                case "path":
                    element
                        .attr("d", function (d: any) {
                            return "M" + (context.xPos(d) - context.pointSize() / 2) + " " + (context.yPos(d) - context.pointSize() / 2) + " " +
                                "L" + (context.xPos(d) + context.pointSize() / 2) + " " + (context.yPos(d) + context.pointSize() / 2) + " " +
                                "M" + (context.xPos(d) - context.pointSize() / 2) + " " + (context.yPos(d) + context.pointSize() / 2) + " " +
                                "L" + (context.xPos(d) + context.pointSize() / 2) + " " + (context.yPos(d) - context.pointSize() / 2);
                        })
                        .style("stroke", function (d: any) { return context._palette(context.columns()[d.colIdx]); })
                        ;
                    break;
                default:
            }
        })
        ;
    points.exit()
        .remove()
        ;

    var areas = this.svgData.selectAll(".area").data(this.columns().filter(function (_d, idx) { return context.interpolate() && context.interpolateFill() && idx > 0; }));
    var areasEnter = areas.enter().append("path")
        .attr("class", "area")
        ;
    var area = d3Area()
        .curve(this.curve())
        ;
    if (isHorizontal) {
        area
            .x(function (d) { return context.xPos(d); })
            .y0(function () { return height; })
            .y1(function (d) { return context.yPos(d); })
            ;
    } else {
        area
            .y(function (d) { return context.yPos(d); })
            .x0(function () { return 0; })
            .x1(function (d) { return context.xPos(d); })
            ;
    }
    areasEnter.merge(areas)
        .each(function (_d, idx) {
            var element = d3Select(this);
            element
                .attr("d", area(data.filter(function (d2) { return d2.colIdx === idx + 1; })))
                .style("opacity", context.interpolateFillOpacity())
                .style("stroke", "none")
                .style("fill", function () { return d3Hsl(context._palette(context.columns()[idx + 1])).brighter().toString(); })
                ;
        });
    areas.exit().remove();

    var lines = this.svgData.selectAll(".line").data(this.columns().filter(function (_d, idx) { return context.interpolate() && idx > 0; }));
    var linesEnter = lines.enter().append("path")
        .attr("class", "line")
        ;
    var line = d3Line()
        .x(function (d) { return context.xPos(d); })
        .y(function (d) { return context.yPos(d); })
        .curve(this.curve())
        ;
    linesEnter.merge(lines)
        .each(function (_d, idx) {
            var element = d3Select(this);
            var data2 = data.filter(function (d2) { return d2.colIdx === idx + 1; });
            element
                .attr("d", line(data2))
                .style("stroke", function () { return context._palette(context.columns()[idx + 1]); })
                .style("fill", "none")
                ;
        });
    lines.exit().remove();
};

Scatter.prototype.exit = function (_domNode, _element) {
    SVGWidget.prototype.exit.apply(this, arguments);
};
