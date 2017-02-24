import * as d3 from "d3";
import { Class } from "../common/Class";
import { Grid, Field } from "../common/Database";
import { multiSort, exists, mixin } from "../common/Utility";
import { Widget } from "../common/Widget";
import { ESPUrl, HIPIEWorkunit, HIPIERoxie, HIPIEDatabomb } from "../other/Comms";
import { MultiChart } from "../chart/MultiChart";
import { Table } from "../other/Table";
import {
    IDashboard, IDatasource, IOutput, IEvent, IEventUpdate, VisualizationType, IVisualizationField, VisualizationFieldType, IVisualizationIcon,
    IAnyVisualization, IPieVisualization, ILineVisualization, ITableVisualization, IGraphVisualization, IChoroVisualization, ISliderVisualization,
    IAnySource, IPieSource, ILineSource, ITableSource, IGraphSource, IGraphLink, IChoroSource, IHeatMapSource,
    IAnyMapping, IPieMapping, ILineMapping, ITableMapping, IGraphMapping, IGraphLinkMapping, IAnyChoroMapping, IChoroUSStateMapping, IChoroUSCountyMapping, IChoroGeohashMapping, IHeatMapMapping,
    isUSStateMapping, isUSCountyMapping, isGeohashMapping
} from "./DDLApi";

const LOADING = "...loading...";
const _CHANGED = "_changed";

function faCharFix(faChar: string) {
    if (faChar) {
        return String.fromCharCode(parseInt(faChar));
    }
    return faChar;
}

function hipieType2DBType(hipieType: VisualizationFieldType) {
    switch (hipieType) {
        case "bool":
        case "boolean":
            return "boolean";
        case "integer":
        case "float":
        case "double":
            return "number";
        case "date":
        case "time":
            return "time";
        case "geohash":
            return "geohash";
        case "dataset":
            return "dataset";
        case "visualization":
            return "widget";
        default:
            if (hipieType) {
                if (hipieType.indexOf("unsigned") === 0) {
                    return "number";
                } else if (hipieType.indexOf("integer") === 0) {
                    return "number";
                } else if (hipieType.indexOf("real") === 0) {
                    return "number";
                } else if (hipieType.indexOf("string") === 0) {
                    return "string";
                }
            }
    }
    if ((window as any).__hpcc_debug) {
        console.log("unknown hipieType:  " + hipieType);
    }
    return "string";
}

//  Mappings ---
class SourceMappings {
    visualization: Visualization;
    mappings: { [key: string]: string };

    hasMappings = false;
    reverseMappings: { [key: string]: string } = {};
    columns: string[] = [];
    columnsIdx: { [key: string]: number } = {};
    columnsRHS: string[] = [];
    columnsRHSIdx: { [key: string]: number } = {};

    constructor(visualization: Visualization, mappings: { [key: string]: string | string[] } | IPieMapping | IAnyChoroMapping | IGraphLinkMapping | IHeatMapMapping) {
        this.visualization = visualization;
        var newMappings = {};
        for (var key in mappings) {
            if (mappings[key] instanceof Array) {
                (<string[]>mappings[key]).forEach(function (mapingItem, idx) {
                    newMappings[idx === 0 ? key : key + "_" + idx] = mapingItem;
                });
            } else {
                newMappings[key] = mappings[key];
            }
        }
        this.mappings = newMappings;
        this.hasMappings = false;
        this.reverseMappings = {};
        this.columns = [];
        this.columnsIdx = {};
        this.columnsRHS = [];
        this.columnsRHSIdx = {};
    }

    init() {
        for (var key in this.mappings) {
            this.reverseMappings[this.mappings[key]] = key;
            if (this.columnsIdx[key] === undefined) {
                this.columns.push(key);
                this.columnsIdx[key] = this.columns.length - 1;
            }
            this.columnsRHS[this.columnsIdx[key]] = this.mappings[key];
            this.columnsRHSIdx[this.mappings[key]] = this.columnsIdx[key];
            this.hasMappings = true;
        }
    }

    getFields() {
        if (this.visualization.fields) {
            return Object.keys(this.mappings).map(function (key) {
                return this.visualization.fields.filter(function (field) {
                    return field.id === this.mappings[key];
                }, this).map(function (field) {
                    return new Field(field.id)
                        .type(hipieType2DBType(field.properties.type))
                        .label(this.reverseMappings[field.id])
                        ;
                }, this)[0];
            }, this);
        }
        return null;
    }

    contains(key) {
        return this.mappings[key] !== undefined;
    }

    doMap(item) {
        var retVal = [];
        for (var key in this.mappings) {
            var rhsKey = this.mappings[key];
            try {
                var val = item[rhsKey];
                if (val === undefined) {
                    val = item[rhsKey.toLowerCase()];
                }
                retVal[this.columnsIdx[key]] = val;
            } catch (e) {
                console.log("Invalid Mapping:  " + this.visualization.id + " [" + rhsKey + "->" + item + "]");
            }
        }
        return retVal;
    }

    doReverseMap(item) {
        var retVal = {};
        for (var key in this.mappings) {
            var rhsKey = this.mappings[key];
            try {
                var val = item[key];
                if (val === undefined) {
                    val = item[key.toLowerCase()];
                }
                retVal[rhsKey] = val;
            } catch (e) {
                console.log("Invalid Mapping:  " + this.visualization.id + " [" + key + "->" + item + "]");
            }
        }
        return retVal;
    }

    doMapAll(data) {
        return data.hipieMappings(this.columnsRHS, this.visualization.dashboard.marshaller.missingDataString());
    }

    getMap(key) {
        return this.mappings[key];
    }

    getReverseMap(key) {
        return this.reverseMappings[key];
    }

    toDDL(): IPieMapping {
        return (<any>(this.mappings)); //TODO
    }
}

class ChartMappings extends SourceMappings {
    constructor(visualization: Visualization, mappings: IPieMapping) {
        super(visualization, mappings);
        this.columns = ["label", "weight"];
        this.columnsIdx = { label: 0, weight: 1 };
        this.init();
    }
}

class ChoroMappings extends SourceMappings {
    constructor(visualization: Visualization, mappings: IAnyChoroMapping) {
        super(visualization, mappings);
        if (isUSStateMapping(mappings)) {
            this.columns = ["state", "weight"];
            this.columnsIdx = { state: 0, weight: 1 };
        } else if (isUSStateMapping(mappings)) {
            this.columns = ["county", "weight"];
            this.columnsIdx = { county: 0, weight: 1 };
        } else if (isGeohashMapping(mappings)) {
            this.columns = ["geohash", "weight"];
            this.columnsIdx = { geohash: 0, weight: 1 };
        }
        this.init();
    }
}

class ChoroMappings2 extends SourceMappings {
    constructor(visualization: Visualization, mappings: IAnyChoroMapping) {
        super(visualization, mappings);
        if (isUSStateMapping(mappings)) {
            this.columns = ["state"];
            this.columnsIdx = { state: 0 };
        } else if (isUSStateMapping(mappings)) {
            this.columns = ["county"];
            this.columnsIdx = { county: 0 };
        } else if (isGeohashMapping(mappings)) {
            this.columns = ["geohash", "label"];
            this.columnsIdx = { geohash: 0, label: 1 };
        }
        var weightOffset = this.columns.length;
        if (mappings.weight instanceof Array) {
            mappings.weight.forEach(function (w, i) {
                this.columns.push(w);
                this.columnsIdx[i === 0 ? "weight" : "weight_" + i] = i + weightOffset;
            }, this);
        }
        this.init();
    }
}

class HeatMapMappings extends SourceMappings {
    constructor(visualization: Visualization, mappings: IHeatMapMapping) {
        super(visualization, mappings);
        this.columns = ["x", "y", "weight"];
        this.columnsIdx = { x: 0, y: 1, weight: 2 };
        this.init();
    }
}

class LineMappings extends SourceMappings {
    constructor(visualization: Visualization, mappings: ILineMapping) {
        var newMappings = {
            label: mappings.x[0]
        };
        mappings.y.forEach(function (item, idx) {
            newMappings[item] = item;
        });
        super(visualization, newMappings);
        this.init();
    }
}

class TableMappings extends SourceMappings {
    constructor(visualization: Visualization, mappings: ITableMapping) {
        var newMappings: { [key: string]: string } = {};
        for (var key in mappings) {
            mappings[key].forEach(function (mapingItem, idx) {
                newMappings[visualization.label[idx]] = mapingItem;
            });
        }
        super(visualization, newMappings);
        this.init();
    }

    init() {
        this.visualization.label.forEach(function (label, idx) {
            this.reverseMappings[this.mappings[label]] = label;
            this.columns.push(label);
            this.columnsIdx[label] = idx;
            this.columnsRHS[idx] = this.mappings[label];
            this.columnsRHSIdx[this.mappings[label]] = idx;
            this.hasMappings = true;
        }, this);
    }

    doMapAll(data) {
        var retVal = SourceMappings.prototype.doMapAll.apply(this, arguments);
        if (retVal instanceof Array) {
            var columnsRHSIdx = this.visualization.source.getColumnsRHSIdx();
            this.visualization.fields.forEach(function (field) {
                var fieldType = (!field || !field.properties) ? "unknown" : hipieType2DBType(field.properties.type);
                var colIdx = columnsRHSIdx[field.id];
                if (colIdx === undefined) {
                    console.log("Invalid Mapping:  " + field.id);
                } else {
                    retVal = retVal.map(function (row) {
                        var cell = row[colIdx];
                        if (cell && cell.Row) {
                            cell = cell.Row;
                        }
                        if (cell instanceof Array) {
                            switch (fieldType) {
                                case "dataset":
                                    var columns = [];
                                    var columnsIdx = {};
                                    var data = cell.map(function (row, idx) {
                                        var retVal = [];
                                        retVal.length = columns.length;
                                        for (var key in row) {
                                            if (idx === 0) {
                                                columnsIdx[key] = columns.length;
                                                columns.push(key);
                                            }
                                            retVal[columnsIdx[key]] = row[key];
                                        }
                                        return retVal;
                                    });
                                    var table = new Table()
                                        .columns(columns)
                                        .data(data)
                                        ;
                                    row[colIdx] = table;
                                    break;
                                case "widget":
                                    var viz = this.visualization.vizDeclarations[field.properties.localVisualizationID];
                                    var output = viz.source.getOutput();
                                    var db = output.db;
                                    output.setData(cell, []);
                                    var widget = viz.widget;
                                    var newWidget = new widget.constructor()
                                        .showToolbar(false)
                                        .chartType(widget.chartType())
                                        .chartTypeDefaults(widget.chartTypeDefaults())
                                        .columns(viz.source.getColumns())
                                        .data(viz.source.getData())
                                        ;
                                    output.db = db;
                                    row[colIdx] = newWidget;
                                    break;
                            }
                        }
                        return row;
                    }, this);
                }
            }, this);
        }
        return retVal;
    }
}

class GraphMappings extends SourceMappings {
    visualization: Visualization;
    icon: IVisualizationIcon;
    fields: IVisualizationField[];
    columns = ["uid", "label", "weight", "flags"];
    columnsIdx = { uid: 0, label: 1, weight: 2, flags: 3 };
    link: IGraphLink;
    linkMappings: SourceMappings;

    constructor(visualization: Visualization, mappings: IGraphMapping, link: IGraphLink) {
        super(visualization, mappings);
        this.icon = visualization.icon || { faChar: "\uf128" };
        this.fields = visualization.fields || [];
        this.columns = ["uid", "label", "weight", "flags"];
        this.columnsIdx = { uid: 0, label: 1, weight: 2, flags: 3 };
        this.init();
        this.link = link;
        this.linkMappings = new SourceMappings(visualization, this.link.mappings);
        this.linkMappings.columns = ["uid"];
        this.linkMappings.columnsIdx = { uid: 0 };
        this.visualization = visualization;
    }

    calcIconInfo(flag: IVisualizationIcon, origItem, forAnnotation) {
        var retVal = {};
        function mapStruct(struct, retVal) {
            if (struct) {
                for (var key in struct) {
                    switch (key) {
                        case "faChar":
                            retVal.faChar = faCharFix(struct.faChar);
                            break;
                        default:
                            if (forAnnotation && key.indexOf("icon_") === 0) { //  Backward compatability
                                console.log("Deprecated flag property:  " + key);
                                retVal[key.split("icon_")[1]] = struct[key];
                            } else {
                                retVal[key] = struct[key];
                            }
                    }
                }
            }
        }
        if (origItem && origItem[flag.fieldid] && flag.valuemappings) {
            var annotationInfo = flag.valuemappings[origItem[flag.fieldid]];
            mapStruct(annotationInfo, retVal);
        }

        for (var key in retVal) { // jshint ignore:line
            return retVal;
        }
        return null;
    }

    doMapAll(db) {
        var data = db.jsonObj();
        var context = this;
        var vertexMap = {};
        var vertices = [];
        var graph: any = this.visualization.widget;
        function getVertex(item, origItem?) {
            var id = "uid_" + item[0];
            var retVal = vertexMap[id];
            if (!retVal && origItem) {
                retVal = new graph.Vertex()
                    .faChar((context.icon && context.icon.faChar ? faCharFix(context.icon.faChar) : "\uf128"))
                    .text(item[1] ? item[1] : "")
                    .data(item)
                    ;
                retVal.__hpcc_uid = item[0];
                vertexMap[id] = retVal;
                vertices.push(retVal);

                //  Icon  ---
                var iconInfo = context.calcIconInfo(context.visualization.icon, origItem, false);
                if (iconInfo) {
                    for (var key in iconInfo) {
                        if (retVal[key]) {
                            retVal[key](iconInfo[key]);
                        }
                    }
                }

                // Annotations  ---
                var annotations = [];
                context.visualization.flags.forEach(function (flag) {
                    var iconInfo = context.calcIconInfo(flag, origItem, true);
                    if (iconInfo) {
                        annotations.push(iconInfo);
                    }
                });
                retVal.annotationIcons(annotations);
            }
            return retVal;
        }
        var edges = [];
        data.forEach(function (item) {
            var mappedItem = context.doMap(item);
            getVertex(mappedItem, item);
        });
        data.forEach(function (item) {
            var mappedItem = context.doMap(item);
            var vertex = getVertex(mappedItem, item);
            if (item[context.link.childfile] && item[context.link.childfile] instanceof Array) {
                var childItems = item[context.link.childfile];
                childItems.forEach(function (childItem, i) {
                    var childMappedItem = context.linkMappings.doMap(childItem);
                    var childVertex = getVertex(childMappedItem);
                    if (childVertex && vertex.id() !== childVertex.id()) {
                        var edge = new graph.Edge()
                            .sourceVertex(vertex)
                            .targetVertex(childVertex)
                            .sourceMarker("circle")
                            .targetMarker("arrow")
                            .data(childMappedItem)
                            ;
                        edges.push(edge);
                    }
                });
            }
        });
        return { vertices: vertices, edges: edges, merge: false };
    }
}

//  Viz Source ---
class Source {
    visualization: Visualization;
    private _id: string;
    private _output: string;
    mappings: ChartMappings | LineMappings | TableMappings | GraphMappings | ChoroMappings | ChoroMappings2 | HeatMapMappings;
    properties: { [key: string]: string };
    first: number;
    reverse: boolean;
    sort: string[];

    constructor(visualization: Visualization, source: IAnySource) {
        this.visualization = visualization;
        if (source) {
            this._id = source.id;
            this._output = source.output;
            this.mappings = null;
            if (!source.mappings) {
                console.log("no mappings for:" + visualization.id + "->" + source.id);
            }
            switch (this.visualization.type) {
                case "LINE":
                    this.mappings = new LineMappings(this.visualization, (<ILineMapping>source.mappings));
                    break;
                case "TABLE":
                    this.mappings = new TableMappings(this.visualization, (<ITableSource>source).mappings);
                    break;
                case "GRAPH":
                    this.mappings = new GraphMappings(this.visualization, (<IGraphSource>source).mappings, (<IGraphSource>source).link);
                    break;
                case "CHORO":
                    if ((<IChoroSource>source).mappings.weight instanceof Array && (<IChoroSource>source).mappings.weight.length) {
                        this.mappings = new ChoroMappings2(this.visualization, (<IChoroSource>source).mappings);
                        if ((<IChoroSource>source).mappings.weight.length > 1) {
                            this.visualization.type = "LINE";
                        }
                    } else {
                        this.mappings = new ChoroMappings(this.visualization, (<IChoroSource>source).mappings);
                    }
                    break;
                case "HEAT_MAP":
                    this.mappings = new HeatMapMappings(this.visualization, (<IHeatMapSource>source).mappings);
                    break;
                default:
                    this.mappings = new ChartMappings(this.visualization, (<IPieSource>source).mappings);
                    break;
            }
            this.first = source.first;
            this.reverse = source.reverse;
            this.sort = source.sort;
            this.properties = source.properties;
        }
    }

    getQualifiedID() {
        return this.visualization.getQualifiedID() + "." + this._id;
    }

    exists() {
        return this._id;
    }

    getDatasource() {
        return this.visualization.dashboard.getDataSource(this._id);
    }

    getOutput() {
        var datasource = this.getDatasource();
        if (datasource && datasource._outputs) {
            return datasource._outputs[this._output];
        }
        return null;
    }

    hasData() {
        return this.getOutput().db ? true : false;
    }

    getFields() {
        return this.mappings.getFields();
    }

    getColumnsRHS() {
        return this.mappings.columnsRHS;
    }

    getColumnsRHSIdx() {
        return this.mappings.columnsRHSIdx;
    }

    getColumns() {
        return this.mappings && this.mappings.columns ? this.mappings.columns : [];
    }

    getData() {
        var db = this.getOutput().db;
        var dataRef = db.data();
        if (dataRef.length && this.sort) {
            multiSort(dataRef, db.hipieMapSortArray(this.sort));
        }
        var retVal = this.mappings.doMapAll(db);
        if (this.reverse) {
            retVal.reverse();
        }
        if (this.first && retVal.length > this.first) {
            retVal.length = this.first;
        }
        return retVal;
    }

    getXTitle() {
        return this.mappings.columns[0];
    }

    getYTitle() {
        return this.mappings.columns.filter(function (d, i) { return i > 0; }).join(" / ");
    }

    getMap(col) {
        return (this.mappings && this.mappings.hasMappings) ? this.mappings.getMap(col) : col;
    }

    getReverseMap(col) {
        return (this.mappings && this.mappings.hasMappings) ? this.mappings.getReverseMap(col) : col;
    }

    toDDL(): IAnySource {
        return {
            id: this._id,
            output: this._output,
            sort: this.sort,
            first: this.first,
            reverse: this.reverse,
            mappings: this.mappings.toDDL(),
            properties: this.properties
        };
    }
}

//  Viz Events ---
class EventUpdate {
    event: Event;
    dashboard: Dashboard;
    _col: string;
    private _visualization: string;
    private _instance: string;
    private _datasource: string;
    private _merge: boolean;
    private _mappings: { [key: string]: string };

    constructor(event: Event, update: IEventUpdate, defMappings: { [key: string]: string }) {
        this.event = event;
        this.dashboard = event.visualization.dashboard;
        this._col = update.col;
        this._visualization = update.visualization;
        this._instance = update.instance;
        this._datasource = update.datasource;
        this._merge = update.merge;
        this._mappings = update.mappings || defMappings;
    }

    getDatasource() {
        return this.dashboard.getDataSource(this._datasource);
    }

    getVisualization() {
        return this.dashboard.getVisualization(this._visualization);
    }

    mapData(row) {
        var retVal = {};
        if (row) {
            for (var key in this._mappings) {
                var origKey = this.getReverseMap(key);
                retVal[this._mappings[key]] = row[origKey];
            }
        }
        return retVal;
    }

    getMap(col) {
        return this.event.visualization.source.getMap(col);
    }

    getReverseMap(col) {
        return this.event.visualization.source.getReverseMap(col);
    }

    mapSelected() {
        if (this.event.visualization.hasSelection()) {
            return this.mapData(this.event.visualization._widgetState.row);
        }
        return this.mapData({});
    }

    calcRequestFor(visualization) {
        var retVal = {};
        var updateVisualization = this.getVisualization();
        updateVisualization.getInputVisualizations().forEach(function (inViz, idx) {
            //  Calc request for each visualization to be updated  ---
            var changed = inViz === visualization;
            inViz.getUpdatesForVisualization(updateVisualization).forEach(function (inVizUpdateObj) {
                //  Gather all contributing "input visualization events" for the visualization that is to be updated  ---
                var inVizRequest = inVizUpdateObj.mapSelected();
                for (var key in inVizRequest) {
                    if (retVal[key] && retVal[key] !== inVizRequest[key]) {
                        console.log("Duplicate Filter with mismatched value (defaulting to 'first' or 'first changed' instance):  " + key);
                        if (changed) {
                            retVal[key] = inVizRequest[key];
                            retVal[key + _CHANGED] = changed;
                        }
                    } else {
                        retVal[key] = inVizRequest[key];
                        retVal[key + _CHANGED] = changed;
                    }
                }
            });
        });
        return retVal;
    }

    toDDL(): IEventUpdate {
        return {
            visualization: this._visualization,
            instance: this._instance,
            datasource: this._datasource,
            merge: this._merge,
            col: this._col,
            mappings: this._mappings
        };
    }
}

class Event {
    visualization: Visualization;
    eventID: string;
    private _updates: EventUpdate[];
    private _mappings: { [key: string]: string };

    constructor(visualization: Visualization, eventID: string, event: IEvent) {
        this.visualization = visualization;
        this.eventID = eventID;
        this._updates = [];
        this._mappings = event.mappings;
        if (event) {
            this._updates = event.updates.map(function (updateInfo) {
                return new EventUpdate(this, updateInfo, event.mappings);
            }, this);
        }
    }

    exists() {
        return this._updates.length;
    }

    getUpdates() {
        return this._updates.filter(function (updateInfo) {
            if (!updateInfo._col) return true;
            return updateInfo._col === updateInfo.getMap(this.visualization._widgetState.col);
        }, this);
    }

    getUpdatesDatasources() {
        var dedup = {};
        var retVal = [];
        this.getUpdatesVisualizations().forEach(function (item, idx) {
            var datasource = item.source.getDatasource();
            if (datasource && !dedup[datasource.id]) {
                dedup[datasource.id] = true;
                retVal.push(datasource);
            }
        }, this);
        return retVal;
    }

    getUpdatesVisualizations() {
        var dedup = {};
        var retVal = [];
        this._updates.forEach(function (updateObj, idx) {
            var visualization = updateObj.getVisualization();
            if (!dedup[visualization.id]) {
                dedup[visualization.id] = true;
                retVal.push(visualization);
            }
        }, this);
        return retVal;
    }

    fetchData() {
        var fetchDataOptimizer = new VisualizationRequestOptimizer();
        this.getUpdates().forEach(function (updateObj) {
            fetchDataOptimizer.appendRequest(updateObj.getDatasource(), updateObj.calcRequestFor(this.visualization), updateObj.getVisualization());
        }, this);
        return fetchDataOptimizer.fetchData();
    }

    toDDL(): IEvent {
        return {
            mappings: this._mappings,
            updates: this._updates.map((eventUpdate) => {
                return eventUpdate.toDDL();
            })
        };
    }
}

class Events {
    visualization: Visualization;
    events: { [key: string]: Event } = {};
    private _updates;

    constructor(visualization: Visualization, events: { [key: string]: IEvent }) {
        this.visualization = visualization;
        this.events = {};
        for (var key in events) {
            this.events[key] = new Event(visualization, key, events[key]);
        }
    }

    setWidget(widget) {
        var context = this;
        for (var key in this.events) {
            if (widget["vertex_" + key]) {
                widget["vertex_" + key] = function (row, col, selected) {
                    context.visualization.processEvent(key, context.events[key], row, col, selected);
                };
            } else if (widget[key]) {
                widget[key] = function (row, col, selected) {
                    context.visualization.processEvent(key, context.events[key], row, col, selected);
                };
            }
        }
    }

    exists() {
        return this._updates !== undefined;
    }

    getUpdates() {
        var retVal = [];
        for (var key in this.events) {
            retVal = retVal.concat(this.events[key].getUpdates());
        }
        return retVal;
    }

    getUpdatesDatasources() {
        var retVal = [];
        for (var key in this.events) {
            retVal = retVal.concat(this.events[key].getUpdatesDatasources());
        }
        return retVal;
    }

    getUpdatesVisualizations() {
        var retVal = [];
        for (var key in this.events) {
            retVal = retVal.concat(this.events[key].getUpdatesVisualizations());
        }
        return retVal;
    }

    toDDL(): { [key: string]: IEvent } {
        let retVal = {};
        for (let key in this.events) {
            retVal[key] = this.events[key].toDDL();
        }
        return retVal;
    }
}

//  Visualization ---
function es6Require(deps, callback, errback?, _require?) {
    var require = _require || (window as any).require;
    require(deps, function (objs) {
        for (var i = 0; i < arguments.length; ++i) {
            var depParts = deps[i].split("/");
            if (depParts.length && arguments[i][depParts[depParts.length - 1]]) {
                arguments[i] = arguments[i][depParts[depParts.length - 1]];
            }
        }
        callback.apply(this, arguments);
    }, errback);
}

export class Visualization extends Class {
    type: VisualizationType;
    id: string;
    title: string;

    dashboard: Dashboard;
    parentVisualization: Visualization;

    label;
    icon: IVisualizationIcon;
    flags: IVisualizationIcon[];
    fields: IVisualizationField[];
    fieldsMap: { [key: string]: IVisualizationField };
    properties;
    source: Source;
    events: Events;
    layers: Visualization[] = [];
    hasVizDeclarations = false;
    vizDeclarations: { [key: string]: Visualization } = {};
    widget: Widget;
    _widgetState;

    constructor(dashboard: Dashboard, visualization: IAnyVisualization, parentVisualization: Visualization) {
        super();

        this.dashboard = dashboard;
        this.parentVisualization = parentVisualization;
        this.type = visualization.type;
        this.id = visualization.id;

        switch (this.type) {
            case "TABLE":
                this.label = (<ITableVisualization>visualization).label;
                break;
            case "GRAPH":
                this.label = (<IGraphVisualization>visualization).label;
                this.icon = (<IGraphVisualization>visualization).icon || { faChar: "\uf128" };
                this.flags = (<IGraphVisualization>visualization).flag || [];
                break;
        }
        this.title = visualization.title || visualization.id;
        this.fields = visualization.fields || [];
        this.fieldsMap = {};
        this.fields.forEach(function (d) {
            this.fieldsMap[d.id] = d;
        }, this);

        this.properties = visualization.properties || (visualization.source ? visualization.source.properties : null) || {};
        this.source = new Source(this, visualization.source);
        this.events = new Events(this, visualization.events);
        this.layers = [];
        this.hasVizDeclarations = false;
        this.vizDeclarations = {};
        if (this.type === "CHORO") {
            this.layers = ((<IChoroVisualization>visualization).visualizations || []).map(function (innerViz) {
                return dashboard.createVisualization(innerViz, this);
            }, this);
        } else {
            ((<IChoroVisualization>visualization).visualizations || []).forEach(function (innerViz) {
                this.vizDeclarations[innerViz.id] = dashboard.createVisualization(innerViz, this);
                this.hasVizDeclarations = true;
            }, this);
        }
        var context = this;
        switch (this.type) {
            case "CHORO":
                var chartType = visualization.properties && visualization.properties.charttype ? visualization.properties.charttype : "";
                if (parentVisualization) {
                    switch (chartType) {
                        case "MAP_PINS":
                            this.loadWidget("src/map/Pins", function (widget) {
                                try {
                                    widget
                                        .id(visualization.id)
                                        .columns(context.source.getColumns())
                                        .geohashColumn("geohash")
                                        .tooltipColumn("label")
                                        .fillColor((<IChoroVisualization>visualization).color ? (<IChoroVisualization>visualization).color : null)
                                        .projection("albersUsaPr")
                                        ;
                                } catch (e) {
                                    console.log("Unexpected widget type:  " + widget.classID());
                                }
                            });
                            break;
                    }
                } else {
                    chartType = chartType || "CHORO";
                    if (chartType === "CHORO") {
                        if (this.source.mappings.contains("state")) {
                            chartType = "CHORO_USSTATES";
                        } else if (this.source.mappings.contains("county")) {
                            chartType = "CHORO_USCOUNTIES";
                        } else if (this.source.mappings.contains("country")) {
                            chartType = "CHORO_COUNTRIES";
                        }
                    }
                    Promise.all(context.layers.map(function (layer) { return layer.loadedPromise(); })).then(function () {
                        context.loadWidget("src/composite/MegaChart", function (widget) {
                            var layers = context.layers.map(function (layer) { return layer.widget; });
                            try {
                                switch (widget.classID()) {
                                    case "composite_MegaChart":
                                        widget
                                            .id(visualization.id)
                                            .showChartSelect_default(false)
                                            .chartType_default(chartType)
                                            .chartTypeDefaults({
                                                autoScaleMode: layers.length ? "data" : "mesh"
                                            })
                                            .chartTypeProperties({
                                                layers: layers
                                            })
                                            ;
                                        break;
                                    default:
                                        widget
                                            .id(visualization.id)
                                            .autoScaleMode(layers.length ? "data" : "mesh")
                                            .layers(layers)
                                            ;
                                        break;
                                }
                            } catch (e) {
                                console.log("Unexpected widget type:  " + widget.classID());
                            }
                        });
                    });
                }
                break;
            case "2DCHART":
            case "PIE":
            case "BUBBLE":
            case "BAR":
            case "WORD_CLOUD":
                this.loadWidget("src/composite/MegaChart", function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            .chartType_default(context.properties.chartType || context.properties.charttype || context.type)
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            case "LINE":
                this.loadWidget("src/composite/MegaChart", function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            .chartType_default(context.properties.chartType || context.properties.charttype || context.type)
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            case "TABLE":
                this.loadWidget("src/composite/MegaChart", function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            .showChartSelect_default(false)
                            .chartType_default("TABLE")
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            case "SLIDER":
                this.loadWidget("src/form/Slider", function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            ;
                        if ((<ISliderVisualization>visualization).range) {
                            var selectionLabel = "";
                            for (var key in visualization.source.mappings) {
                                selectionLabel = key;
                                break;
                            }
                            widget
                                .low_default(+(<ISliderVisualization>visualization).range[0])
                                .high_default(+(<ISliderVisualization>visualization).range[1])
                                .step_default(+(<ISliderVisualization>visualization).range[2])
                                .selectionLabel_default(selectionLabel)
                                ;
                        }
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            case "GRAPH":
                this.loadWidgets(["src/graph/Graph"], function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            .layout_default("ForceDirected2")
                            .applyScaleOnLayout_default(true)
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            case "FORM":
                this.loadWidgets(["src/form/Form", "src/form/Input", "src/form/Button", "src/form/CheckBox", "src/form/ColorInput", "src/form/Radio", "src/form/Range", "src/form/Select", "src/form/Slider", "src/form/TextArea", "src/form/InputRange"], function (widget, widgetClasses) {
                    var Input = widgetClasses[1];
                    var CheckBox = widgetClasses[3];
                    var Radio = widgetClasses[5];
                    var Select = widgetClasses[7];
                    var TextArea = widgetClasses[9];
                    var InputRange = widgetClasses[10];

                    try {
                        widget
                            .id(visualization.id)
                            .inputs(visualization.fields.map(function (field) {

                                var selectOptions = [];
                                var options = [];
                                var inp;
                                switch (field.properties.charttype) {
                                    case "TEXT":
                                        inp = new Input()
                                            .type_default("text")
                                            ;
                                        break;
                                    case "TEXTAREA":
                                        inp = new TextArea();
                                        break;
                                    case "CHECKBOX":
                                        inp = new CheckBox();
                                        break;
                                    case "RADIO":
                                        inp = new Radio();
                                        break;
                                    case "HIDDEN":
                                        inp = new Input()
                                            .type_default("hidden")
                                            ;
                                        break;
                                    case "RANGE":
                                        inp = new InputRange();
                                        break;
                                    default:
                                        if (field.properties.enumvals) {
                                            inp = new Select();
                                            options = field.properties.enumvals;
                                            for (var val in options) {
                                                selectOptions.push([val, options[val]]);
                                            }
                                        } else {
                                            inp = new Input()
                                                .type_default("text")
                                                ;
                                        }
                                        break;
                                }

                                inp
                                    .name_default(field.id)
                                    .label_default((field.properties ? field.properties.label : null) || field.label)
                                    .value_default(field.properties.default ? field.properties.default : "") // TODO Hippie support for multiple default values (checkbox only)
                                    ;

                                if (inp instanceof CheckBox || inp instanceof Radio) { // change this to instanceof?
                                    var vals = Object.keys(field.properties.enumvals);
                                    inp.selectOptions_default(vals);
                                } else if (selectOptions.length) {
                                    inp.selectOptions_default(selectOptions);
                                }

                                return inp;
                            }))
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            case "HEAT_MAP":
                this.loadWidgets(["src/other/HeatMap"], function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            .image_default(context.properties.imageUrl)
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
            default:
                this.loadWidget("src/common/TextBox", function (widget) {
                    try {
                        widget
                            .id(visualization.id)
                            .text_default(context.id + "\n" + "TODO:  " + context.type)
                            ;
                    } catch (e) {
                        console.log("Unexpected widget type:  " + widget.classID());
                    }
                });
                break;
        }
    }

    getQualifiedID() {
        return this.id;
    }

    loadedPromise() {
        var context = this;
        return new Promise(function (resolve, reject) {
            var intervalHandle = setInterval(function () {
                if (context.isLoaded()) {
                    clearInterval(intervalHandle);
                    resolve();
                }
            }, 100);
        });
    }

    isLoading() {
        return this.widget === null;
    }

    isLoaded() {
        return this.widget instanceof Widget;
    }


    loadMegaChartWidget(widgetPath, callback) {
        this.loadWidgets(["src/composite/MegaChart", widgetPath], function (megaChart, widgets) {
            var chart = new widgets[1]();
            megaChart
                .chartType_default(MultiChart.prototype._allChartTypesByClass[chart.classID()].id)
                .chart(chart)
                ;
            if (callback) {
                callback(megaChart, chart, widgets);
            }
        });
    }

    loadWidget(widgetPath, callback) {
        this.loadWidgets([widgetPath], callback);
    }


    loadWidgets(widgetPaths, callback) {
        this.widget = null;

        var context = this;
        es6Require(widgetPaths, function (Widget) {
            var existingWidget = context.dashboard.marshaller.getWidget(context.id);
            if (existingWidget) {
                if (Widget.prototype._class !== existingWidget.classID()) {
                    console.log("Unexpected persisted widget type (old persist string?)");
                }
                context.setWidget(existingWidget);
            } else {
                context.setWidget(new Widget());
            }
            if (callback) {
                callback(context.widget, arguments);
            }
        });
    }

    setWidget(widget) {
        this.widget = widget;
        this.events.setWidget(widget);
        if (this.widget.columns) {
            var columns = this.source.getColumns();
            this.widget.columns(columns, true);
        }
        for (var key in this.properties) {
            switch (widget.classID()) {
                case "chart_MultiChart":
                case "composite_MegaChart":
                    if (widget[key + "_default"]) {
                        widget[key + "_default"](this.properties[key]);
                    }
                    widget.chartTypeDefaults()[key] = this.properties[key];
                    break;
                default:
                    if (this.widget[key + "_default"]) {
                        try {
                            this.widget[key + "_default"](this.properties[key]);
                        } catch (e) {
                            console.log("Invalid Property:" + this.id + ".properties." + key);
                        }
                    }
            }
        }
        return this.widget;
    }

    accept(visitor) {
        visitor.visit(this);
    }

    getUpdates() {
        return this.events.getUpdates();
    }

    getUpdatesForDatasource(otherDatasource) {
        return this.events.getUpdates().filter(function (updateObj) {
            return updateObj.getDatasource() === otherDatasource;
        });
    }

    getUpdatesForVisualization(otherViz) {
        return this.events.getUpdates().filter(function (updateObj) {
            return updateObj.getVisualization() === otherViz;
        });
    }

    update(params?) {
        if (!params) {
            var paramsArr = [];
            var dedupParams = {};
            var updatedBy = this.getInputVisualizations();
            updatedBy.forEach(function (viz) {
                if (viz.hasSelection()) {
                    viz.getUpdatesForVisualization(this).forEach(function (updateObj) {
                        var mappedData = updateObj.mapSelected();
                        for (var key in mappedData) {
                            if (mappedData[key]) {
                                if (!dedupParams[key]) {
                                    dedupParams[key] = true;
                                    paramsArr.push(mappedData[key]);
                                }
                            }
                        }
                    });
                }
            }, this);
            params = paramsArr.join(", ");
        }

        var titleWidget = null;
        if (!this.parentVisualization) {
            titleWidget = this.widget;
            while (titleWidget && !titleWidget.title) {
                titleWidget = titleWidget.locateParentWidget();
            }
        }

        var context = this;
        return new Promise(function (resolve, reject) {
            if (titleWidget) {
                var title = titleWidget.title();
                var titleParts = title.split(" (");
                titleWidget
                    .title(titleParts[0] + (params ? " (" + params + ")" : ""))
                    .render(function () {
                        resolve();
                    })
                    ;
            } else {
                var ddlViz: Visualization = context;
                while (ddlViz.parentVisualization) {
                    ddlViz = ddlViz.parentVisualization;
                }
                ddlViz.widget.render(function () {
                    resolve();
                });
            }
            if (context.dashboard.marshaller.propogateClear()) {
                context.events.getUpdatesVisualizations().forEach(function (updatedViz) {
                    updatedViz.update();
                });
            }
        });
    }

    notify() {
        if (this.widget) {
            var data = this.source.hasData() ? this.source.getData() : [];
            this.widget.data(data);
            return this.update();
        }
        return Promise.resolve();
    }

    clear() {
        this._widgetState = {
            row: {},
            selected: false
        };
        this.fields.forEach(function (field) {
            if (field.properties && field.properties.default !== undefined) {
                this._widgetState.row[field.id] = field.properties.default;
                this._widgetState.selected = true;
            }
        }, this);
        if (this.widget && this.dashboard.marshaller.clearDataOnUpdate()) {
            this.widget.data([]);
        }
        if (this.dashboard.marshaller.propogateClear()) {
            this.events.getUpdatesVisualizations().forEach(function (updatedViz) {
                updatedViz.clear();
            });
        }
    }

    on(eventID, func) {
        var context = this;
        this.overrideMethod(eventID, function (origFunc, args) {
            origFunc.apply(context, args);
            setTimeout(function () {
                func.apply(context, args);
            }, 0);
        });
        return this;
    }

    calcRequestFor(visualization): any {
        var retVal = {};
        this.getUpdatesForVisualization(visualization).forEach(function (updatesObj) {
            //  TODO:  When we support more than "click" this will need enhancment...
            retVal = updatesObj.calcRequestFor(visualization);
        });
        return retVal;
    }

    processEvent(eventID, event, row, col, selected) {
        this._widgetState = {
            row: row,
            col: col,
            selected: selected === undefined ? true : selected
        };
        var context = this;
        setTimeout(function () {
            event.fetchData().then(function (promises) {
                context.dashboard.marshaller.vizEvent(context.widget, "post_" + eventID, row, col, selected);
            });
        }, 0);
    }

    hasSelection() {
        return this._widgetState && this._widgetState.selected;
    }

    selection() {
        if (this.hasSelection()) {
            return this._widgetState.row;
        }
        return null;
    }

    reverseMappedSelection() {
        if (this.hasSelection()) {
            return this.source.mappings ? this.source.mappings.doReverseMap(this._widgetState.row) : this._widgetState.row;
        }
        return null;
    }

    getInputVisualizations() {
        return this.dashboard.marshaller.getVisualizationArray().filter(function (viz) {
            var updates = viz.events.getUpdatesVisualizations();
            if (updates.indexOf(this) >= 0) {
                return true;
            }
            return false;
        }, this);
    }

    serializeState() {
        var state: any = {
            widgetState: this._widgetState
        };
        if (this.widget) {
            if ((<any>this.widget).serializeState) {
                state.widget = (<any>this.widget).serializeState();
            } else if (this.widget.data) {
                state.widget = {
                    data: this.widget.data()
                };
            }
        }
        return state;
    }

    deserializeState(state) {
        if (state) {
            this._widgetState = state.widgetState;
            if (this.widget && state.widget) {
                if ((<any>this.widget).deserializeState) {
                    (<any>this.widget).deserializeState(state.widget);
                } else if (this.widget.data && state.widget.data) {
                    this.widget.data(state.widget.data);
                }
            }
        }
        return this;
    }

    toDDL(): IAnyVisualization {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            properties: this.properties,
            events: this.events.toDDL(),
            source: (<any>this.source.toDDL()), //TODO
            fields: this.fields
        };
    }
}

//  Output  ---
export class Output {
    id: string;
    from: string;
    notify: string[];
    filter: string[];

    datasource: Datasource;
    db: Grid;

    constructor(datasource: Datasource, output: IOutput) {
        this.datasource = datasource;
        this.id = output.id;
        this.from = output.from;
        this.notify = output.notify || [];
        this.filter = output.filter || [];
    }

    getQualifiedID() {
        return this.datasource.getQualifiedID() + "." + this.id;
    }

    getUpdatesVisualizations() {
        var retVal = [];
        this.notify.forEach(function (item) {
            retVal.push(this.datasource.dashboard.getVisualization(item));
        }, this);
        return retVal;
    }

    accept(visitor) {
        visitor.visit(this);
    }

    vizNotify(updates) {
        var promises = [];
        this.notify.filter(function (item) {
            return !updates || updates.indexOf(item) >= 0;
        }).forEach(function (item) {
            var viz = this.datasource.dashboard.getVisualization(item);
            promises.push(viz.notify());
        }, this);
        return Promise.all(promises);
    }

    setData(data, updates) {
        this.db = new Grid().jsonObj(data);
        return this.vizNotify(updates);
    }

    toDDL(): IOutput {
        return {
            id: this.id,
            from: this.from,
            filter: this.filter,
            notify: this.notify
        };
    }
}

//  FetchData Optimizers  ---
class DatasourceRequestOptimizer {
    datasourceRequests;
    constructor() {
        this.datasourceRequests = {
        };
    }

    appendRequest(updateDatasource, request, updateVisualization) {
        var datasourceRequestID = updateDatasource.id + "(" + JSON.stringify(request) + ")";
        if (!this.datasourceRequests[datasourceRequestID]) {
            this.datasourceRequests[datasourceRequestID] = {
                updateDatasource: updateDatasource,
                request: request,
                updates: []
            };
        } else if ((window as any).__hpcc_debug) {
            console.log("Optimized duplicate fetch:  " + datasourceRequestID);
        }
        var datasourceOptimizedItem = this.datasourceRequests[datasourceRequestID];
        if (datasourceOptimizedItem.updates.indexOf(updateVisualization.id) < 0) {
            datasourceOptimizedItem.updates.push(updateVisualization.id);
        }
    }

    fetchData() {
        var promises = [];
        for (var key in this.datasourceRequests) {
            var item = this.datasourceRequests[key];
            promises.push(item.updateDatasource.fetchData(item.request, item.updates));
        }
        return Promise.all(promises);
    }
}

class VisualizationRequestOptimizer {
    skipClear;
    visualizationRequests;
    constructor(skipClear?) {
        this.skipClear = skipClear;
        this.visualizationRequests = {
        };
    }

    appendRequest(updateDatasource, request, updateVisualization) {
        if (updateDatasource && updateVisualization) {
            var visualizationRequestID = updateVisualization.id + "(" + updateDatasource.id + ")";
            if (!this.visualizationRequests[visualizationRequestID]) {
                this.visualizationRequests[visualizationRequestID] = {
                    updateVisualization: updateVisualization,
                    updateDatasource: updateDatasource,
                    request: {}
                };
            } else if ((window as any).__hpcc_debug) {
                console.log("Optimized duplicate fetch:  " + visualizationRequestID);
            }
            var visualizationOptimizedItem = this.visualizationRequests[visualizationRequestID];
            mixin(visualizationOptimizedItem.request, request);
        }
    }

    fetchData() {
        var datasourceRequestOptimizer = new DatasourceRequestOptimizer();
        for (var key in this.visualizationRequests) {
            var item = this.visualizationRequests[key];
            if (!this.skipClear && item.updateVisualization.type !== "GRAPH") {
                item.updateVisualization.clear();
            }
            item.updateVisualization.update(LOADING);
            datasourceRequestOptimizer.appendRequest(item.updateDatasource, item.request, item.updateVisualization);
        }
        return datasourceRequestOptimizer.fetchData();
    }
}

//  Datasource  ---
export class Datasource {
    id: string;
    databomb: boolean;
    filter: string[];

    dashboard;
    WUID;
    URL;
    private _loadedCount = 0;
    _outputs: { [key: string]: Output } = {};
    _outputArray: Output[] = [];
    comms;
    db;

    constructor(dashboard, datasource: IDatasource, proxyMappings, timeout) {
        this.dashboard = dashboard;
        this.id = datasource.id;
        this.filter = datasource.filter || [];
        this.WUID = datasource.WUID;
        this.URL = dashboard.marshaller.espUrl && dashboard.marshaller.espUrl._url ? dashboard.marshaller.espUrl._url : datasource.URL;
        this.databomb = datasource.databomb;

        var context = this;
        var hipieResults = [];
        datasource.outputs.forEach(function (item) {
            context._outputs[item.id] = new Output(context, item);
            context._outputArray.push(context._outputs[item.id]);
            hipieResults.push({
                id: item.id,
                from: item.from,
                filter: item.filter || this.filter
            });
        }, this);

        if (this.WUID) {
            this.comms = new HIPIEWorkunit()
                .url(this.URL)
                .proxyMappings(proxyMappings)
                .timeout(timeout)
                .hipieResults(hipieResults)
                ;
        } else if (this.databomb) {
            this.comms = new HIPIEDatabomb()
                .hipieResults(hipieResults)
                ;
        } else {
            this.comms = new HIPIERoxie()
                .url(datasource.URL)
                .proxyMappings(proxyMappings)
                .timeout(timeout)
                ;
        }
    }

    getQualifiedID() {
        return this.dashboard.getQualifiedID() + "." + this.id;
    }

    getOutputs() {
        return this._outputs;
    }

    getUpdatesVisualizations() {
        var retVal = [];
        for (var key in this._outputs) {
            this._outputs[key].getUpdatesVisualizations().forEach(function (visualization) {
                retVal.push(visualization);
            });
        }
        return retVal;
    }

    accept(visitor) {
        visitor.visit(this);
        for (var key in this._outputs) {
            this._outputs[key].accept(visitor);
        }
    }

    static transactionID = 0;
    static transactionQueue = [];
    fetchData(request, updates) {
        var myTransactionID = ++Datasource.transactionID;
        Datasource.transactionQueue.push(myTransactionID);

        var dsRequest: any = {};
        this.filter.forEach(function (item) {
            dsRequest[item + _CHANGED] = request[item + _CHANGED] || false;
            var value = request[item] === undefined ? null : request[item];
            if (dsRequest[item] !== value) {
                dsRequest[item] = value;
            }
        });
        dsRequest.refresh = request.refresh || false;
        if ((window as any).__hpcc_debug) {
            console.log("fetchData:  " + JSON.stringify(updates) + "(" + JSON.stringify(request) + ")");
        }
        for (var key in dsRequest) {
            if (dsRequest[key] === null) {
                delete dsRequest[key];
            }
        }
        var now = Date.now();
        this.dashboard.marshaller.commsEvent(this, "request", dsRequest);
        var context = this;
        return new Promise(function (resolve, reject) {
            context.comms.call(dsRequest).then(function (_response) {
                var response = JSON.parse(JSON.stringify(_response));
                var intervalHandle = setInterval(function () {
                    if (Datasource.transactionQueue[0] === myTransactionID && Date.now() - now >= 500) {  //  500 is to allow for all "clear" transitions to complete...
                        clearTimeout(intervalHandle);
                        context.processResponse(response, request, updates).then(function () {
                            Datasource.transactionQueue.shift();
                            resolve(response);
                            context.dashboard.marshaller.commsEvent(context, "response", dsRequest, response);
                            ++context._loadedCount;
                        });
                    }
                }, 100);
            }).catch(function (e) {
                context.dashboard.marshaller.commsEvent(context, "error", dsRequest, e);
                reject(e);
            });
        });
    }

    processResponse(response, request, updates) {
        var lowerResponse = {};
        for (var responseKey in response) {
            lowerResponse[responseKey.toLowerCase()] = response[responseKey];
        }
        var promises = [];
        for (var key in this._outputs) {
            var from = this._outputs[key].from;
            if (!from) {
                //  Temp workaround for older services  ---
                from = this._outputs[key].id.toLowerCase();
            }
            if (exists(from, response)) {
                if (!exists(from + _CHANGED, response) || (exists(from + _CHANGED, response) && response[from + _CHANGED].length && response[from + _CHANGED][0][from + _CHANGED])) {
                    promises.push(this._outputs[key].setData(response[from], updates));
                } else {
                    //  TODO - I Suspect there is a HIPIE/Roxie issue here (empty request)
                    promises.push(this._outputs[key].vizNotify(updates));
                }
            } else if (exists(from, lowerResponse)) {
                console.log("DDL 'Datasource.From' case is Incorrect");
                if (!exists(from + _CHANGED, lowerResponse) || (exists(from + _CHANGED, lowerResponse) && response[from + _CHANGED].length && lowerResponse[from + _CHANGED][0][from + _CHANGED])) {
                    promises.push(this._outputs[key].setData(lowerResponse[from], updates));
                } else {
                    //  TODO - I Suspect there is a HIPIE/Roxie issue here (empty request)
                    promises.push(this._outputs[key].vizNotify(updates));
                }
            } else {
                var responseItems = [];
                for (var responseKey2 in response) {
                    responseItems.push(responseKey2);
                }
                console.log("Unable to locate '" + from + "' in response {" + responseItems.join(", ") + "}");
            }
        }
        return Promise.all(promises);
    }

    isLoaded(): boolean {
        return this._loadedCount > 0;
    }

    isRoxie() {
        return !this.WUID && !this.databomb;
    }

    serializeState() {
        return {
        };
    }

    deserializeState(state) {
        if (!state) return;
    }

    toDDL(): IDatasource {
        return {
            id: this.id,
            databomb: this.databomb,
            WUID: this.WUID,
            URL: this.URL,
            filter: this.filter,
            outputs: this._outputArray.map((output) => {
                return output.toDDL();
            })
        };
    }
}

//  Dashboard  ---
export class Dashboard {
    marshaller: Marshaller;
    id: string;
    title: string;

    private _datasources: { [key: string]: Datasource } = {};
    private _datasourceArray: Datasource[] = [];
    private _datasourceTotal: number = 0;
    private _visualizations: { [key: string]: Visualization } = {};
    private _visualizationArray: Visualization[] = [];
    private _visualizationTotal: number = 0;

    constructor(marshaller, dashboard: IDashboard, proxyMappings, timeout?) {
        this.marshaller = marshaller;
        this.id = dashboard.id;
        this.title = dashboard.title;

        var context = this;
        this._datasources = {};
        this._datasourceTotal = 0;
        dashboard.datasources.forEach((item) => {
            this.createDatasource(item, proxyMappings, timeout);
        });
        this._datasourceTotal = this._datasourceArray.length;

        this._visualizations = {};
        this._visualizationArray = [];
        dashboard.visualizations.forEach((item) => {
            this.createVisualization(item);
        });
        this._visualizationTotal = this._visualizationArray.length;
    }

    createDatasource(ddlDatasource, proxyMappings, timeout?) {
        var retVal = new Datasource(this, ddlDatasource, proxyMappings, timeout);
        this._datasources[ddlDatasource.id] = retVal;
        this._datasourceArray.push(retVal);
        this.marshaller.appendDataSource(retVal);
        return retVal;
    }

    createVisualization(ddlVisualization: IAnyVisualization, parentVisualization?) {
        var retVal = new Visualization(this, ddlVisualization, parentVisualization);
        this._visualizations[ddlVisualization.id] = retVal;
        this._visualizationArray.push(retVal);
        this.marshaller.appendVisualization(retVal);
        return retVal;
    }

    loadedPromise() {
        return Promise.all(this._visualizationArray.map(function (visualization) { return visualization.loadedPromise(); }));
    }

    getQualifiedID() {
        return this.id;
    }

    getDataSources() {
        return this._datasources;
    }

    getDataSourceArray() {
        return this._datasourceArray;
    }

    getDataSource(id): Datasource {
        return this._datasources[id];
    }

    getVisualization(id) {
        return this._visualizations[id] || this.marshaller.getVisualization(id);
    }

    getVisualizations() {
        return this._visualizations;
    }

    getVisualizationArray() {
        return this._visualizationArray;
    }

    getVisualizationTotal() {
        return this._visualizationTotal;
    }

    accept(visitor) {
        visitor.visit(this);
        for (var key in this._datasources) {
            this._datasources[key].accept(visitor);
        }
        this._visualizationArray.forEach(function (item) {
            item.accept(visitor);
        }, this);
    }

    primeData(state) {
        var fetchDataOptimizer = new VisualizationRequestOptimizer(true);
        this.getVisualizationArray().forEach(function (visualization) {
            //  Clear all charts back to their default values ---
            visualization.clear();
            visualization.update();
            if (state && state[visualization.id]) {
                if (exists("source.mappings.mappings", visualization)) {
                    for (var key in visualization.source.mappings.mappings) {
                        if (state[visualization.id][visualization.source.mappings.mappings[key]]) {
                            visualization._widgetState.row[key] = state[visualization.id][visualization.source.mappings.mappings[key]];
                            visualization._widgetState.selected = true;
                        }
                    }
                }
            }
        });
        this.getVisualizationArray().forEach(function (visualization) {
            var inputVisualizations = visualization.getInputVisualizations();
            var datasource = visualization.source.getDatasource();
            var hasInputSelection = false;
            inputVisualizations.forEach(function (inViz) {
                if (inViz.hasSelection()) {
                    var request = inViz.calcRequestFor(visualization);
                    request.refresh = true;
                    fetchDataOptimizer.appendRequest(datasource, request, visualization);
                    hasInputSelection = true;
                }
            });
            if (!hasInputSelection && ((datasource && datasource.isRoxie()) || inputVisualizations.length === 0)) {
                fetchDataOptimizer.appendRequest(datasource, { refresh: true }, visualization);
            }
        });
        return fetchDataOptimizer.fetchData();
    }

    serializeState() {
        var retVal = {
            datasources: {},
            visualizations: {}
        };
        for (var key in this._datasources) {
            retVal.datasources[key] = this._datasources[key].serializeState();
        }
        for (var vizKey in this._visualizations) {
            retVal.visualizations[vizKey] = this._visualizations[vizKey].serializeState();
        }
        return retVal;
    }

    deserializeState(state) {
        if (!state) return;
        for (var key in this._datasources) {
            if (state.datasources[key]) {
                this._datasources[key].deserializeState(state.datasources[key]);
            }
        }
        for (var vizKey in this._visualizations) {
            if (state.visualizations[vizKey]) {
                this._visualizations[vizKey].deserializeState(state.visualizations[vizKey]);
            }
        }
    }

    toDDL(): IDashboard {
        return null;
        /*
        return {
            id: this.id,
            title: this.title,
            visualizations: this._visualizationArray.map((visualization) => {
                return visualization.toDDL();
            }),
            datasources: this._datasourceArray.map((datasource) => {
                return datasource.toDDL();
            })

        };
        */
    }
}

//  Marshaller  ---
export class Marshaller extends Class {
    private _proxyMappings: any = {};
    private _widgetMappings: { [key: string]: Widget } = {};
    private _clearDataOnUpdate: boolean = true;
    private _propogateClear: boolean = false;
    private id: string = "Marshaller";
    private _missingDataString: string = "";
    dashboards: { [key: string]: Dashboard } = {};
    dashboardArray: Dashboard[] = [];
    dashboardTotal: number;

    private _json: string;
    private _jsonParsed: any;
    espUrl: ESPUrl;
    private _timeout: number;

    private _datasources: { [key: string]: Datasource } = {};
    private _datasourceArray: Datasource[] = [];
    private _visualizations: { [key: string]: Visualization } = {};
    private _visualizationArray: Visualization[] = [];

    constructor() {
        super();
    }

    commsDataLoaded() {
        for (var i = 0; i < this.dashboardArray.length; i++) {
            for (var ds in this.dashboardArray[i].getDataSources()) {
                if (!this.dashboardArray[i].getDataSource(ds).isLoaded()) {
                    return false;
                }
            }
        }
        return true;
    }

    getVisualization(id) {
        return this._visualizations[id];
    }

    accept(visitor) {
        visitor.visit(this);
        this.dashboardTotal = 0;
        for (var key in this.dashboards) {
            this.dashboards[key].accept(visitor);
            ++this.dashboardTotal;
        }
    }

    url(url, callback) {
        this.espUrl = new ESPUrl()
            .url(url)
            ;
        var transport = null;
        var hipieResultName = "HIPIE_DDL";
        if (this.espUrl.isWorkunitResult()) {
            hipieResultName = this.espUrl.param("ResultName");
            transport = new HIPIEWorkunit()
                .url(url)
                .proxyMappings(this._proxyMappings)
                .timeout(this._timeout)
                ;
        } else {
            transport = new HIPIERoxie()
                .url(url)
                .proxyMappings(this._proxyMappings)
                .timeout(this._timeout)
                ;
        }

        var context = this;
        transport.fetchResults().then(function (response) {
            if (exists(hipieResultName, response)) {
                return transport.fetchResult(hipieResultName).then(function (ddlResponse) {
                    var json = ddlResponse[0][hipieResultName];
                    context.parse(json, function () {
                        callback(response);
                    });
                }).catch(function (e) {
                    context.commsEvent(context, "error", hipieResultName, e);
                });
            }
        }).catch(function (e) {
            context.commsEvent(context, "error", "fetchResults", e);
        });
    }

    proxyMappings(_?): any | this {
        if (!arguments.length) return this._proxyMappings;
        this._proxyMappings = _;
        return this;
    }

    timeout(_?): number | this {
        if (!arguments.length) return this._timeout;
        this._timeout = _;
        return this;
    }

    widgetMappings(_?): any | this {
        if (!arguments.length) return this._widgetMappings;
        this._widgetMappings = _;
        return this;
    }

    clearDataOnUpdate(_?): boolean | this {
        if (!arguments.length) return this._clearDataOnUpdate;
        this._clearDataOnUpdate = _;
        return this;
    }

    propogateClear(_?): boolean | this {
        if (!arguments.length) return this._propogateClear;
        this._propogateClear = _;
        return this;
    }

    missingDataString(_?): string | this {
        if (!arguments.length) return this._missingDataString;
        this._missingDataString = _;
        return this;
    }

    testJSON(parseJson) {
        require(["ajv", "json!src/marshaller/DDLSchema.json"], (Ajv, DDLSchema) => {
            var ajv = new Ajv();
            var validate = ajv.compile(DDLSchema);
            var valid = validate(parseJson);
            if (!valid) {
                console.log(validate.errors);
            }
        });
    }

    parse(json, callback) {
        var context = this;
        this._json = json;
        this._jsonParsed = JSON.parse(this._json);
        this.testJSON(this._jsonParsed);
        this.dashboards = {};
        this.dashboardArray = [];
        this._visualizations = {};
        this._visualizationArray = [];
        this._jsonParsed.forEach(function (item) {
            var newDashboard = new Dashboard(context, item, context._proxyMappings);
            context.dashboards[item.id] = newDashboard;
            context.dashboardArray.push(newDashboard);
        });
        this.dashboardTotal = this.dashboardArray.length;
        this._visualizationArray.forEach(function (ddlViz) {
            ddlViz.on("processEvent", function (eventID, event, row, col, selected) {
                context.vizEvent(ddlViz.widget, eventID, row, col, selected);
            });
        });
        this.ready(callback);
        let debug = this.toDDL();
        return this;
    }

    toDDL(): IDashboard[] {
        return this.dashboardArray.map((dashboard) => {
            return dashboard.toDDL();
        });
    }

    dashboardsLoaded() {
        return Promise.all(this.dashboardArray.map(function (dashboard) { return dashboard.loadedPromise(); }));
    }

    appendDataSource(datasource: Datasource) {
        this._datasources[datasource.id] = datasource;
        this._datasourceArray.push(datasource);
    }

    getDataSources() {
        return this._datasources;
    }

    getDataSourceArray() {
        return this._datasourceArray;
    }

    appendVisualization(visualization: Visualization) {
        this._visualizations[visualization.id] = visualization;
        this._visualizationArray.push(visualization);
    }

    getVisualizations() {
        return this._visualizations;
    }

    getVisualizationArray() {
        return this._visualizationArray;
    }

    getWidget(id): Widget {
        return this._widgetMappings[id];
    }

    on(eventID, func) {
        var context = this;
        this.overrideMethod(eventID, function (origFunc, args) {
            var retVal = origFunc.apply(context, args);
            return func.apply(context, args) || retVal;
        });
        return this;
    }

    ready(callback) {
        if (!callback) {
            return;
        }
        this.dashboardsLoaded().then(function () {
            callback();
        });
    }

    vizEvent(sourceWidget, eventID, row, col, selected) {
        console.log("Marshaller.vizEvent:  " + sourceWidget.id() + "-" + eventID);
    }

    commsEvent(ddlSource, eventID, request, response) {
        switch (eventID) {
            case "request":
                if ((window as any).__hpcc_debug) {
                    console.log("Marshaller.commsEvent:  " + ddlSource.id + "-" + eventID + ":  " + JSON.stringify(request));
                }
                break;
            case "response":
            case "error":
                if ((window as any).__hpcc_debug) {
                    console.log("Marshaller.commsEvent:  " + ddlSource.id + "-" + eventID + ":  " + JSON.stringify(response));
                }
                break;
            default:
                if ((window as any).__hpcc_debug) {
                    console.log("Marshaller.commsEvent:  " + JSON.stringify(arguments));
                }
                break;

        }
    }

    createDatabomb() {
        var retVal = {};
        this.dashboardArray.forEach(function (dashboard) {
            for (var key in dashboard.getDataSources()) {
                var comms = dashboard.getDataSource(key).comms;
                retVal[key] = {};
                for (var key2 in comms._hipieResults) {
                    var hipieResult = comms._hipieResults[key2];
                    retVal[key][key2] = comms._resultNameCache[hipieResult.from];
                }
            }
        });
        return retVal;
    }

    primeData(state) {
        var promises = this.dashboardArray.map(function (dashboard) {
            return dashboard.primeData(state);
        });
        return Promise.all(promises);
    }

    serializeState() {
        var retVal = {};
        this.dashboardArray.forEach(function (dashboard, idx) {
            retVal[dashboard.id] = dashboard.serializeState();
        });
        return retVal;
    }

    deserializeState(state) {
        if (!state) return;
        this.dashboardArray.forEach(function (dashboard, idx) {
            dashboard.deserializeState(state[dashboard.id]);
        });
        return this;
    }
}
