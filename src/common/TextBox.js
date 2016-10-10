var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./SVGWidget", "./Shape", "./Text", "css!./TextBox"], function (require, exports, SVGWidget_1, Shape_1, Text_1) {
    "use strict";
    var TextBox = (function (_super) {
        __extends(TextBox, _super);
        function TextBox() {
            _super.call(this);
            this._shape = new Shape_1.default()
                .shape("rect");
            this._text = new Text_1.default();
        }
        return TextBox;
    }(SVGWidget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TextBox;
    TextBox.prototype._class += " common_TextBox";
    TextBox.prototype.publishProxy("text", "_text");
    TextBox.prototype.publishProxy("shape_colorStroke", "_shape", "colorStroke");
    TextBox.prototype.publishProxy("shape_colorFill", "_shape", "colorFill");
    TextBox.prototype.publishProxy("text_colorFill", "_text", "colorFill");
    TextBox.prototype.publish("paddingLeft", 4, "number", "Padding:  Left", null, { tags: ["Private"] });
    TextBox.prototype.publish("paddingRight", 4, "number", "Padding:  Right", null, { tags: ["Private"] });
    TextBox.prototype.publish("paddingTop", 4, "number", "Padding:  Top", null, { tags: ["Private"] });
    TextBox.prototype.publish("paddingBottom", 4, "number", "Padding:  Bottom", null, { tags: ["Private"] });
    TextBox.prototype.publishProxy("anchor", "_text");
    TextBox.prototype.publish("fixedSize", null);
    TextBox.prototype.publish("tooltip", "", "string", "Tooltip", null, { tags: ["Private"] });
    TextBox.prototype.padding = function (_) {
        this.paddingLeft(_);
        this.paddingRight(_);
        this.paddingTop(_);
        this.paddingBottom(_);
        return this;
    };
    TextBox.prototype.enter = function (domNode, element) {
        SVGWidget_1.default.prototype.enter.apply(this, arguments);
        this._tooltipElement = element.append("title");
        this._shape
            .target(domNode)
            .render();
        this._text
            .target(domNode)
            .render();
    };
    TextBox.prototype.update = function (domNode, element) {
        SVGWidget_1.default.prototype.update.apply(this, arguments);
        this._tooltipElement.text(this.tooltip());
        this._text
            .render();
        var textBBox = this._text.getBBox(true);
        var size = {
            width: this.fixedSize() ? this.fixedSize().width : textBBox.width + this.paddingLeft() + this.paddingRight(),
            height: this.fixedSize() ? this.fixedSize().height : textBBox.height + this.paddingTop() + this.paddingBottom()
        };
        this._shape
            .width(size.width)
            .height(size.height)
            .render();
        if (this.fixedSize()) {
            switch (this.anchor()) {
                case "start":
                    this._text
                        .x(-this.fixedSize().width / 2 + textBBox.width / 2 + (this.paddingLeft() + this.paddingRight()) / 2)
                        .render();
                    break;
                case "end":
                    this._text
                        .x(this.fixedSize().width / 2 - textBBox.width / 2 - (this.paddingLeft() + this.paddingRight()) / 2)
                        .render();
                    break;
            }
        }
    };
    TextBox.prototype.exit = function (domNode, element) {
        this._shape
            .target(null);
        this._text
            .target(null);
        SVGWidget_1.default.prototype.exit.apply(this, arguments);
    };
});
//# sourceMappingURL=TextBox.js.map