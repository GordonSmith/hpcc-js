var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "./XYAxis", "../api/INDChart", "../api/ITooltip", "css!./Column"], function (require, exports, d3, XYAxis_1, INDChart, ITooltip) {
    "use strict";
    var Column = (function (_super) {
        __extends(Column, _super);
        function Column() {
            _super.call(this);
            INDChart.call(this);
            ITooltip.call(this);
            this._linearGap = 25;
        }
        Column.prototype.enter = function (domNode, element) {
            _super.prototype.enter.apply(this, arguments);
            var context = this;
            this
                .tooltipHTML(function (d) {
                var value = d.row[d.idx];
                if (value instanceof Array) {
                    value = value[1] - value[0];
                }
                return context.tooltipFormat({ label: d.row[0], series: context.columns()[d.idx], value: value });
            });
        };
        Column.prototype.adjustedData = function () {
            var retVal = this.data().map(function (row) {
                var prevValue = 0;
                return row.map(function (cell, idx) {
                    if (idx === 0) {
                        return cell;
                    }
                    if (idx >= this.columns().length) {
                        return cell;
                    }
                    var retVal = this.yAxisStacked() ? [prevValue, prevValue + cell] : cell;
                    prevValue += cell;
                    return retVal;
                }, this);
            }, this);
            return retVal;
        };
        Column.prototype.updateChart = function (domNode, element, margin, width, height, isHorizontal, duration) {
            var context = this;
            this._palette = this._palette.switch(this.paletteID());
            if (this.useClonedPalette()) {
                this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
            }
            var dataLen = 10;
            var offset = 0;
            switch (this.xAxisType()) {
                case "ordinal":
                    dataLen = this.domainAxis.d3Scale.rangeBand();
                    offset = -dataLen / 2;
                    break;
                case "linear":
                case "time":
                    dataLen = Math.max(Math.abs(this.dataPos(2) - this.dataPos(1)) * (100 - this._linearGap) / 100, dataLen);
                    offset = -dataLen / 2;
                    break;
            }
            var columnScale = d3.scale.ordinal()
                .domain(context.columns().filter(function (d, idx) { return idx > 0; }))
                .rangeRoundBands(isHorizontal ? [0, dataLen] : [dataLen, 0]);
            var column = this.svgData.selectAll(".dataRow")
                .data(this.adjustedData());
            column.enter().append("g")
                .attr("class", "dataRow");
            this.tooltip.direction(isHorizontal ? "n" : "e");
            column
                .each(function (dataRow, i) {
                var element = d3.select(this);
                var columnRect = element.selectAll("rect").data(dataRow.filter(function (d, i) { return i < context.columns().length; }).map(function (d, i) {
                    return {
                        column: context.columns()[i],
                        row: dataRow,
                        value: d,
                        idx: i
                    };
                }).filter(function (d, i) { return d.value !== null && d.idx > 0; }));
                columnRect
                    .enter().append("rect")
                    .attr("class", "columnRect")
                    .call(context._selection.enter.bind(context._selection))
                    .on("mouseout.tooltip", context.tooltip.hide)
                    .on("mousemove.tooltip", context.tooltip.show)
                    .on("click", function (d, idx) {
                    context.click(context.rowToObj(d.row), d.column, context._selection.selected(this));
                })
                    .on("dblclick", function (d, idx) {
                    context.dblclick(context.rowToObj(d.row), d.column, context._selection.selected(this));
                });
                if (isHorizontal) {
                    columnRect.transition().duration(duration)
                        .attr("x", function (d) { return context.dataPos(dataRow[0]) + (context.yAxisStacked() ? 0 : columnScale(d.column)) + offset; })
                        .attr("width", context.yAxisStacked() ? dataLen : columnScale.rangeBand())
                        .attr("y", function (d) { return d.value instanceof Array ? context.valuePos(d.value[1]) : context.valuePos(d.value); })
                        .attr("height", function (d) { return d.value instanceof Array ? context.valuePos(d.value[0]) - context.valuePos(d.value[1]) : height - context.valuePos(d.value); })
                        .style("fill", function (d) { return context._palette(d.column); });
                }
                else {
                    columnRect.transition().duration(duration)
                        .attr("y", function (d) { return context.dataPos(dataRow[0]) + (context.yAxisStacked() ? 0 : columnScale(d.column)) + offset; })
                        .attr("height", context.yAxisStacked() ? dataLen : columnScale.rangeBand())
                        .attr("x", function (d) { return d.value instanceof Array ? context.valuePos(d.value[0]) : 0; })
                        .attr("width", function (d) { return d.value instanceof Array ? context.valuePos(d.value[1]) - context.valuePos(d.value[0]) : context.valuePos(d.value); })
                        .style("fill", function (d) { return context._palette(d.column); });
                }
                columnRect.exit().transition().duration(duration)
                    .remove();
            });
            column.exit().transition().duration(duration)
                .remove();
        };
        return Column;
    }(XYAxis_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Column;
    Column.prototype._class += " chart_Column";
    Column.prototype.implements(INDChart.prototype);
    Column.prototype.implements(ITooltip.prototype);
    Column.prototype.publish("paletteID", "default", "set", "Palette ID", Column.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
    Column.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });
});
//# sourceMappingURL=Column.js.map