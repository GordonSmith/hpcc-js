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
        define(["require", "exports", "@hpcc-js/common", "../src/hpccIndex.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@hpcc-js/common");
    require("../src/hpccIndex.css");
    var isHpccJS = function (_) { return _.indexOf("@hpcc-js") === 0; };
    var HPCCIndex = /** @class */ (function (_super) {
        __extends(HPCCIndex, _super);
        function HPCCIndex() {
            return _super.call(this) || this;
        }
        HPCCIndex.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            this._ul = element.append("ul")
                .attr("class", "hpccIndex-ul");
        };
        HPCCIndex.prototype.update = function (domNode, element) {
            _super.prototype.update.call(this, domNode, element);
            var context = this;
            var data = this.data();
            data.sort(function (l, r) {
                if (isHpccJS(l.label) && isHpccJS(r.label)) {
                    return l.label.localeCompare(r.label);
                }
                else if (isHpccJS(l.label)) {
                    return 1;
                }
                else if (isHpccJS(r.label)) {
                    return -1;
                }
                return 0;
            });
            var items = this._ul.selectAll(".indexItem").data(data);
            items.enter().append("li")
                .attr("class", "indexItem")
                .each(function (d) {
                var li = common_1.select(this);
                var div = li.append("div");
                div.append("span")
                    .text(d.label);
                if (!d.children.length) {
                    div
                        .attr("class", "hpccIndex-sub-li")
                        .on("click", function (_d) {
                        context.clicked(_d.path);
                    });
                }
                else {
                    div
                        .attr("class", "hpccIndex-label-div")
                        .on("click", function () {
                        li.classed("hpccIndex-collapsed", !li.classed("hpccIndex-collapsed"));
                    });
                    var ul = li.append("ul")
                        .attr("class", "hpccIndex-sub-ul");
                    var subSelection = ul.selectAll(".hpccIndex-sub-li").data(d.children);
                    subSelection.enter()
                        .append("li")
                        .attr("class", "hpccIndex-sub-li")
                        .on("click", function (_d) { return context.clicked(_d.path); })
                        .merge(subSelection)
                        .text(function (_d) {
                        return _d.label;
                    });
                    div.append("i")
                        .attr("class", "fa fa-chevron-down");
                }
                /*
                const div = li.append("div")
                    .attr("class", "hpccIndex-label-div")
                    ;
                div
                    .append("span")
                    .text(d.label)
                    ;
                if (d.children.length > 1) {
                    div
                        .on("click", () => {
                            li.classed("hpccIndex-collapsed", !li.classed("hpccIndex-collapsed"));
                        })
                        ;
                    const ul = li.append("ul")
                        .attr("class", "hpccIndex-sub-ul")
                        ;
                    const subSelection = ul
                        .selectAll(".hpccIndex-sub-li")
                        .data(d.children, (_d: any) => _d.label)
                        ;
                    subSelection.enter()
                        .append("li")
                        .attr("class", "hpccIndex-sub-li")
                        .on("click", (_d: any) => context.clicked(_d.path))
                        .merge(subSelection as any)
                        .text((_d: any) => {
                            return _d.label;
                        })
                        ;
                    div.append("i")
                        .attr("class", "fa fa-chevron-down")
                        ;
                } else {
                    div
                        .on("click", (_d: any) => {
                            console.log("_d", _d);
                            context.clicked(_d.children[0].path);
                        })
                        ;
                }
                */
            });
            items.exit().remove();
        };
        HPCCIndex.prototype.clicked = function (path) {
        };
        return HPCCIndex;
    }(common_1.HTMLWidget));
    exports.HPCCIndex = HPCCIndex;
    HPCCIndex.prototype._class += " website_HPCCIndex";
});
//# sourceMappingURL=hpccIndex.js.map