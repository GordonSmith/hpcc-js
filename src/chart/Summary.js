var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "../common/HTMLWidget", "../api/I2DChart", "css!font-awesome", "css!./Summary"], function (require, exports, d3, HTMLWidget_1, I2DChart_1) {
    "use strict";
    var TEXT = "text";
    var HTML = "html";
    var Summary = (function (_super) {
        __extends(Summary, _super);
        function Summary() {
            _super.call(this);
            this._tag = "div";
            this._drawStartPos = "center";
            this.playInterval(this.playInterval());
            this._playIntervalIdx = 0;
        }
        Summary.prototype.playInterval = function (_) {
            var retVal = this.playInterval_call.apply(this, arguments);
            if (arguments.length) {
                if (this._playIntervalHandle) {
                    clearInterval(this._playIntervalHandle);
                }
                var context = this;
                if (_) {
                    this._playIntervalHandle = setInterval(function () {
                        context._playIntervalIdx++;
                        if (context._renderCount && context.data().length) {
                            context.render();
                        }
                    }, _);
                }
            }
            return retVal;
        };
        Summary.prototype.summaryData = function () {
            var labelFieldIdx = 0;
            if (this.labelColumn_exists()) {
                labelFieldIdx = this.columns().indexOf(this.labelColumn());
            }
            var iconFieldIdx; //  undefined
            if (this.iconColumn_exists()) {
                iconFieldIdx = this.columns().indexOf(this.iconColumn());
            }
            var valueFieldIdx = 1;
            if (this.valueColumn_exists()) {
                valueFieldIdx = this.columns().indexOf(this.valueColumn());
            }
            var moreTextIdx; //  undefined
            if (this.moreTextColumn_exists()) {
                moreTextIdx = this.columns().indexOf(this.moreTextColumn());
            }
            var colorFillIdx; //  undefined
            if (this.colorFillColumn_exists()) {
                colorFillIdx = this.columns().indexOf(this.colorFillColumn());
            }
            var colorStrokeIdx; //  undefined
            if (this.colorStrokeColumn_exists()) {
                colorStrokeIdx = this.columns().indexOf(this.colorStrokeColumn());
            }
            return this.formattedData().map(function (row) {
                return {
                    icon: iconFieldIdx === undefined ? this.icon() : row[iconFieldIdx],
                    label: row[labelFieldIdx],
                    value: row[valueFieldIdx],
                    more: moreTextIdx === undefined ? this.moreText() : row[moreTextIdx],
                    fill: colorFillIdx === undefined ? this.colorFill() : row[colorFillIdx],
                    stroke: colorStrokeIdx === undefined ? this.colorStroke() : row[colorStrokeIdx]
                };
            }, this);
        };
        Summary.prototype.enter = function (domNode, element) {
            _super.prototype.enter.apply(this, arguments);
            this._mainDiv = element.append("div");
            var context = this;
            this._headerDiv = this._mainDiv.append("h2")
                .on("click", function (d) {
                context.click(context.data()[context._playIntervalIdx], context.columns()[1], true);
            })
                .on("dblclick", function (d) {
                context.dblclick(context.data()[context._playIntervalIdx], context.columns()[1], true);
            });
            this._textDiv = this._mainDiv.append("div")
                .attr("class", "text")
                .on("click", function (d) {
                context.click(context.data()[context._playIntervalIdx], context.columns()[1], true);
            })
                .on("dblclick", function (d) {
                context.dblclick(context.data()[context._playIntervalIdx], context.columns()[1], true);
            });
        };
        Summary.prototype.update = function (domNode, element) {
            _super.prototype.update.apply(this, arguments);
            if (this.data().length) {
            }
            var data = this.summaryData();
            if (this._playIntervalIdx >= data.length) {
                this._playIntervalIdx = 0;
            }
            var row = this._playIntervalIdx < data.length ? data[this._playIntervalIdx] : ["", ""];
            element
                .style({
                width: this.fixedSize() ? this.minWidth_exists() ? this.minWidth() + "px" : null : "100%",
                height: this.fixedSize() ? this.minHeight_exists() ? this.minHeight() + "px" : null : "100%"
            });
            this._mainDiv
                .attr("class", "content bgIcon " + row.icon)
                .transition()
                .style({
                "background-color": row.fill,
                "color": row.stroke,
                "min-width": this.minWidth_exists() ? this.minWidth() + "px" : null,
                "min-height": this.minHeight_exists() ? this.minHeight() + "px" : null
            });
            this._headerDiv
                .transition()
                .style("color", row.stroke)[this.valueHTML() ? HTML : TEXT](row.value);
            this._textDiv[this.valueHTML() ? HTML : TEXT](row.label);
            var context = this;
            var moreDivs = this._mainDiv.selectAll(".more").data([row.more]);
            moreDivs.enter()
                .append("div")
                .attr("class", "more")
                .on("click", function (d) {
                var clickEvent = {};
                clickEvent[context.columns()] = context.data();
                context.click(clickEvent, "more");
            })
                .each(function (d) {
                var element = d3.select(this);
                element.append("i");
                element.append("span");
            });
            moreDivs
                .transition()
                .style("background-color", d3.rgb(row.fill).darker(0.75));
            moreDivs.select("i")
                .attr("class", "fa " + this.moreIcon());
            moreDivs.select("span")[this.moreTextHTML() ? HTML : TEXT](function (d) { return d; });
            moreDivs.exit().remove();
        };
        Summary.prototype.exit = function (domNode, element) {
            _super.prototype.exit.apply(this, arguments);
        };
        return Summary;
    }(HTMLWidget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Summary;
    Summary.prototype.implements(I2DChart_1.default.prototype);
    Summary.prototype._class += " chart_Summary";
    Summary.prototype.publish("iconColumn", null, "set", "Select display value", function () { return this.columns(); }, { optional: true });
    Summary.prototype.publish("icon", "fa-briefcase", "string", "FA Char icon class", null, { disable: function (w) { return w.iconColumn(); } });
    Summary.prototype.publish("labelColumn", null, "set", "Select display value", function () { return this.columns(); }, { optional: true });
    Summary.prototype.publish("labelHTML", false, "boolean", "Allow HTML", null);
    Summary.prototype.publish("valueColumn", null, "set", "Select display value", function () { return this.columns(); }, { optional: true });
    Summary.prototype.publish("valueHTML", false, "boolean", "Allow HTML");
    Summary.prototype.publish("moreTextColumn", null, "set", "Select display value", function () { return this.columns(); }, { optional: true });
    Summary.prototype.publish("moreText", "More Info", "string", "More text", null, { disable: function (w) { return w.moreTextColumn(); } });
    Summary.prototype.publish("moreTextHTML", false, "boolean", "Allow HTML");
    Summary.prototype.publish("moreIcon", "fa-info-circle", "string", "FA Char icon class");
    Summary.prototype.publish("colorFillColumn", null, "set", "Column for color", function () { return this.columns(); }, { optional: true });
    Summary.prototype.publish("colorFill", "#3498db", "html-color", "Fill Color", null, { disable: function (w) { return w.colorFillColumn(); } });
    Summary.prototype.publish("colorStrokeColumn", null, "set", "Column for color", function () { return this.columns(); }, { optional: true });
    Summary.prototype.publish("colorStroke", "#ffffff", "html-color", "Fill Color", null, { disable: function (w) { return w.colorStrokeColumn(); } });
    Summary.prototype.publish("fixedSize", true, "boolean", "Fix Size to Min Width/Height");
    Summary.prototype.publish("minWidth", 225, "number", "Minimum Width");
    Summary.prototype.publish("minHeight", 150, "number", "Minimum Height");
    Summary.prototype.publish("playInterval", null, "number", "Play Interval", null, { optional: true });
});
//# sourceMappingURL=Summary.js.map