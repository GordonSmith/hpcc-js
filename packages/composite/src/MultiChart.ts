import { IGraph, INDChart } from "@hpcc-js/api";
import { Database, HTMLWidget, Utility, Widget } from "@hpcc-js/common";
import { map as d3Map } from "d3-collection";

export class MultiChart extends HTMLWidget {
    _allCharts = {};
    _chartTypeDefaults;
    _chartTypeProperties;
    _chartMonitor;
    _switchingTo;

    constructor() {
        super();
        INDChart.call(this);
        IGraph.call(this);

        this._tag = "div";

        this._allCharts = {};
        this._allChartTypes.forEach(function (item) {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.widget = null;
            this._allCharts[item.id] = newItem;
            this._allCharts[item.display] = newItem;
            this._allCharts[item.widgetClass] = newItem;
        }, this);
        this._chartTypeDefaults = {};
        this._chartTypeProperties = {};
    }

    fields(): Database.Field[];
    fields(_: Database.Field[]): this;
    fields(_?: Database.Field[]): Database.Field[] | this {
        const retVal = super.fields.apply(this, arguments);
        if (this.chart()) {
            if (!arguments.length) return this.chart().fields();
            this.chart().fields(_);
        }
        return retVal;
    }

    columns(): string[];
    columns(_, asDefault?: boolean): this;
    columns(_?, asDefault?: boolean) {
        const retVal = HTMLWidget.prototype.columns.apply(this, arguments);
        if (this.chart()) {
            if (!arguments.length) return this.chart().columns();
            this.chart().columns(_, asDefault);
        }
        return retVal;
    }

    data(_?) {
        const retVal = HTMLWidget.prototype.data.apply(this, arguments);
        if (this.chart()) {
            if (!arguments.length) return this.chart().data();
            this.chart().data(_);
        }
        return retVal;
    }

    hasOverlay() {
        return this.chart() && this.chart().hasOverlay();
    }

    visible(): boolean;
    visible(_: boolean): this;
    visible(_?: boolean): boolean | this {
        if (!arguments.length) return this.chart() && this.chart().visible();
        if (this.chart()) {
            this.chart().visible(_);
        }
        return this;
    }

    chartTypeDefaults(): object;
    chartTypeDefaults(_: object): this;
    chartTypeDefaults(_?: object): object | this {
        if (!arguments.length) return this._chartTypeDefaults;
        this._chartTypeDefaults = _;
        return this;
    }

    chartTypeProperties(): object;
    chartTypeProperties(_: object): this;
    chartTypeProperties(_?: object): object | this {
        if (!arguments.length) return this._chartTypeProperties;
        this._chartTypeProperties = _;
        return this;
    }

    getChartDataFamily() {
        return this._allCharts[this.chartType()].family;
    }

    requireContent(chartType, callback) {
        Utility.requireWidget(this._allCharts[chartType].widgetClass).then(function (WidgetClass: any) {
            callback(new WidgetClass());
        });
    }

    switchChart(callback) {
        if (this._switchingTo === this.chartType()) {
            if (callback) {
                callback(this);
            }
            return;
        } else if (this._switchingTo) {
            console.log("Attempting switch to:  " + this.chartType() + ", before previous switch is complete (" + this._switchingTo + ")");
        }
        this._switchingTo = this.chartType();
        const oldContent = this.chart();
        const context = this;
        this.requireContent(this.chartType(), function (newContent) {
            if (newContent !== oldContent) {
                const size = context.size();
                newContent
                    .fields(context.fields())
                    .data(context.data())
                    .size(size)
                    ;

                context.chart(newContent);
                if (oldContent) {
                    oldContent
                        .size({ width: 1, height: 1 })
                        .render()
                        ;
                }
            }
            delete context._switchingTo;
            if (callback) {
                callback(this);
            }
        });
    }

    update(_domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        const content = element.selectAll(".multiChart").data(this.chart() ? [this.chart()] : [], function (d) { return d._id; });
        content.enter().append("div")
            .attr("class", "multiChart")
            .each(function (d) {
                d.target(this);
            })
            ;

        const currChart = this.chart();
        if (currChart) {
            for (const key in this._chartTypeDefaults) {
                if (currChart[key + "_default"]) {
                    try {
                        currChart[key + "_default"](this._chartTypeDefaults[key]);
                    } catch (e) {
                        console.log("Exception Setting Default:  " + key);
                    }
                } else {
                    console.log("Unknown Default:  " + key);
                }
            }
            this._chartTypeDefaults = {};
            for (const propKey in this._chartTypeProperties) {
                if (currChart[propKey]) {
                    try {
                        currChart[propKey](this._chartTypeProperties[propKey]);
                    } catch (e) {
                        console.log("Exception Setting Property:  " + propKey);
                    }
                } else {
                    console.log("Unknown Property:  " + propKey);
                }
            }
            this._chartTypeProperties = {};
        }

        const context = this;
        content
            .each(function (d) { d.resize(context.size()); })
            ;

        content.exit().transition()
            .each(function (d) { d.target(null); })
            .remove()
            ;
    }

    exit(_domNode, _element) {
        if (this._chartMonitor) {
            this._chartMonitor.remove();
            delete this._chartMonitor;
        }
        if (this.chart()) {
            this.chart().target(null);
        }
        HTMLWidget.prototype.exit.apply(this, arguments);
    }

    render(_callback?) {
        if (this.chartType() && (!this.chart() || (this.chart().classID() !== this._allCharts[this.chartType()].widgetClass))) {
            const context = this;
            const args = arguments;
            this.switchChart(function () {
                HTMLWidget.prototype.render.apply(context, args);
            });
            return this;
        }
        return HTMLWidget.prototype.render.apply(this, arguments);
    }
}
MultiChart.prototype._class += " composite_MultiChart";
MultiChart.prototype.implements(INDChart.prototype);
MultiChart.prototype.implements(IGraph.prototype);
export interface ChartMeta {
    id: string;
    display: string;
    widgetClass: string;
    widgetPath?: string;
}
export interface MultiChart {
    _otherChartTypes: ChartMeta[];
    _1DChartTypes: ChartMeta[];
    _2DChartTypes: ChartMeta[];
    _NDChartTypes: ChartMeta[];
    _mapChartTypes: ChartMeta[];
    _anyChartTypes: ChartMeta[];
    _allChartTypes: ChartMeta[];
    _allMap;
    _allFamilies: string[];
    _allChartTypesMap;
    _allChartTypesByClass;

    chartType(): string;
    chartType(_: string): this;
    chart(): Widget;
    chart(_: Widget): this;
    chart_access(): Widget;
    chart_access(_: Widget): this;

    click(_row, _column, _selected): void;
    dblclick(_row, _column, _selected): void;
    vertex_click(row, column, selected, more): void;
    vertex_dblclick(row, column, selected, more): void;
    edge_click(row, column, selected, more): void;
    edge_dblclick(row, column, selected, more): void;
}

MultiChart.prototype._otherChartTypes = [
    { id: "GRAPH", display: "Graph", widgetClass: "graph_Graph" },
    { id: "FORM", display: "Form", widgetClass: "form_Form" }
].map(function (item: any) { item.family = "other"; return item; });
MultiChart.prototype._1DChartTypes = [
    { id: "C3_GAUGE", display: "Gauge (C3)", widgetClass: "c3chart_Gauge" }
].map(function (item: any) { item.family = "1D"; return item; });
MultiChart.prototype._2DChartTypes = [
    { id: "SUMMARY", display: "Summary", widgetClass: "chart_Summary" },
    { id: "BUBBLE", display: "Bubble", widgetClass: "chart_Bubble" },
    { id: "PIE", display: "Pie", widgetClass: "chart_Pie" },
    { id: "GOOGLE_PIE", display: "Pie (Google)", widgetClass: "google_Pie" },
    { id: "C3_DONUT", display: "Donut (C3)", widgetClass: "c3chart_Donut" },
    { id: "C3_PIE", display: "Pie (C3)", widgetClass: "c3chart_Pie" },
    { id: "AM_FUNNEL", display: "Area (amCharts)", widgetClass: "amchart_Funnel" },
    { id: "AM_PIE", display: "Pie (amCharts)", widgetClass: "amchart_Pie" },
    { id: "AM_PYRAMID", display: "Area (amCharts)", widgetClass: "amchart_Pyramid" },
    { id: "WORD_CLOUD", display: "Word Cloud", widgetClass: "other_WordCloud" }
].map(function (item: any) { item.family = "2D"; return item; });
MultiChart.prototype._NDChartTypes = [
    { id: "COLUMN", display: "Column", widgetClass: "chart_Column" },
    { id: "BAR", display: "Bar", widgetClass: "chart_Bar" },
    { id: "LINE", display: "Line", widgetClass: "chart_Line" },
    { id: "AREA", display: "Area", widgetClass: "chart_Area" },
    { id: "STEP", display: "Step", widgetClass: "chart_Step" },
    { id: "SCATTER", display: "Scatter", widgetClass: "chart_Scatter" },
    { id: "HEXBIN", display: "Hex Bin", widgetClass: "chart_HexBin" },
    { id: "GOOGLE_BAR", display: "Bar (Google)", widgetClass: "google_Bar" },
    { id: "GOOGLE_COLUMN", display: "Column (Google)", widgetClass: "google_Column" },
    { id: "GOOGLE_LINE", display: "Line (Google)", widgetClass: "google_Line" },
    { id: "GOOGLE_SCATTER", display: "Scatter (Google)", widgetClass: "google_Scatter" },
    { id: "GOOGLE_COMBO", display: "Combo (Google)", widgetClass: "google_Combo" },
    { id: "C3_AREA", display: "Area (C3)", widgetClass: "c3chart_Area" },
    { id: "C3_BAR", display: "Bar (C3)", widgetClass: "c3chart_Bar" },
    { id: "C3_COLUMN", display: "Column (C3)", widgetClass: "c3chart_Column" },
    { id: "C3_LINE", display: "Line (C3)", widgetClass: "c3chart_Line" },
    { id: "C3_SCATTER", display: "Scatter (C3)", widgetClass: "c3chart_Scatter" },
    { id: "C3_STEP", display: "Step (C3)", widgetClass: "c3chart_Step" },
    { id: "C3_COMBO", display: "Combo (C3)", widgetClass: "c3chart_Combo" },
    { id: "AM_AREA", display: "Area (amCharts)", widgetClass: "amchart_Area" },
    { id: "AM_BAR", display: "Bar (amCharts)", widgetClass: "amchart_Bar" },
    { id: "AM_LINE", display: "Line (amCharts)", widgetClass: "amchart_Line" },
    { id: "AM_SCATTER", display: "Scatter (amCharts)", widgetClass: "amchart_Scatter" },
    { id: "AM_COLUMN", display: "Column (amCharts)", widgetClass: "amchart_Column" },
    { id: "AM_GANTT", display: "Gantt (amCharts)", widgetClass: "amchart_Gantt" },
    { id: "AM_COMBO", display: "Combo (amCharts)", widgetClass: "amchart_Combo" },
].map(function (item: any) { item.family = "ND"; return item; });
MultiChart.prototype._mapChartTypes = [
    { id: "CHORO_USSTATES", display: "US State Choropleth", widgetClass: "map_ChoroplethStates" },
    { id: "CHORO_USCOUNTIES", display: "US County Choropleth", widgetClass: "map_ChoroplethCounties" },
    { id: "CHORO_COUNTRIES", display: "Country Choropleth", widgetClass: "map_ChoroplethCountries" },
    { id: "GOOGLE_MAP", display: "Google Map", widgetClass: "map_GMapLayered" },
    { id: "OPENSTREET", display: "Open Street Map", widgetClass: "map_OpenStreet" }
].map(function (item: any) { item.family = "map"; return item; });
MultiChart.prototype._anyChartTypes = [
    { id: "TABLE", display: "Table", widgetClass: "dgrid_Table" },
    { id: "TABLE_LEGACY", display: "Table (legacy)", widgetClass: "other_Table" },
    { id: "TABLE_NESTED", display: "Nested Table", widgetClass: "other_NestedTable" },
    { id: "TABLE_CALENDAR", display: "Table driven Calendar Heat Map", widgetClass: "other_CalendarHeatMap" },
    { id: "TABLE_BULLET", display: "Table driven bullet chart", widgetClass: "chart_Bullet" },
    { id: "TABLE_SELECT", display: "Table driven select", widgetClass: "other_Select" },
    { id: "TABLE_AUTOCOMPLETE", display: "Table driven auto complete", widgetClass: "other_AutoCompleteText" },
    { id: "TABLE_HANDSON", display: "Table driven handson", widgetClass: "handson_Table" },
    { id: "TABLE_OPPORTUNITY", display: "Table driven opportunity widget", widgetClass: "graph_Opportunity" },
    { id: "TABLE_TREE", display: "Table driven tree", widgetClass: "tree_Dendrogram" },
    { id: "TABLE_TREEMAP", display: "Table driven Treemap", widgetClass: "tree_Treemap" },
    { id: "TABLE_SANKEY", display: "Table driven Sankey", widgetClass: "graph_Sankey" },
    { id: "TABLE_GMAP_PIN", display: "Table driven Google Map (pins)", widgetClass: "map_GMapPin" },
    { id: "TABLE_GMAP_PINLINE", display: "Table driven Google Map (pins/lines)", widgetClass: "map_GMapPinLine" }
].map(function (item: any) { item.family = "any"; return item; });
MultiChart.prototype._allChartTypes =
    MultiChart.prototype._otherChartTypes.concat(
        MultiChart.prototype._1DChartTypes.concat(
            MultiChart.prototype._2DChartTypes.concat(
                MultiChart.prototype._NDChartTypes.concat(
                    MultiChart.prototype._mapChartTypes.concat(
                        MultiChart.prototype._anyChartTypes
                    )))));
MultiChart.prototype._allMap = d3Map(MultiChart.prototype._allChartTypes, function (item: any) { return item.family; });
MultiChart.prototype._allFamilies = MultiChart.prototype._allMap.keys();
MultiChart.prototype._allChartTypesMap = {};
MultiChart.prototype._allChartTypesByClass = {};
MultiChart.prototype._allChartTypes.forEach(function (item) {
    item.widgetPath = Utility.widgetPath(item.widgetClass);
    MultiChart.prototype._allChartTypesMap[item.id] = item;
    MultiChart.prototype._allChartTypesByClass[item.widgetClass] = item;
});

MultiChart.prototype.publishReset();
MultiChart.prototype.publish("chartType", "BUBBLE", "set", "Chart Type", MultiChart.prototype._allChartTypes.map(function (item) { return item.id; }), { tags: ["Basic"] });
MultiChart.prototype.publish("chart", null, "widget", "Chart", null, { tags: ["Basic"] });

const _origChart = MultiChart.prototype.chart;
MultiChart.prototype.chart = function (_?) {
    const retVal = _origChart.apply(this, arguments);
    if (arguments.length) {
        const context = this;
        if (this._allChartTypesByClass[_.classID()]) {
            this.chartType(this._allChartTypesByClass[_.classID()].id);
        } else {
            console.log("Unknown Class ID:  " + _.classID());
        }
        _.click = function (_row, _column, _selected) {
            context.click.apply(context, arguments);
        };
        _.dblclick = function (_row, _column, _selected) {
            context.dblclick.apply(context, arguments);
        };
        _.vertex_click = function (row, column, selected, more) {
            context.vertex_click.apply(context, arguments);
        };
        _.vertex_dblclick = function (row, column, selected, more) {
            context.vertex_dblclick.apply(context, arguments);
        };
        _.edge_click = function (row, column, selected, more) {
            context.edge_click.apply(context, arguments);
        };
        _.edge_dblclick = function (row, column, selected, more) {
            context.edge_dblclick.apply(context, arguments);
        };
        if (this._chartMonitor) {
            this._chartMonitor.remove();
            delete this._chartMonitor;
        }
        this._chartMonitor = _.monitor(function (key, newVal, oldVal) {
            context.broadcast(key, newVal, oldVal, _);
        });
    }
    return retVal;
};