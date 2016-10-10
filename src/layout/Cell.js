var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "./Surface", "css!./Cell"], function (require, exports, d3, Surface_1) {
    "use strict";
    var Cell = (function (_super) {
        __extends(Cell, _super);
        function Cell() {
            _super.call(this);
            this._indicateTheseIds = [];
        }
        return Cell;
    }(Surface_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Cell;
    Cell.prototype._class += " layout_Cell";
    Cell.prototype.publish("gridRow", 0, "number", "Grid Row Position", null, { tags: ["Private"] });
    Cell.prototype.publish("gridCol", 0, "number", "Grid Column Position", null, { tags: ["Private"] });
    Cell.prototype.publish("gridRowSpan", 1, "number", "Grid Row Span", null, { tags: ["Private"] });
    Cell.prototype.publish("gridColSpan", 1, "number", "Grid Column Span", null, { tags: ["Private"] });
    Cell.prototype.publish("indicatorGlowColor", "#EEEE11", "html-color", "Glow color of update-indicator", null, { tags: ["Basic"] });
    Cell.prototype.publish("indicatorBorderColor", "#F48A00", "html-color", "Border color of update-indicator", null, { tags: ["Basic"] });
    Cell.prototype.publish("indicatorOpacity", 0.8, "number", "Opacity of update-indicator", null, { tags: ["Basic"] });
    Cell.prototype.indicateTheseIds = function (_) {
        if (!arguments.length)
            return this._indicateTheseIds;
        this._indicateTheseIds = _;
        return this;
    };
    Cell.prototype.enter = function (domNode, element) {
        Surface_1.default.prototype.enter.apply(this, arguments);
        var context = this;
        element
            .classed("layout_Surface", true)
            .on("mouseenter", function (d) { context.onMouseEnter(); })
            .on("mouseleave", function (d) { context.onMouseLeave(); });
    };
    Cell.prototype.update = function (domNode, element) {
        Surface_1.default.prototype.update.apply(this, arguments);
    };
    Cell.prototype.onMouseEnter = function (widgetArr) {
        var arr = this.indicateTheseIds();
        var opacity = this.indicatorOpacity();
        var indicatorBorderColor = this.indicatorBorderColor();
        var indicatorGlowColor = this.indicatorGlowColor();
        for (var i = 0; i < arr.length; i++) {
            var otherElement = d3.select("#" + arr[i]);
            var otherWidget = otherElement.datum();
            if (otherElement) {
                otherElement.append("div")
                    .attr("class", "update-indicator")
                    .style({
                    width: otherWidget.width() + "px",
                    height: otherWidget.height() + "px",
                    opacity: opacity,
                    "border-color": indicatorBorderColor,
                    "-webkit-box-shadow": "inset 0px 0px 30px 0px " + indicatorGlowColor,
                    "-moz-box-shadow": "inset 0px 0px 30px 0px " + indicatorGlowColor,
                    "box-shadow": "inset 0px 0px 30px 0px " + indicatorGlowColor,
                });
            }
        }
    };
    Cell.prototype.onMouseLeave = function () {
        var arr = this.indicateTheseIds();
        for (var i = 0; i < arr.length; i++) {
            d3.selectAll("#" + arr[i] + " > div.update-indicator").remove();
        }
    };
});
//# sourceMappingURL=Cell.js.map