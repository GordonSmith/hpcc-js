import { SVGWidget } from "./SVGWidget";
import "css!./Text";

function publish(defValue, type, description, stuff, other) {
    return (target: any, propertyKey: string) => {
        target.publish(propertyKey, defValue, type, description, stuff, other);
    };
}
type publish<T, C> = { (): T; (_: T): C; };
export class Text extends SVGWidget {
    static _class = "common_Text";

    private _textElement;

    @publish("", "string", "Display Text", null, { tags: ["Basic"] })
    text: publish<string, this>;
    @publish(null, "string", "Font Family", null, { tags: ["Intermediate"], optional: true })
    fontFamily: publish<string, this>;
    @publish(null, "number", "Font Size (px)", null, { tags: ["Intermediate"] })
    fontSize: publish<number, this>;
    @publish("middle", "set", "Anchor Position", ["start", "middle", "end"], { tags: ["Intermediate"] })
    anchor: publish<string, this>;
    @publish(null, "html-color", "Fill Color", null, { tags: ["Basic"] })
    colorFill: publish<string, this>;
    @publish(0, "number", "Degrees of rotation", null, { tags: ["Basic"] })
    rotation: publish<number, this>;

    constructor() {
        super();
    }


    enter(domNode, element) {
        super.enter(domNode, element);
        this._textElement = element.append("text");
    };

    update(domNode, element) {
        super.update(domNode, element);
        var context = this;
        this._textElement
            .attr("font-family", this.fontFamily())
            .attr("font-size", this.fontSize())
            ;
        var textParts = this.text().split("\n");
        var textLine = this._textElement.selectAll("tspan").data(textParts);
        textLine.enter().append("tspan")
            .attr("class", function (d, i) { return "tspan_" + i; })
            .attr("dy", "1em")
            .attr("x", "0")
            ;
        textLine
            .style("fill", this.colorFill())
            .text(function (d) { return d; })
            ;
        textLine.exit()
            .remove()
            ;

        var bbox: any = { width: 0, height: 0 };
        try {   //  https://bugzilla.mozilla.org/show_bug.cgi?id=612118
            bbox = this._textElement.node().getBBox();
        } catch (e) {
        }
        var xOffset = -(bbox.x + bbox.width / 2);
        var yOffset = -(bbox.y + bbox.height / 2);
        switch (this.anchor()) {
            case "start":
                xOffset = -bbox.x + bbox.width / 2;
                break;
            case "end":
                xOffset = bbox.x + bbox.width / 2;
                break;
        }

        var theta = -this.rotation() * Math.PI / 180;
        xOffset = -1 * Math.abs(xOffset * Math.cos(theta) + yOffset * Math.sin(theta));
        yOffset = -1 * Math.abs(xOffset * Math.sin(theta) + yOffset * Math.cos(theta));

        this._textElement
            .style("text-anchor", this.anchor())
            .attr("transform", function (d) { return "translate(" + xOffset + "," + yOffset + ")rotate(" + context.rotation() + ")"; })
            ;
    };
}

