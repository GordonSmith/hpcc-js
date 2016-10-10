var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./SVGWidget", "./Text", "css!font-awesome", "css!./FAChar"], function (require, exports, SVGWidget_1, Text_1) {
    "use strict";
    var FAChar = (function (_super) {
        __extends(FAChar, _super);
        function FAChar() {
            _super.call(this);
            this._text = new Text_1.default()
                .fontFamily("FontAwesome");
        }
        return FAChar;
    }(SVGWidget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FAChar;
    FAChar.prototype = Object.create(SVGWidget_1.default.prototype);
    FAChar.prototype.constructor = FAChar;
    FAChar.prototype._class += " common_FAChar";
    FAChar.prototype.publish("char", "", "string", "Font Awesome Item", null, { tags: ["Private"] });
    FAChar.prototype.publish("fontSize", null, "number", "Font Size", null, { tags: ["Private"] });
    FAChar.prototype.publishProxy("text_colorFill", "_text", "colorFill");
    FAChar.prototype.enter = function (domNode, element) {
        SVGWidget_1.default.prototype.enter.apply(this, arguments);
        this._text
            .target(domNode);
    };
    FAChar.prototype.update = function (domNode, element) {
        SVGWidget_1.default.prototype.update.apply(this, arguments);
        this._text
            .text(this.char())
            .scale((this.fontSize() || 14) / 14) //  Scale rather than fontSize to prevent Chrome glitch  ---
            .render();
    };
    FAChar.prototype.exit = function (domNode, element) {
        this._text
            .target(null);
        SVGWidget_1.default.prototype.exit.apply(this, arguments);
    };
});
//# sourceMappingURL=FAChar.js.map