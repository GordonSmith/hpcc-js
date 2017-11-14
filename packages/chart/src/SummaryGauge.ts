import { HTMLWidget, publish } from "@hpcc-js/common";
import "d3-transition";

import "../src/SummaryGauge.css";
import { d3ArrayAdapter } from '../../common/lib/Utility';

export class SummaryGauge extends HTMLWidget {

    private _mainDiv;
    private _infoDiv;
    private _valueDiv;
    private _labelDiv;

    @publish("content", "string", "mainDivClasses")
    mainDivClasses: publish<this, string>;
    @publish(null, "set", "iconColumn", function () { return this.columns(); }, { optional: true })
    iconColumn: publish<this, string>;
    @publish(null, "set", "labelColumn", function () { return this.columns(); }, { optional: true })
    labelColumn: publish<this, string>;
    @publish(null, "set", "valueColumn", function () { return this.columns(); }, { optional: true })
    valueColumn: publish<this, string>;
    @publish("#FFFFFF", "html-color", "backgroundColor")
    backgroundColor: publish<this, string>;

    @publish(22, "number", "valueFontSize")
    valueFontSize: publish<this, number>;
    @publish(18, "number", "labelFontSize")
    labelFontSize: publish<this, number>;
    @publish("#000000", "html-color", "labelColor")
    labelColor: publish<this, string>;
    @publish("#000000", "html-color", "valueColor")
    valueColor: publish<this, string>;

    @publish(false, "boolean", "hideLabel")
    hideLabel: publish<this, boolean>;
    @publish(true, "boolean", "fixedSize")
    fixedSize: publish<this, boolean>;
    @publish(225, "number", "minWidth")
    minWidth: publish<this, number>;
    @publish(150, "number", "minHeight")
    minHeight: publish<this, number>;

    constructor() {
        super();
        this._tag = "div";
        this._drawStartPos = "center";
    }

    click(row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };
    dblclick(row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    };

    getColumnValue(column_string) {
        return this.data()[this.columns().indexOf(column_string)];
    };

    enter(_domNode, element) {
        super.enter.apply(this, arguments);
        const context = this;

        this._mainDiv = element.append("div");
        this._infoDiv = this._mainDiv.append("div");
        this._valueDiv = this._infoDiv.append("div");
        this._labelDiv = this._infoDiv.append("div");

        this._infoDiv
            .attr("class", "SummaryGauge-info")
            ;

        this._valueDiv
            .attr("class", "SummaryGauge-value")
            .on("click", function () {
                context.click(context.getColumnValue(context.valueColumn()), context.valueColumn(), true);
            })
            .on("dblclick", function () {
                context.dblclick(context.getColumnValue(context.valueColumn()), context.valueColumn(), true);
            })
            ;

        this._labelDiv
            .attr("class", "SummaryGauge-label")
            .on("click", function () {
                context.click(context.getColumnValue(context.labelColumn()), context.labelColumn(), true);
            })
            .on("dblclick", function () {
                context.dblclick(context.getColumnValue(context.labelColumn()), context.labelColumn(), true);
            })
            ;
        this._mainDiv
            .attr("class", this.mainDivClasses())
            .style("background-color", this.backgroundColor())
            .style("min-width", this.minWidth() ? this.minWidth() + "px" : null)
            .style("min-height", this.minHeight() ? this.minHeight() + "px" : null)
            ;
    };

    update(_domNode, element) {
        super.update.apply(this, arguments);
        this._mainDiv
            .attr("class", this.mainDivClasses())
            .style("background-color", this.backgroundColor())
            .style("min-width", this.minWidth() ? this.minWidth() + "px" : null)
            .style("min-height", this.minHeight() ? this.minHeight() + "px" : null)
            ;
        this._valueDiv
            .style("color", this.valueColor())
            .style("font-size", this.valueFontSize() + 'px')
            .text(this.numberWithCommas(this.getColumnValue(this.valueColumn())))
            ;
        this._labelDiv
            .style("color", this.labelColor())
            .style("font-size", this.labelFontSize() + 'px')
            .text(this.getColumnValue(this.labelColumn()))
            ;
        this.moveInfoToCenter();
    };


    exit(_domNode, _element) {
        super.exit.apply(this, arguments);
    };

    numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };

    moveInfoToCenter() {
        var main_rect = this._mainDiv.node().getBoundingClientRect();
        var info_rect = this._infoDiv.node().getBoundingClientRect();
        var info_top = (main_rect.height / 2) - (info_rect.height / 2);
        var info_left = (main_rect.width / 2) - (info_rect.width / 2);
        this._infoDiv
            .style("top", info_top + 'px')
            .style("left", info_left + 'px')
            .style("height", info_rect.height + 'px')
            .style("width", info_rect.width + 'px')
            ;
    };
}

SummaryGauge.prototype._class += " chart_SummaryGauge";
