import * as d3 from "d3"
import { SVGWidget } from "./SVGWidget"
import "css!./Shape"

export class Shape extends SVGWidget {
    constructor() {
        super();
    }
    radius(_) {
        var retVal = this.radius_call(...arguments);
        if (arguments.length) {
            this.shapeWidth(_);
            this.shapeHeight(_);
            return retVal;
        }
        return Math.max(this.shapeWidth(), this.shapeHeight()) / 2;
    }

    intersection(pointA, pointB) {
        switch (this.shape()) {
            case "circle":
                return this.intersectCircle(pointA, pointB);
        }
        return SVGWidget.prototype.intersection.apply(this, arguments);
    }

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
                        var width = Math.max(context.shapeWidth(), context.shapeHeight());
                        element
                            .attr("x", -width / 2)
                            .attr("y", -width / 2)
                            .attr("width", width)
                            .attr("height", width)
                            ;
                        break;
                    case "rect":
                        element
                            .attr("x", -context.shapeWidth() / 2)
                            .attr("y", -context.shapeHeight() / 2)
                            .attr("width", context.shapeWidth())
                            .attr("height", context.shapeHeight())
                            ;
                        break;
                    case "ellipse":
                        element
                            .attr("rx", context.shapeWidth() / 2)
                            .attr("ry", context.shapeHeight() / 2)
                            ;
                        break;
                }
            })
            ;
        shape.exit().remove();
    }
}

Shape.prototype._class += " common_Shape";

Shape.prototype.publish("shape", "circle", "set", "Shape Type", ["circle", "square", "rect", "ellipse"], { tags: ["Private"] });
Shape.prototype.publish("shapeWidth", 24, "number", "Width", null, { tags: ["Private"] });
Shape.prototype.publish("shapeHeight", 24, "number", "Height", null, { tags: ["Private"] });
Shape.prototype.publish("colorStroke", null, "html-color", "Stroke Color", null, { tags: ["Private"] });
Shape.prototype.publish("colorFill", null, "html-color", "Fill Color", null, { tags: ["Private"] });
Shape.prototype.publish("radius", null, "number", "Radius", null, { tags: ["Private"] });
Shape.prototype.publish("tooltip", "", "string", "Tooltip", null, { tags: ["Private"] });

