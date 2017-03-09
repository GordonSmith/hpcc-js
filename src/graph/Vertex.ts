import { select as d3Select } from "d3-selection";
import { Icon } from "../common/Icon";
import { SVGWidget } from "../common/SVGWidget";
import { TextBox } from "../common/TextBox";

import "./Vertex.css";

export function Vertex() {
    SVGWidget.call(this);

    this._icon = new Icon();
    this._textBox = new TextBox();
    this._annotationWidgets = {};
}
Vertex.prototype = Object.create(SVGWidget.prototype);
Vertex.prototype.constructor = Vertex;
Vertex.prototype._class += " graph_Vertex";

Vertex.prototype.publishProxy("faChar", "_icon");
Vertex.prototype.publishProxy("imageUrl", "_icon");
Vertex.prototype.publishProxy("icon_shape_diameter", "_icon", "diameter");
Vertex.prototype.publishProxy("icon_shape_colorFill", "_icon", "shape_colorFill");
Vertex.prototype.publishProxy("icon_shape_colorStroke", "_icon", "shape_colorStroke");
Vertex.prototype.publishProxy("icon_image_colorFill", "_icon", "image_colorFill");

Vertex.prototype.publishProxy("text", "_textBox");
Vertex.prototype.publishProxy("anchor", "_textBox");
Vertex.prototype.publishProxy("textbox_shape_colorStroke", "_textBox", "shape_colorStroke");
Vertex.prototype.publishProxy("textbox_shape_colorFill", "_textBox", "shape_colorFill");
Vertex.prototype.publishProxy("textbox_text_colorFill", "_textBox", "text_colorFill");

Vertex.prototype.publish("iconAnchor", "start", "set", "Icon Anchor Position", ["", "start", "middle", "end"], { tags: ["Basic"] });

Vertex.prototype.publish("tooltip", "", "string", "Tooltip", null, { tags: ["Private"] });

Vertex.prototype.publish("annotationDiameter", 14, "number", "Annotation Diameter", null, { tags: ["Private"] });
Vertex.prototype.publish("annotationSpacing", 3, "number", "Annotation Spacing", null, { tags: ["Private"] });
Vertex.prototype.publish("annotationIcons", [], "array", "Annotations", null, { tags: ["Private"] });

//  Render  ---
Vertex.prototype.enter = function (domNode, _element) {
    SVGWidget.prototype.enter.apply(this, arguments);
    this._icon
        .target(domNode)
        .render()
        ;
    this._textBox
        .target(domNode)
        .render()
        ;
};

Vertex.prototype.update = function (_domNode, element) {
    SVGWidget.prototype.update.apply(this, arguments);
    this._icon
        .tooltip(this.tooltip())
        .render()
        ;
    const iconClientSize = this._icon.getBBox(true);
    this._textBox
        .tooltip(this.tooltip())
        .render()
        ;
    const bbox = this._textBox.getBBox(true);
    switch (this.iconAnchor()) {
        case "start":
            this._icon
                .move({
                    x: -(bbox.width / 2) + (iconClientSize.width / 3),
                    y: -(bbox.height / 2) - (iconClientSize.height / 3)
                });
            break;
        case "middle":
            this._icon
                .move({
                    x: 0,
                    y: -(bbox.height / 2) - (iconClientSize.height / 3)
                });
            break;
        case "end":
            this._icon
                .move({
                    x: (bbox.width / 2) - (iconClientSize.width / 3),
                    y: -(bbox.height / 2) - (iconClientSize.height / 3)
                });
            break;
        default:
    }

    const context = this;
    const annotations = element.selectAll(".annotation").data(this.annotationIcons());
    const annotationsEnter = annotations.enter().append("g")
        .attr("class", "annotation")
        .each(function (_d, idx) {
            context._annotationWidgets[idx] = new Icon()
                .target(this)
                .shape("square")
                ;
        })
        ;
    let xOffset = bbox.width / 2;
    const yOffset = bbox.height / 2;
    annotationsEnter.merge(annotations)
        .each(function (d, idx) {
            const annotationWidget = context._annotationWidgets[idx];
            annotationWidget
                .diameter(context.annotationDiameter())
                .shape_colorFill(context.textbox_shape_colorFill())
                .shape_colorStroke(context.textbox_shape_colorStroke())
                ;
            for (const key in d) {
                if (annotationWidget[key]) {
                    annotationWidget[key](d[key]);
                } else if ((window as any).__hpcc_debug) {
                    console.log("Invalid annotation property:  " + key);
                }
            }
            annotationWidget.render();

            const aBBox = annotationWidget.getBBox(true);
            annotationWidget
                .move({
                    x: xOffset - aBBox.width / 2 + 4,
                    y: yOffset + aBBox.height / 2 - 4
                })
                ;
            xOffset -= aBBox.width + context.annotationSpacing();
        })
        ;
    annotations.exit()
        .each(function (_d, idx) {
            const element2 = d3Select(this);
            delete context._annotationWidgets[idx];
            element2.remove();
        })
        ;
};

//  Methods  ---
Vertex.prototype.intersection = function (pointA, pointB) {
    const i1 = this._icon.intersection(pointA, pointB, this._pos);
    if (i1)
        return i1;
    const i2 = this._textBox.intersection(pointA, pointB, this._pos);
    if (i2)
        return i2;
    return null;
};
