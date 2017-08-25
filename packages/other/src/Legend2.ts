import { Palette, SVGWidget, Widget } from "@hpcc-js/common";
import { format as d3Format } from "d3-format";
import { scaleOrdinal as d3ScaleOrdinal } from "d3-scale";
import { symbol as d3Symbol, symbolCircle as d3SymbolCircle } from "d3-shape";
import { legendColor as d3LegendColor } from "d3-svg-legend";

export class Legend2 extends SVGWidget {
    _targetWidget: Widget;
    _targetWidgetMonitor;

    constructor() {
        super();
        this._drawStartPos = "origin";
    }

    isRainbow() {
        const widget = this.getWidget();
        return widget && widget._palette && widget._palette.type() === "rainbow";
    }

    targetWidget(): Widget;
    targetWidget(_: Widget): this;
    targetWidget(_?: Widget): Widget | this {
        if (!arguments.length) return this._targetWidget;
        this._targetWidget = _;
        if (this._targetWidgetMonitor) {
            this._targetWidgetMonitor.remove();
            delete this._targetWidgetMonitor;
        }
        const context = this;
        this._targetWidgetMonitor = this._targetWidget.monitor(function (key, newProp, oldProp, source) {
            switch (key) {
                case "chart":
                case "columns":
                case "data":
                case "paletteID":
                    context.lazyRender();
                    break;
            }
        });
        return this;
    }

    getWidget() {
        if (this._targetWidget) {
            switch (this._targetWidget.classID()) {
                case "chart_MultiChart":
                    return (this._targetWidget as any).chart();
            }
        }
        return this._targetWidget;
    }

    getPalette() {
        const widget = this.getWidget();
        if (widget && widget._palette) {
            switch (widget._palette.type()) {
                case "ordinal":
                    return Palette.ordinal(widget._palette.id());
                case "rainbow":
                    return Palette.rainbow(widget._palette.id());
            }
        }
        return Palette.ordinal("default");
    }

    private _g;
    enter(domNode, element) {
        super.enter.apply(domNode, element);
        this._g = element.append("g")
            .attr("class", "legendOrdinal")
            ;
    }

    update(domNode, element) {
        super.update.apply(domNode, element);
        let dataArr = [];
        if (this._targetWidget) {
            const palette = this.getPalette();
            switch (palette.type()) {
                case "ordinal":
                    switch (this.dataFamily()) {
                        case "2D":
                            dataArr = this._targetWidget.data().map(function (n) {
                                return [palette(n[0]), n[0]];
                            }, this);
                            break;
                        case "ND":
                            const widgetColumns = this._targetWidget.columns();
                            dataArr = widgetColumns.filter(function (n, i) { return i > 0; }).map(function (n) {
                                return [palette(n), n];
                            }, this);
                            break;
                    }
                    break;
                case "rainbow":
                    const format = d3Format(this.rainbowFormat());
                    const widget = this.getWidget();
                    const steps = this.rainbowBins();
                    const weightMin = widget._dataMinWeight;
                    const weightMax = widget._dataMaxWeight;
                    const stepWeightDiff = (weightMax - weightMin) / (steps - 1);
                    dataArr.push([palette(weightMin, weightMin, weightMax), format(weightMin)]);
                    for (let x = 1; x < steps - 1; ++x) {
                        const mid = stepWeightDiff * x;
                        dataArr.push([palette(mid, weightMin, weightMax), format(Math.floor(mid))]);
                    }
                    dataArr.push([palette(weightMax, weightMin, weightMax), format(weightMax)]);
                    break;
            }
        }

        const ordinal = d3ScaleOrdinal()
            .domain(dataArr.map(row => row[1]))
            .range(dataArr.map(row => row[0]));

        const legendOrdinal = d3LegendColor()
            .shape("path", d3Symbol().type(d3SymbolCircle).size(150)())
            .shapePadding(10)
            .shapeRadius(10)
            .scale(ordinal);

        this._g.call(legendOrdinal);
        const bbox = this.getBBox(true, true);
        this._g.attr("transform", `translate(${this.width() / 2 - bbox.width / 2 + 5},${this.height() / 2 - bbox.height / 2})`);
    }

    exit(domNode, element) {
        super.exit.apply(domNode, element);
    }

    onClick(rowData, rowIdx) {
        console.log("Legend onClick method");
        console.log("rowData: " + rowData);
        console.log("rowIdx: " + rowIdx);
    }

    onDblClick(rowData, rowIdx) {
        console.log("Legend onDblClick method");
        console.log("rowData: " + rowData);
        console.log("rowIdx: " + rowIdx);
    }

    onMouseOver(rowData, rowIdx) {
        console.log("Legend onMouseOver method");
        console.log("rowData: " + rowData);
        console.log("rowIdx: " + rowIdx);
    }

}
Legend2.prototype._class += " other_Legend";

export interface Legend2 {
    dataFamily(): string;
    dataFamily(_: string): this;
    dataFamily_exists: () => boolean;
    orientation(): string;
    orientation(_: string): this;
    orientation_exists: () => boolean;
    rainbowFormat(): string;
    rainbowFormat(_: string): this;
    rainbowFormat_exists: () => boolean;
    rainbowBins(): number;
    rainbowBins(_: number): this;
    rainbowBins_exists: () => boolean;
}
Legend2.prototype.publish("dataFamily", "ND", "set", "Type of data", ["1D", "2D", "ND", "map", "any"], { tags: ["Private"] });
Legend2.prototype.publish("orientation", "vertical", "set", "Orientation of Legend rows", ["vertical", "horizontal"], { tags: ["Private"] });
Legend2.prototype.publish("rainbowFormat", ",", "string", "Rainbow number formatting", null, { tags: ["Private"], optional: true, disable: w => !w.isRainbow() });
Legend2.prototype.publish("rainbowBins", 8, "number", "Number of rainbow bins", null, { tags: ["Private"], disable: w => !w.isRainbow() });
