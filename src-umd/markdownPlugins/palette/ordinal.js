var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@hpcc-js/common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@hpcc-js/common");
    var OrdinalColors = /** @class */ (function (_super) {
        __extends(OrdinalColors, _super);
        function OrdinalColors(palID) {
            var _this = _super.call(this) || this;
            _this._drawStartPos = "origin";
            _this._pal = common_1.Palette.ordinal(palID);
            _this._colors = _this._pal.colors();
            return _this;
        }
        OrdinalColors.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            var swatches = element.selectAll(".swatch").data(this._colors);
            swatches.enter().append("rect")
                .attr("class", "swatch")
                .attr("x", function (d, i) { return i * 20; })
                .attr("width", "20")
                .attr("height", "20")
                .style("fill", function (d) { return d; });
        };
        return OrdinalColors;
    }(common_1.SVGWidget));
    var RainbowColors = /** @class */ (function (_super) {
        __extends(RainbowColors, _super);
        function RainbowColors(palID) {
            var _this = _super.call(this) || this;
            _this._drawStartPos = "origin";
            _this._pal = common_1.Palette.rainbow(palID);
            _this._colors = _this._pal.colors();
            return _this;
        }
        RainbowColors.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            var swatches = element.selectAll(".swatch").data(this._colors);
            swatches.enter().append("rect")
                .attr("class", "swatch")
                .attr("x", function (d, i) { return i * 10; })
                .attr("width", "10")
                .attr("height", "20")
                .style("fill", function (d) { return d; });
        };
        return RainbowColors;
    }(common_1.SVGWidget));
    var OrdinalSample = /** @class */ (function (_super) {
        __extends(OrdinalSample, _super);
        function OrdinalSample() {
            var _this = _super.call(this) || this;
            _this._palettes = common_1.Palette.fetchOrdinalItem().map(function (d) { return ({ id: d, w: new OrdinalColors(d) }); });
            return _this;
        }
        OrdinalSample.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            element
                .style("overflow-y", "scroll")
                .style("height", this.height() + "px");
            var context = this;
            var palettes = element.selectAll(".palette").data(this._palettes);
            palettes.enter().append("div")
                .attr("class", "palette")
                .each(function (d) {
                var div = common_1.select(this);
                div.append("b")
                    .text(d.id + ":");
                var svgDiv = div.append("div")
                    .attr("id", function (d, i) { return context.id() + "_" + i; })
                    .style("height", "20px");
                div.append("br");
                d.w
                    .target(svgDiv.node())
                    .render();
            });
        };
        OrdinalSample.prototype.update = function (domNode, element) {
            _super.prototype.update.call(this, domNode, element);
        };
        return OrdinalSample;
    }(common_1.HTMLWidget));
    exports.OrdinalSample = OrdinalSample;
    var RainbowSample = /** @class */ (function (_super) {
        __extends(RainbowSample, _super);
        function RainbowSample() {
            var _this = _super.call(this) || this;
            _this._palettes = common_1.Palette.fetchRainbowItem().map(function (d) { return ({ id: d, w: new RainbowColors(d) }); });
            return _this;
        }
        RainbowSample.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            element
                .style("overflow-y", "scroll")
                .style("height", this.height() + "px");
            var context = this;
            var palettes = element.selectAll(".palette").data(this._palettes);
            palettes.enter().append("div")
                .attr("class", "palette")
                .each(function (d) {
                var div = common_1.select(this);
                div.append("b")
                    .text(d.id + ":");
                var svgDiv = div.append("div")
                    .attr("id", function (d, i) { return context.id() + "_" + i; })
                    .style("height", "20px");
                div.append("br");
                d.w
                    .target(svgDiv.node())
                    .render();
            });
        };
        RainbowSample.prototype.update = function (domNode, element) {
            _super.prototype.update.call(this, domNode, element);
        };
        return RainbowSample;
    }(common_1.HTMLWidget));
    exports.RainbowSample = RainbowSample;
});
//# sourceMappingURL=ordinal.js.map