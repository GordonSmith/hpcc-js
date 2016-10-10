var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./SVGWidget", "css!./Text"], function (require, exports, SVGWidget_1) {
    "use strict";
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text() {
            _super.call(this);
        }
        return Text;
    }(SVGWidget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Text;
    Text.prototype._class += " common_Text";
    Text.prototype.publish("text", "", "string", "Display Text", null, { tags: ["Basic"] });
    Text.prototype.publish("fontFamily", null, "string", "Font Family", null, { tags: ["Intermediate"], optional: true });
    Text.prototype.publish("fontSize", null, "number", "Font Size (px)", null, { tags: ["Intermediate"] });
    Text.prototype.publish("anchor", "middle", "set", "Anchor Position", ["start", "middle", "end"], { tags: ["Intermediate"] });
    Text.prototype.publish("colorFill", null, "html-color", "Fill Color", null, { tags: ["Basic"] });
    Text.prototype.publish("rotation", 0, "number", "Degrees of rotation", null, { tags: ["Basic"] });
    Text.prototype.enter = function (domNode, element) {
        SVGWidget_1.default.prototype.enter.apply(this, arguments);
        this._textElement = element.append("text");
    };
    Text.prototype.update = function (domNode, element) {
        SVGWidget_1.default.prototype.update.apply(this, arguments);
        var context = this;
        this._textElement
            .attr("font-family", this.fontFamily())
            .attr("font-size", this.fontSize());
        var textParts = this.text().split("\n");
        var textLine = this._textElement.selectAll("tspan").data(textParts);
        textLine.enter().append("tspan")
            .attr("class", function (d, i) { return "tspan_" + i; })
            .attr("dy", "1em")
            .attr("x", "0");
        textLine
            .style("fill", this.colorFill())
            .text(function (d) { return d; });
        textLine.exit()
            .remove();
        var bbox = { width: 0, height: 0 };
        try {
            bbox = this._textElement.node().getBBox();
        }
        catch (e) {
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
            .attr("transform", function (d) { return "translate(" + xOffset + "," + yOffset + ")rotate(" + context.rotation() + ")"; });
    };
});
//# sourceMappingURL=Text.js.map