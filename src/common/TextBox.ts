import { ISize } from "./Widget";
import { SVGWidget } from "./SVGWidget";
import { Shape } from "./Shape";
import { Text } from "./Text";
import "css!./TextBox";

export class TextBox extends SVGWidget {
    static _class = "common_TextBox";

    protected _shape = new Shape().shape("rect");
    protected _text = new Text();
    protected _tooltipElement;

    constructor() {
        super();
    }

    padding(_) {
        this.paddingLeft(_);
        this.paddingRight(_);
        this.paddingTop(_);
        this.paddingBottom(_);
        return this;
    };

    enter(domNode, element) {
        super.enter(domNode, element);
        this._tooltipElement = element.append("title");
        this._shape
            .target(domNode)
            .render()
            ;
        this._text
            .target(domNode)
            .render()
            ;
    };

    update(domNode, element) {
        super.update(domNode, element);
        this._tooltipElement.text(this.tooltip());
        this._text
            .render()
            ;
        var textBBox = this._text.getBBox(true);
        var size = {
            width: this.fixedSize() ? this.fixedSize().width : textBBox.width + this.paddingLeft() + this.paddingRight(),
            height: this.fixedSize() ? this.fixedSize().height : textBBox.height + this.paddingTop() + this.paddingBottom()
        };
        this._shape
            .width(size.width)
            .height(size.height)
            .render()
            ;
        if (this.fixedSize()) {
            switch (this.anchor()) {
                case "start":
                    this._text
                        .x(-this.fixedSize().width / 2 + textBBox.width / 2 + (this.paddingLeft() + this.paddingRight()) / 2)
                        .render()
                        ;
                    break;
                case "end":
                    this._text
                        .x(this.fixedSize().width / 2 - textBBox.width / 2 - (this.paddingLeft() + this.paddingRight()) / 2)
                        .render()
                        ;
                    break;
            }
        }
    };

    exit(domNode, element) {
        this._shape
            .target(null)
            ;
        this._text
            .target(null)
            ;
        SVGWidget.prototype.exit.apply(this, arguments);
    };

    text: { (): string; (_: string): TextBox; }
    shape_colorFill: { (): string; (_: string): TextBox; }
    shape_colorStroke: { (): string; (_: string): TextBox; }
    text_colorFill: { (): string; (_: string): TextBox; }
    paddingLeft: { (): number; (_: number): TextBox; }
    paddingRight: { (): number; (_: number): TextBox; }
    paddingTop: { (): number; (_: number): TextBox; }
    paddingBottom: { (): number; (_: number): TextBox; }
    anchor: { (): string; (_: string): TextBox; }
    fixedSize: { (): ISize; (_: ISize): TextBox; }
    tooltip: { (): string; (_: string): TextBox; }
}
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

