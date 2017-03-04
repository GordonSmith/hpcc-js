import * as d3 from "d3";
import { SVGWidget } from "./SVGWidget";
import "css!./Shape.css";
//import "./Shape.css";

export class Shape extends SVGWidget {
    static _class = "common_Shape";

    protected _tooltipElement;
    _origRadius;

    constructor() {
        super();
    }

    intersection(pointA, pointB) {
        switch (this.shape()) {
            case "circle":
                return this.intersectCircle(this.radius(), pointA, pointB);
        }
        return super.intersection(pointA, pointB);
    };

    update(domNode, element) {
        var shape = element.selectAll("rect,circle,ellipse").data([this.shape()], function (d) { return d; });

        var context = this;
        shape.enter().append(this.shape() === "square" ? "rect" : this.shape())
            .attr("class", "common_Shape")
            .each(function (d) {
                var element = d3.select(this);
                context._tooltipElement = element.append("title");
            })
            ;
        shape
            .style("fill", this.colorFill())
            .style("stroke", this.colorStroke())
            .each(function (d) {
                var element = d3.select(this);
                context._tooltipElement.text(context.tooltip());
                switch (context.shape()) {
                    case "circle":
                        var radius = context.radius();
                        element
                            .attr("r", radius)
                            ;
                        break;
                    case "square":
                        var width = Math.max(context.width(), context.height());
                        element
                            .attr("x", -width / 2)
                            .attr("y", -width / 2)
                            .attr("width", width)
                            .attr("height", width)
                            ;
                        break;
                    case "rect":
                        element
                            .attr("x", -context.width() / 2)
                            .attr("y", -context.height() / 2)
                            .attr("width", context.width())
                            .attr("height", context.height())
                            ;
                        break;
                    case "ellipse":
                        element
                            .attr("rx", context.width() / 2)
                            .attr("ry", context.height() / 2)
                            ;
                        break;
                }
            })
            ;
        shape.exit().remove();
    };

    shape: { (): string; (_: string): Shape; }
    colorStroke: { (): string; (_: string): Shape; }
    colorFill: { (): string; (_: string): Shape; }
    radius: { (): number; (_: number): Shape; }
    tooltip: { (): string; (_: string): Shape; }
}
Shape.prototype.publish("shape", "circle", "set", "Shape Type", ["circle", "square", "rect", "ellipse"], { tags: ["Private"] });
Shape.prototype.publish("width", 24, "number", "Width", null, { tags: ["Private"] });
Shape.prototype.publish("height", 24, "number", "Height", null, { tags: ["Private"] });
Shape.prototype.publish("colorStroke", null, "html-color", "Stroke Color", null, { tags: ["Private"] });
Shape.prototype.publish("colorFill", null, "html-color", "Fill Color", null, { tags: ["Private"] });
Shape.prototype.publish("radius", null, "number", "Radius", null, { tags: ["Private"] });
Shape.prototype.publish("tooltip", "", "string", "Tooltip", null, { tags: ["Private"] });

Shape.prototype._origRadius = Shape.prototype.radius;
Shape.prototype.radius = function (_?) {
    var retVal = Shape.prototype._origRadius.apply(this, arguments);
    if (arguments.length) {
        this.width(_);
        this.height(_);
        return retVal;
    }
    return Math.max(this.width(), this.height()) / 2;
};
