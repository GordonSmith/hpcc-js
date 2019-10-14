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
    var HPCCScrollNav = /** @class */ (function (_super) {
        __extends(HPCCScrollNav, _super);
        function HPCCScrollNav() {
            var _this = _super.call(this) || this;
            _this._yOffset = 0;
            _this._prevMarkerTop = 0;
            _this._tempDisableScrollHandler = false;
            return _this;
        }
        HPCCScrollNav.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            this._marker = element.append("div")
                .attr("class", "hpccScrollNav-marker")
                .style("position", "relative")
                .style("top", "0px")
                .style("left", "-1px")
                .style("opacity", 0);
            this._ul = element.append("ul")
                .attr("class", "hpccNavScroll-ul")
                .style("list-style-type", "none")
                .style("border-left-width", "2px")
                .style("border-left-style", "solid")
                .style("border-left-color", "var(--border-color, #000)");
        };
        HPCCScrollNav.prototype.update = function (domNode, element) {
            _super.prototype.update.call(this, domNode, element);
            this._yOffset = -domNode.getBoundingClientRect().top;
            var items = this._ul.selectAll(".hpccNavScroll-li").data(this.data(), function (d) { return d.label; });
            var context = this;
            items.enter().append("li")
                .attr("class", "hpccNavScroll-li")
                .each(function (d) {
                var li = common_1.select(this);
                li.append("a")
                    .html(function (d) { return d.label; })
                    .attr("href", d.href)
                    .on("click", function (d) {
                    var navAnchorTop = this.getBoundingClientRect().top;
                    context._tempDisableScrollHandler = true;
                    context.moveMarker(navAnchorTop + context._yOffset + 5);
                });
            });
            if (this.data().length > 0 && this._prevMarkerTop === 0) {
                var firstNavAnchorTop = domNode.querySelector(".hpccNavScroll-li").getBoundingClientRect().top;
                context.moveMarker(firstNavAnchorTop + context._yOffset + 5);
            }
            items.exit().remove();
        };
        HPCCScrollNav.prototype.moveMarker = function (top) {
            this._marker
                .style("top", top + "px")
                .style("opacity", 1);
            this._prevMarkerTop = top;
        };
        HPCCScrollNav.prototype.clicked = function (path) {
        };
        return HPCCScrollNav;
    }(common_1.HTMLWidget));
    exports.HPCCScrollNav = HPCCScrollNav;
});
//# sourceMappingURL=hpccScrollNav.js.map