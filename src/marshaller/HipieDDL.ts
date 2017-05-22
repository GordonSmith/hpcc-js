import { map as d3Map } from "d3-collection";
import { MultiChart } from "../chart/MultiChart";
import { Class } from "../common/Class";
import * as Database from "../common/Database";
import * as Utility from "../common/Utility";
import { Widget } from "../common/Widget";
import { Table as DGridTable } from "../dgrid/Table";
import * as Comms from "../other/Comms";
import { Table } from "../other/Table";

const LOADING = "...loading...";
const _CHANGED = "_changed";

function faCharFix(faChar) {
    if (faChar) {
        return String.fromCharCode(parseInt(faChar));
    }
    return faChar;
}

//  Mappings ---
function SourceMappings(visualization, mappings) {
    this.visualization = visualization;
    const newMappings = {};
    for (const key in mappings) {
        if (mappings[key] instanceof Array) {
            mappings[key].forEach(function (mapingItem, idx) {
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

SourceMappings.prototype.init = function () {
    for (const key in this.mappings) {
        this.reverseMappings[this.mappings[key]] = key;
        if (this.columnsIdx[key] === undefined) {
            this.columns.push(key);
            this.columnsIdx[key] = this.columns.length - 1;
        }
        this.columnsRHS[this.columnsIdx[key]] = this.mappings[key];
        this.columnsRHSIdx[this.mappings[key]] = this.columnsIdx[key];
        this.hasMappings = true;
    }
};

function hipieType2DBType(hipieType) {
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

SourceMappings.prototype.getFields = function () {
    if (this.visualization.fields) {
        return Object.keys(this.mappings).map(function (key) {
            return this.visualization.fields.filter(function (field) {
                return field.id === this.mappings[key];
            }, this).map(function (field) {
                return new Database.Field(field.id)
                    .type(hipieType2DBType(field.properties.type))
                    .label(this.reverseMappings[field.id])
                    ;
            }, this)[0];
        }, this);
    }
    return null;
};

SourceMappings.prototype.contains = function (key) {
    return this.mappings[key] !== undefined;
};

SourceMappings.prototype.doMap = function (item) {
    const retVal = [];
    for (const key in this.mappings) {
        const rhsKey = this.mappings[key];
        try {
            let val = item[rhsKey];
            if (val === undefined) {
                val = item[rhsKey.toLowerCase()];
            }
            retVal[this.columnsIdx[key]] = val;
        } catch (e) {
            console.log("Invalid Mapping:  " + this.visualization.id + " [" + rhsKey + "->" + item + "]");
        }
    }
    return retVal;
};

SourceMappings.prototype.doReverseMap = function (item) {
    const retVal = {};
    for (const key in this.mappings) {
        const rhsKey = this.mappings[key];
        try {
            let val = item[key];
            if (val === undefined) {
                val = item[key.toLowerCase()];
            }
            retVal[rhsKey] = val;
        } catch (e) {
            console.log("Invalid Mapping:  " + this.visualization.id + " [" + key + "->" + item + "]");
        }
    }
    return retVal;
};

SourceMappings.prototype.doMapAll = function (data) {
    return data.hipieMappings(this.columnsRHS, this.visualization.dashboard.marshaller.missingDataString());
};

SourceMappings.prototype.getMap = function (key) {
    return this.mappings[key];
};

SourceMappings.prototype.getReverseMap = function (key) {
    return this.reverseMappings[key];
};

function ChartMappings(visualization, mappings) {
    SourceMappings.call(this, visualization, mappings);
    this.columns = ["label", "weight"];
    this.columnsIdx = { label: 0, weight: 1 };
    this.init();
}
ChartMappings.prototype = Object.create(SourceMappings.prototype);

function ChoroMappings(visualization, mappings) {
    SourceMappings.call(this, visualization, mappings);
    if (mappings.state) {
        this.columns = ["state", "weight"];
        this.columnsIdx = { state: 0, weight: 1 };
    } else if (mappings.county) {
        this.columns = ["county", "weight"];
        this.columnsIdx = { county: 0, weight: 1 };
    } else if (mappings.geohash) {
        this.columns = ["geohash", "weight"];
        this.columnsIdx = { geohash: 0, weight: 1 };
    }
    this.init();
}
ChoroMappings.prototype = Object.create(SourceMappings.prototype);

function ChoroMappings2(visualization, mappings) {
    SourceMappings.call(this, visualization, mappings);
    if (mappings.state) {
        this.columns = ["state"];
        this.columnsIdx = { state: 0 };
    } else if (mappings.county) {
        this.columns = ["county"];
        this.columnsIdx = { county: 0 };
    } else if (mappings.geohash) {
        this.columns = ["geohash", "label"];
        this.columnsIdx = { geohash: 0, label: 1 };
    }
    const weightOffset = this.columns.length;
    mappings.weight.forEach(function (w, i) {
        this.columns.push(w);
        this.columnsIdx[i === 0 ? "weight" : "weight_" + i] = i + weightOffset;
    }, this);
    this.init();
}
ChoroMappings2.prototype = Object.create(SourceMappings.prototype);

function HeatMapMappings(visualization, mappings) {
    SourceMappings.call(this, visualization, mappings);
    this.columns = ["x", "y", "weight"];
    this.columnsIdx = { x: 0, y: 1, weight: 2 };
    this.init();
}
HeatMapMappings.prototype = Object.create(SourceMappings.prototype);

function LineMappings(visualization, mappings) {
    const newMappings = {
        label: mappings.x[0]
    };
    mappings.y.forEach(function (item, idx) {
        newMappings[item] = item;
    });
    SourceMappings.call(this, visualization, newMappings);
    this.init();
}
LineMappings.prototype = Object.create(SourceMappings.prototype);

function TableMappings(visualization, mappings) {
    const newMappings = {};
    for (const key in mappings) {
        mappings[key].forEach(function (mapingItem, idx) {
            newMappings[visualization.label[idx]] = mapingItem;
        });
    }
    SourceMappings.call(this, visualization, newMappings);
    this.init();
}
TableMappings.prototype = Object.create(SourceMappings.prototype);

TableMappings.prototype.init = function () {
    this.visualization.label.forEach(function (label, idx) {
        this.reverseMappings[this.mappings[label]] = label;
        this.columns.push(label);
        this.columnsIdx[label] = idx;
        this.columnsRHS[idx] = this.mappings[label];
        this.columnsRHSIdx[this.mappings[label]] = idx;
        this.hasMappings = true;
    }, this);
};

TableMappings.prototype.doMapAll = function (data) {
    let retVal = SourceMappings.prototype.doMapAll.apply(this, arguments);
    if (retVal instanceof Array) {
        const columnsRHSIdx = this.visualization.source.getColumnsRHSIdx();
        this.visualization.fields.forEach(function (field) {
            const fieldType = (!field || !field.properties) ? "unknown" : hipieType2DBType(field.properties.type);
            const colIdx = columnsRHSIdx[field.id];
            if (colIdx === undefined) {
                console.log("Invalid Mapping:  " + field.id);
            } else {
                retVal = retVal.map(function (row) {
                    let cell = row[colIdx];
                    if (cell && cell.Row) {
                        cell = cell.Row;
                    }
                    if (cell instanceof Array) {
                        switch (fieldType) {
                            case "dataset":
                                const columns = [];
                                const columnsIdx = {};
                                const data2 = cell.map(function (row2, idx) {
                                    const retVal2 = [];
                                    retVal2.length = columns.length;
                                    for (const key in row2) {
                                        if (idx === 0) {
                                            columnsIdx[key] = columns.length;
                                            columns.push(key);
                                        }
                                        retVal2[columnsIdx[key]] = row2[key];
                                    }
                                    return retVal2;
                                });
                                const table = new Table()
                                    .columns(columns)
                                    .data(data2)
                                    ;
                                row[colIdx] = table;
                                break;
                            case "widget":
                                const viz = this.visualization.vizDeclarations[field.properties.localVisualizationID];
                                const output = viz.source.getOutput();
                                const db = output.db;
                                output.setData(cell, []);
                                const widget = viz.widget;
                                const newWidget = new widget.constructor()
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
};

function GraphMappings(visualization, mappings, link) {
    SourceMappings.call(this, visualization, mappings);
    this.icon = visualization.icon || {};
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
GraphMappings.prototype = Object.create(SourceMappings.prototype);

GraphMappings.prototype.calcIconInfo = function (field, origItem, forAnnotation) {
    const retVal = {};
    function mapStruct(struct, retVal2) {
        if (struct) {
            for (const key in struct) {
                switch (key) {
                    case "faChar":
                        retVal2.faChar = faCharFix(struct.faChar);
                        break;
                    default:
                        if (forAnnotation && key.indexOf("icon_") === 0) { //  Backward compatability
                            console.log("Deprecated flag property:  " + key);
                            retVal2[key.split("icon_")[1]] = struct[key];
                        } else {
                            retVal2[key] = struct[key];
                        }
                }
            }
        }
    }
    if (origItem && origItem[field.fieldid] && field.valuemappings) {
        const annotationInfo = field.valuemappings[origItem[field.fieldid]];
        mapStruct(annotationInfo, retVal);
    }

    for (const _key in retVal) { // jshint ignore:line
        return retVal;
    }
    return null;
};

GraphMappings.prototype.doMapAll = function (db) {
    const data = db.jsonObj();
    const context = this;
    const vertexMap = {};
    const vertices = [];
    const graph = this.visualization.widget;
    function getVertex(item, origItem?) {
        const id = "uid_" + item[0];
        let retVal = vertexMap[id];
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
            const iconInfo = context.calcIconInfo(context.visualization.icon, origItem, false);
            if (iconInfo) {
                for (const key in iconInfo) {
                    if (retVal[key]) {
                        retVal[key](iconInfo[key]);
                    }
                }
            }

            // Annotations  ---
            const annotations = [];
            context.visualization.flag.forEach(function (field) {
                const iconInfo2 = context.calcIconInfo(field, origItem, true);
                if (iconInfo2) {
                    annotations.push(iconInfo);
                }
            });
            retVal.annotationIcons(annotations);
        }
        return retVal;
    }
    const edges = [];
    data.forEach(function (item) {
        const mappedItem = context.doMap(item);
        getVertex(mappedItem, item);
    });
    data.forEach(function (item) {
        const mappedItem = context.doMap(item);
        const vertex = getVertex(mappedItem, item);
        if (item[context.link.childfile] && item[context.link.childfile] instanceof Array) {
            const childItems = item[context.link.childfile];
            childItems.forEach(function (childItem, i) {
                const childMappedItem = context.linkMappings.doMap(childItem);
                const childVertex = getVertex(childMappedItem);
                if (childVertex && vertex.id() !== childVertex.id()) {
                    const edge = new graph.Edge()
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
    return { vertices, edges, merge: false };
};

//  Viz Source ---
function Source(visualization, source) {
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
                this.mappings = new LineMappings(this.visualization, source.mappings);
                break;
            case "TABLE":
                this.mappings = new TableMappings(this.visualization, source.mappings);
                break;
            case "GRAPH":
                this.mappings = new GraphMappings(this.visualization, source.mappings, source.link);
                break;
            case "CHORO":
                if (source.mappings.weight instanceof Array && source.mappings.weight.length) {
                    this.mappings = new ChoroMappings2(this.visualization, source.mappings);
                    if (source.mappings.weight.length > 1) {
                        this.visualization.type = "LINE";
                    }
                } else {
                    this.mappings = new ChoroMappings(this.visualization, source.mappings);
                }
                break;
            case "HEAT_MAP":
                this.mappings = new HeatMapMappings(this.visualization, source.mappings);
                break;
            default:
                this.mappings = new ChartMappings(this.visualization, source.mappings);
                break;
        }
        this.first = source.first;
        this.reverse = source.reverse;
        this.sort = source.sort;
    }
}

Source.prototype.getQualifiedID = function () {
    return this.visualization.getQualifiedID() + "." + this.id;
};

Source.prototype.exists = function () {
    return this._id;
};

Source.prototype.getDatasource = function () {
    return this.visualization.dashboard.datasources[this._id];
};

Source.prototype.getOutput = function () {
    const datasource = this.getDatasource();
    if (datasource && datasource.outputs) {
        return datasource.outputs[this._output];
    }
    return null;
};

Source.prototype.hasData = function () {
    return this.getOutput().db ? true : false;
};

Source.prototype.getFields = function () {
    return this.mappings.getFields();
};

Source.prototype.getColumnsRHS = function () {
    return this.mappings.columnsRHS;
};

Source.prototype.getColumnsRHSIdx = function () {
    return this.mappings.columnsRHSIdx;
};

Source.prototype.getColumns = function () {
    return this.mappings && this.mappings.columns ? this.mappings.columns : [];
};

Source.prototype.getData = function () {
    const db = this.getOutput().db;
    const dataRef = db.data();
    if (dataRef.length && this.sort) {
        Utility.multiSort(dataRef, db.hipieMapSortArray(this.sort));
    }
    const retVal = this.mappings.doMapAll(db);
    if (this.reverse) {
        retVal.reverse();
    }
    if (this.first && retVal.length > this.first) {
        retVal.length = this.first;
    }
    return retVal;
};

Source.prototype.getXTitle = function () {
    return this.mappings.columns[0];
};

Source.prototype.getYTitle = function () {
    return this.mappings.columns.filter(function (d, i) { return i > 0; }).join(" / ");
};

Source.prototype.getMap = function (col) {
    return (this.mappings && this.mappings.hasMappings) ? this.mappings.getMap(col) : col;
};

Source.prototype.getReverseMap = function (col) {
    return (this.mappings && this.mappings.hasMappings) ? this.mappings.getReverseMap(col) : col;
};

//  Viz Events ---
function EventUpdate(event, update, defMappings) {
    this.event = event;
    this.dashboard = event.visualization.dashboard;
    this._col = update.col;
    this._visualization = update.visualization;
    this._instance = update.instance;
    this._datasource = update.datasource;
    this._merge = update.merge;
    this._mappings = update.mappings || defMappings;
}

EventUpdate.prototype.getDatasource = function () {
    return this.dashboard.getDatasource(this._datasource);
};

EventUpdate.prototype.getVisualization = function () {
    return this.dashboard.getVisualization(this._visualization);
};

EventUpdate.prototype.mapData = function (row) {
    const retVal = {};
    if (row) {
        for (const key in this._mappings) {
            const origKey = this.getReverseMap(key);
            retVal[this._mappings[key]] = row[origKey];
        }
    }
    return retVal;
};

EventUpdate.prototype.getMap = function (col) {
    return this.event.visualization.source.getMap(col);
};

EventUpdate.prototype.getReverseMap = function (col) {
    return this.event.visualization.source.getReverseMap(col);
};

EventUpdate.prototype.mapSelected = function () {
    if (this.event.visualization.hasSelection()) {
        return this.mapData(this.event.visualization._widgetState.row);
    }
    return this.mapData({});
};

EventUpdate.prototype.calcRequestFor = function (visualization) {
    const retVal = {};
    const updateVisualization = this.getVisualization();
    updateVisualization.getInputVisualizations().forEach(function (inViz, idx) {
        //  Calc request for each visualization to be updated  ---
        const changed = inViz === visualization;
        inViz.getUpdatesForVisualization(updateVisualization).forEach(function (inVizUpdateObj) {
            //  Gather all contributing "input visualization events" for the visualization that is to be updated  ---
            const inVizRequest = inVizUpdateObj.mapSelected();
            for (const key in inVizRequest) {
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
};

function Event(visualization, eventID, event) {
    this.visualization = visualization;
    this.eventID = eventID;
    this._updates = [];
    if (event) {
        this._updates = event.updates.map(function (updateInfo) {
            return new EventUpdate(this, updateInfo, event.mappings);
        }, this);
    }
}

Event.prototype.exists = function () {
    return this._updates.length;
};

Event.prototype.getUpdates = function () {
    return this._updates.filter(function (updateInfo) {
        if (!updateInfo._col) return true;
        return updateInfo._col === updateInfo.getMap(this.visualization._widgetState.col);
    }, this);
};

Event.prototype.getUpdatesDatasources = function () {
    const dedup = {};
    const retVal = [];
    this.getUpdatesVisualizations().forEach(function (item, idx) {
        const datasource = item.source.getDatasource();
        if (datasource && !dedup[datasource.id]) {
            dedup[datasource.id] = true;
            retVal.push(datasource);
        }
    }, this);
    return retVal;
};

Event.prototype.getUpdatesVisualizations = function () {
    const dedup = {};
    const retVal = [];
    this._updates.forEach(function (updateObj, idx) {
        const visualization = updateObj.getVisualization();
        if (!dedup[visualization.id]) {
            dedup[visualization.id] = true;
            retVal.push(visualization);
        }
    }, this);
    return retVal;
};

Event.prototype.fetchData = function () {
    const fetchDataOptimizer = new VisualizationRequestOptimizer();
    this.getUpdates().forEach(function (updateObj) {
        fetchDataOptimizer.appendRequest(updateObj.getDatasource(), updateObj.calcRequestFor(this.visualization), updateObj.getVisualization());
    }, this);
    return fetchDataOptimizer.fetchData();
};

function Events(visualization, events) {
    this.visualization = visualization;
    this.events = {};
    for (const key in events) {
        this.events[key] = new Event(visualization, key, events[key]);
    }
}

Events.prototype.setWidget = function (widget) {
    const context = this;
    for (const key in this.events) {
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
};

Events.prototype.exists = function () {
    return this._updates !== undefined;
};

Events.prototype.getUpdates = function () {
    let retVal = [];
    for (const key in this.events) {
        retVal = retVal.concat(this.events[key].getUpdates());
    }
    return retVal;
};

Events.prototype.getUpdatesDatasources = function () {
    let retVal = [];
    for (const key in this.events) {
        retVal = retVal.concat(this.events[key].getUpdatesDatasources());
    }
    return retVal;
};

Events.prototype.getUpdatesVisualizations = function () {
    let retVal = [];
    for (const key in this.events) {
        retVal = retVal.concat(this.events[key].getUpdatesVisualizations());
    }
    return retVal;
};

//  Visualization ---
export function Visualization(dashboard, visualization, parentVisualization) {
    Class.call(this);

    this.dashboard = dashboard;
    this.parentVisualization = parentVisualization;
    this.id = visualization.id;

    this.label = visualization.label;
    this.title = visualization.title || visualization.id;
    this.type = visualization.type;
    this.icon = visualization.icon || {};
    this.flag = visualization.flag || [];
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
        this.layers = (visualization.visualizations || []).map(function (innerViz) {
            return dashboard.createVisualization(innerViz, this);
        }, this);
    } else {
        (visualization.visualizations || []).forEach(function (innerViz) {
            this.vizDeclarations[innerViz.id] = dashboard.createVisualization(innerViz, this);
            this.hasVizDeclarations = true;
        }, this);
    }
    const context = this;
    switch (this.type) {
        case "CHORO":
            let chartType = visualization.properties && visualization.properties.charttype ? visualization.properties.charttype : "";
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
                                    .fillColor(visualization.color ? visualization.color : null)
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
                        const layers = context.layers.map(function (layer) { return layer.widget; });
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
                                            layers
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
                    if (visualization.range) {
                        let selectionLabel = "";
                        for (const key in visualization.source.mappings) {
                            selectionLabel = key;
                            break;
                        }
                        widget
                            .low_default(+visualization.range[0])
                            .high_default(+visualization.range[1])
                            .step_default(+visualization.range[2])
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
            this.loadWidgets(["src/form/Form", "src/form/Input", "src/form/Button", "src/form/CheckBox", "src/form/ColorInput", "src/form/Radio", "src/form/Range", "src/form/Select", "src/form/Slider", "src/form/TextArea"], function (widget, widgetClasses) {
                const Input = widgetClasses[1];
                const CheckBox = widgetClasses[3];
                const Radio = widgetClasses[5];
                const Select = widgetClasses[7];
                const TextArea = widgetClasses[9];

                try {
                    widget
                        .id(visualization.id)
                        .inputs(visualization.fields.map(function (field) {

                            const selectOptions = [];
                            let options = [];
                            let inp;
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
                                default:
                                    if (field.properties.enumvals) {
                                        inp = new Select();
                                        options = field.properties.enumvals;
                                        for (const val in options) {
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
                                const vals = Object.keys(field.properties.enumvals);
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
Visualization.prototype = Object.create(Class.prototype);
Visualization.prototype.constructor = Visualization;

Visualization.prototype.getQualifiedID = function () {
    return this.id;
};

Visualization.prototype.loadedPromise = function () {
    const context = this;
    return new Promise(function (resolve, reject) {
        const intervalHandle = setInterval(function () {
            if (context.isLoaded()) {
                clearInterval(intervalHandle);
                resolve();
            }
        }, 100);
    });
};

Visualization.prototype.isLoading = function () {
    return this.widget === null;
};

Visualization.prototype.isLoaded = function () {
    return this.widget instanceof Widget;
};

Visualization.prototype.loadMegaChartWidget = function (widgetPath, callback) {
    this.loadWidgets(["src/composite/MegaChart", widgetPath], function (megaChart, widgets) {
        const chart = new widgets[1]();
        megaChart
            .chartType_default(MultiChart.prototype._allChartTypesByClass[chart.classID()].id)
            .chart(chart)
            ;
        if (callback) {
            callback(megaChart, chart, widgets);
        }
    });
};

Visualization.prototype.loadWidget = function (widgetPath, callback) {
    this.loadWidgets([widgetPath], callback);
};

function debugRequire(deps: string[], callback: (...objs: any[]) => void) {
    callback(...deps.map(() => {
        return DGridTable;
    }));
}

function es6Require(deps, callback, errback?, _require?) {
    const require = _require || (window as any).require || debugRequire;
    require(deps, function (objs) {
        for (let i = 0; i < arguments.length; ++i) {
            const depParts = deps[i].split("/");
            if (depParts.length && arguments[i][depParts[depParts.length - 1]]) {
                arguments[i] = arguments[i][depParts[depParts.length - 1]];
            }
        }
        callback.apply(this, arguments);
    }, errback);
}

Visualization.prototype.loadWidgets = function (widgetPaths, callback) {
    this.widget = null;

    const context = this;
    es6Require(widgetPaths, function (Widget) {
        const existingWidget = context.dashboard.marshaller._widgetMappings.get(context.id);
        if (existingWidget) {
            if (Widget.prototype._class !== existingWidget._class) {
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
};

Visualization.prototype.setWidget = function (widget) {
    this.widget = widget;
    this.events.setWidget(widget);
    if (this.widget.columns) {
        const columns = this.source.getColumns();
        this.widget.columns(columns, true);
    }
    for (const key in this.properties) {
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
};

Visualization.prototype.accept = function (visitor) {
    visitor.visit(this);
};

Visualization.prototype.getUpdates = function () {
    return this.events.getUpdates();
};

Visualization.prototype.getUpdatesForDatasource = function (otherDatasource) {
    return this.events.getUpdates().filter(function (updateObj) {
        return updateObj.getDatasource() === otherDatasource;
    });
};

Visualization.prototype.getUpdatesForVisualization = function (otherViz) {
    return this.events.getUpdates().filter(function (updateObj) {
        return updateObj.getVisualization() === otherViz;
    });
};

Visualization.prototype.update = function (params) {
    if (!params) {
        const paramsArr = [];
        const dedupParams = {};
        const updatedBy = this.getInputVisualizations();
        updatedBy.forEach(function (viz) {
            if (viz.hasSelection()) {
                viz.getUpdatesForVisualization(this).forEach(function (updateObj) {
                    const mappedData = updateObj.mapSelected();
                    for (const key in mappedData) {
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

    let titleWidget = null;
    if (!this.parentVisualization) {
        titleWidget = this.widget;
        while (titleWidget && !titleWidget.title) {
            titleWidget = titleWidget.locateParentWidget();
        }
    }

    const context = this;
    return new Promise(function (resolve, reject) {
        if (titleWidget) {
            const title = titleWidget.title();
            const titleParts = title.split(" (");
            titleWidget
                .title(titleParts[0] + (params ? " (" + params + ")" : ""))
                .render(function () {
                    resolve();
                })
                ;
        } else {
            let ddlViz = context;
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
};

Visualization.prototype.notify = function () {
    if (this.widget) {
        const data = this.source.hasData() ? this.source.getData() : [];
        this.widget.data(data);
        return this.update();
    }
    return Promise.resolve();
};

Visualization.prototype.clear = function () {
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
};

Visualization.prototype.on = function (eventID, func) {
    const context = this;
    this.overrideMethod(eventID, function (origFunc, args) {
        origFunc.apply(context, args);
        setTimeout(function () {
            func.apply(context, args);
        }, 0);
    });
    return this;
};

Visualization.prototype.calcRequestFor = function (visualization) {
    let retVal = {};
    this.getUpdatesForVisualization(visualization).forEach(function (updatesObj) {
        //  TODO:  When we support more than "click" this will need enhancment...
        retVal = updatesObj.calcRequestFor(visualization);
    });
    return retVal;
};

Visualization.prototype.processEvent = function (eventID, event, row, col, selected) {
    this._widgetState = {
        row,
        col,
        selected: selected === undefined ? true : selected
    };
    const context = this;
    setTimeout(function () {
        event.fetchData().then(function (promises) {
            context.dashboard.marshaller.vizEvent(context.widget, "post_" + eventID, row, col, selected);
        });
    }, 0);
};

Visualization.prototype.hasSelection = function () {
    return this._widgetState && this._widgetState.selected;
};

Visualization.prototype.selection = function () {
    if (this.hasSelection()) {
        return this._widgetState.row;
    }
    return null;
};

Visualization.prototype.reverseMappedSelection = function () {
    if (this.hasSelection()) {
        return this.source.mappings ? this.source.mappings.doReverseMap(this._widgetState.row) : this._widgetState.row;
    }
    return null;
};

Visualization.prototype.getInputVisualizations = function () {
    return this.dashboard.marshaller.getVisualizationArray().filter(function (viz) {
        const updates = viz.events.getUpdatesVisualizations();
        if (updates.indexOf(this) >= 0) {
            return true;
        }
        return false;
    }, this);
};

Visualization.prototype.serializeState = function () {
    const state: any = {
        widgetState: this._widgetState
    };
    if (this.widget) {
        if (this.widget.serializeState) {
            state.widget = this.widget.serializeState();
        } else if (this.widget.data) {
            state.widget = {
                data: this.widget.data()
            };
        }
    }
    return state;
};

Visualization.prototype.deserializeState = function (state) {
    if (state) {
        this._widgetState = state.widgetState;
        if (this.widget && state.widget) {
            if (this.widget.deserializeState) {
                this.widget.deserializeState(state.widget);
            } else if (this.widget.data && state.widget.data) {
                this.widget.data(state.widget.data);
            }
        }
    }
    return this;
};

//  Output  ---
export function Output(dataSource, output) {
    this.dataSource = dataSource;
    this.id = output.id;
    this.from = output.from;
    this.notify = output.notify || [];
    this.filter = output.filter || [];
}

Output.prototype.getQualifiedID = function () {
    return this.dataSource.getQualifiedID() + "." + this.id;
};

Output.prototype.getUpdatesVisualizations = function () {
    const retVal = [];
    this.notify.forEach(function (item) {
        retVal.push(this.dataSource.dashboard.getVisualization(item));
    }, this);
    return retVal;
};

Output.prototype.accept = function (visitor) {
    visitor.visit(this);
};

Output.prototype.vizNotify = function (updates) {
    const promises = [];
    this.notify.filter(function (item) {
        return !updates || updates.indexOf(item) >= 0;
    }).forEach(function (item) {
        const viz = this.dataSource.dashboard.getVisualization(item);
        promises.push(viz.notify());
    }, this);
    return Promise.all(promises);
};

Output.prototype.setData = function (data, updates) {
    this.db = new Database.Grid().jsonObj(data);
    return this.vizNotify(updates);
};

//  FetchData Optimizers  ---
function DatasourceRequestOptimizer() {
    this.datasourceRequests = {
    };
}

DatasourceRequestOptimizer.prototype.appendRequest = function (updateDatasource, request, updateVisualization) {
    const datasourceRequestID = updateDatasource.id + "(" + JSON.stringify(request) + ")";
    if (!this.datasourceRequests[datasourceRequestID]) {
        this.datasourceRequests[datasourceRequestID] = {
            updateDatasource,
            request,
            updates: []
        };
    } else if ((window as any).__hpcc_debug) {
        console.log("Optimized duplicate fetch:  " + datasourceRequestID);
    }
    const datasourceOptimizedItem = this.datasourceRequests[datasourceRequestID];
    if (datasourceOptimizedItem.updates.indexOf(updateVisualization.id) < 0) {
        datasourceOptimizedItem.updates.push(updateVisualization.id);
    }
};

DatasourceRequestOptimizer.prototype.fetchData = function () {
    const promises = [];
    for (const key in this.datasourceRequests) {
        const item = this.datasourceRequests[key];
        promises.push(item.updateDatasource.fetchData(item.request, item.updates));
    }
    return Promise.all(promises);
};

function VisualizationRequestOptimizer(skipClear?) {
    this.skipClear = skipClear;
    this.visualizationRequests = {
    };
}

VisualizationRequestOptimizer.prototype.appendRequest = function (updateDatasource, request, updateVisualization) {
    if (updateDatasource && updateVisualization) {
        const visualizationRequestID = updateVisualization.id + "(" + updateDatasource.id + ")";
        if (!this.visualizationRequests[visualizationRequestID]) {
            this.visualizationRequests[visualizationRequestID] = {
                updateVisualization,
                updateDatasource,
                request: {}
            };
        } else if ((window as any).__hpcc_debug) {
            console.log("Optimized duplicate fetch:  " + visualizationRequestID);
        }
        const visualizationOptimizedItem = this.visualizationRequests[visualizationRequestID];
        Utility.mixin(visualizationOptimizedItem.request, request);
    }
};

VisualizationRequestOptimizer.prototype.fetchData = function () {
    const datasourceRequestOptimizer = new DatasourceRequestOptimizer();
    for (const key in this.visualizationRequests) {
        const item = this.visualizationRequests[key];
        if (!this.skipClear && item.updateVisualization.type !== "GRAPH") {
            item.updateVisualization.clear();
        }
        item.updateVisualization.update(LOADING);
        datasourceRequestOptimizer.appendRequest(item.updateDatasource, item.request, item.updateVisualization);
    }
    return datasourceRequestOptimizer.fetchData();
};

//  DataSource  ---
export function DataSource(dashboard, dataSource, proxyMappings, timeout) {
    this.dashboard = dashboard;
    this.id = dataSource.id;
    this.filter = dataSource.filter || [];
    this.WUID = dataSource.WUID;
    this.URL = dashboard.marshaller.espUrl && dashboard.marshaller.espUrl._url ? dashboard.marshaller.espUrl._url : dataSource.URL;
    this.databomb = dataSource.databomb;
    this._loadedCount = 0;

    const context = this;
    this.outputs = {};
    const hipieResults = [];
    dataSource.outputs.forEach(function (item) {
        context.outputs[item.id] = new Output(context, item);
        hipieResults.push({
            id: item.id,
            from: item.from,
            filter: item.filter || this.filter
        });
    }, this);

    if (this.WUID) {
        this.comms = new Comms.HIPIEWorkunit()
            .url(this.URL)
            .proxyMappings(proxyMappings)
            .timeout(timeout)
            .hipieResults(hipieResults)
            ;
    } else if (this.databomb) {
        this.comms = new Comms.HIPIEDatabomb()
            .hipieResults(hipieResults)
            ;
    } else {
        this.comms = new Comms.HIPIERoxie()
            .url(dataSource.URL)
            .proxyMappings(proxyMappings)
            .timeout(timeout)
            ;
    }
}

DataSource.prototype.getQualifiedID = function () {
    return this.dashboard.getQualifiedID() + "." + this.id;
};

DataSource.prototype.getUpdatesVisualizations = function () {
    const retVal = [];
    for (const key in this.outputs) {
        this.outputs[key].getUpdatesVisualizations().forEach(function (visualization) {
            retVal.push(visualization);
        });
    }
    return retVal;
};

DataSource.prototype.accept = function (visitor) {
    visitor.visit(this);
    for (const key in this.outputs) {
        this.outputs[key].accept(visitor);
    }
};

let transactionID = 0;
const transactionQueue = [];
DataSource.prototype.fetchData = function (request, updates) {
    const myTransactionID = ++transactionID;
    transactionQueue.push(myTransactionID);

    const dsRequest: any = {};
    this.filter.forEach(function (item) {
        dsRequest[item + _CHANGED] = request[item + _CHANGED] || false;
        const value = request[item] === undefined ? null : request[item];
        if (dsRequest[item] !== value) {
            dsRequest[item] = value;
        }
    });
    dsRequest.refresh = request.refresh || false;
    if ((window as any).__hpcc_debug) {
        console.log("fetchData:  " + JSON.stringify(updates) + "(" + JSON.stringify(request) + ")");
    }
    for (const key in dsRequest) {
        if (dsRequest[key] === null) {
            delete dsRequest[key];
        }
    }
    const now = Date.now();
    this.dashboard.marshaller.commsEvent(this, "request", dsRequest);
    const context = this;
    return new Promise(function (resolve, reject) {
        context.comms.call(dsRequest).then(function (_response) {
            const response = JSON.parse(JSON.stringify(_response));
            const intervalHandle = setInterval(function () {
                if (transactionQueue[0] === myTransactionID && Date.now() - now >= 500) {  //  500 is to allow for all "clear" transitions to complete...
                    clearTimeout(intervalHandle);
                    context.processResponse(response, request, updates).then(function () {
                        transactionQueue.shift();
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
};

DataSource.prototype.processResponse = function (response, request, updates) {
    const lowerResponse = {};
    for (const responseKey in response) {
        lowerResponse[responseKey.toLowerCase()] = response[responseKey];
    }
    const promises = [];
    for (const key in this.outputs) {
        let from = this.outputs[key].from;
        if (!from) {
            //  Temp workaround for older services  ---
            from = this.outputs[key].id.toLowerCase();
        }
        if (Utility.exists(from, response)) {
            if (!Utility.exists(from + _CHANGED, response) || (Utility.exists(from + _CHANGED, response) && response[from + _CHANGED].length && response[from + _CHANGED][0][from + _CHANGED])) {
                promises.push(this.outputs[key].setData(response[from], updates));
            } else {
                //  TODO - I Suspect there is a HIPIE/Roxie issue here (empty request)
                promises.push(this.outputs[key].vizNotify(updates));
            }
        } else if (Utility.exists(from, lowerResponse)) {
            console.log("DDL 'DataSource.From' case is Incorrect");
            if (!Utility.exists(from + _CHANGED, lowerResponse) || (Utility.exists(from + _CHANGED, lowerResponse) && response[from + _CHANGED].length && lowerResponse[from + _CHANGED][0][from + _CHANGED])) {
                promises.push(this.outputs[key].setData(lowerResponse[from], updates));
            } else {
                //  TODO - I Suspect there is a HIPIE/Roxie issue here (empty request)
                promises.push(this.outputs[key].vizNotify(updates));
            }
        } else {
            const responseItems = [];
            for (const responseKey2 in response) {
                responseItems.push(responseKey2);
            }
            console.log("Unable to locate '" + from + "' in response {" + responseItems.join(", ") + "}");
        }
    }
    return Promise.all(promises);
};

DataSource.prototype.isRoxie = function () {
    return !this.WUID && !this.databomb;
};

DataSource.prototype.serializeState = function () {
    return {
    };
};

DataSource.prototype.deserializeState = function (state) {
    if (!state) return;
};

//  Dashboard  ---
export function Dashboard(marshaller, dashboard, proxyMappings, timeout?) {
    this.marshaller = marshaller;
    this.id = dashboard.id;
    this.title = dashboard.title;

    const context = this;
    this.datasources = {};
    this.datasourceTotal = 0;
    dashboard.datasources.forEach(function (item) {
        context.datasources[item.id] = new DataSource(context, item, proxyMappings, timeout);
        ++context.datasourceTotal;
    });

    this._visualizations = {};
    this._visualizationArray = [];
    dashboard.visualizations.forEach(function (item) {
        this.createVisualization(item);
    }, this);
    this._visualizationTotal = this._visualizationArray.length;
}

Dashboard.prototype.createVisualization = function (ddlVisualization, parentVisualization) {
    const retVal = new Visualization(this, ddlVisualization, parentVisualization);
    this._visualizations[ddlVisualization.id] = retVal;
    this._visualizationArray.push(retVal);
    this.marshaller._visualizations[ddlVisualization.id] = retVal;
    this.marshaller._visualizationArray.push(retVal);
    return retVal;
};

Dashboard.prototype.loadedPromise = function () {
    return Promise.all(this._visualizationArray.map(function (visualization) { return visualization.loadedPromise(); }));
};

Dashboard.prototype.getQualifiedID = function () {
    return this.id;
};

Dashboard.prototype.getDatasource = function (id) {
    return this.datasources[id];
};

Dashboard.prototype.getVisualization = function (id) {
    return this._visualizations[id] || this.marshaller.getVisualization(id);
};

Dashboard.prototype.getVisualizations = function () {
    return this._visualizations;
};

Dashboard.prototype.getVisualizationArray = function () {
    return this._visualizationArray;
};

Dashboard.prototype.getVisualizationTotal = function () {
    return this._visualizationTotal;
};

Dashboard.prototype.accept = function (visitor) {
    visitor.visit(this);
    for (const key in this.datasources) {
        this.datasources[key].accept(visitor);
    }
    this._visualizationArray.forEach(function (item) {
        item.accept(visitor);
    }, this);
};

Dashboard.prototype.primeData = function (state) {
    const fetchDataOptimizer = new VisualizationRequestOptimizer(true);
    this.getVisualizationArray().forEach(function (visualization) {
        //  Clear all charts back to their default values ---
        visualization.clear();
        visualization.update();
        if (state && state[visualization.id]) {
            if (Utility.exists("source.mappings.mappings", visualization)) {
                for (const key in visualization.source.mappings.mappings) {
                    if (state[visualization.id][visualization.source.mappings.mappings[key]]) {
                        visualization._widgetState.row[key] = state[visualization.id][visualization.source.mappings.mappings[key]];
                        visualization._widgetState.selected = true;
                    }
                }
            }
        }
    });
    this.getVisualizationArray().forEach(function (visualization) {
        const inputVisualizations = visualization.getInputVisualizations();
        const datasource = visualization.source.getDatasource();
        let hasInputSelection = false;
        inputVisualizations.forEach(function (inViz) {
            if (inViz.hasSelection()) {
                const request = inViz.calcRequestFor(visualization);
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
};

Dashboard.prototype.serializeState = function () {
    const retVal = {
        datasources: {},
        visualizations: {}
    };
    for (const key in this.datasources) {
        retVal.datasources[key] = this.datasources[key].serializeState();
    }
    for (const vizKey in this._visualizations) {
        retVal.visualizations[vizKey] = this._visualizations[vizKey].serializeState();
    }
    return retVal;
};

Dashboard.prototype.deserializeState = function (state) {
    if (!state) return;
    for (const key in this.datasources) {
        if (state.datasources[key]) {
            this.datasources[key].deserializeState(state.datasources[key]);
        }
    }
    for (const vizKey in this._visualizations) {
        if (state.visualizations[vizKey]) {
            this._visualizations[vizKey].deserializeState(state.visualizations[vizKey]);
        }
    }
};

//  Marshaller  ---
export function Marshaller() {
    Class.call(this);

    this._proxyMappings = {};
    this._widgetMappings = d3Map();
    this._clearDataOnUpdate = true;
    this._propogateClear = false;
    this.id = "Marshaller";
    this._missingDataString = "";
}
Marshaller.prototype = Object.create(Class.prototype);
Marshaller.prototype.constructor = Marshaller;

Marshaller.prototype.commsDataLoaded = function () {
    for (let i = 0; i < this.dashboardArray.length; i++) {
        for (const ds in this.dashboardArray[i].datasources) {
            if (this.dashboardArray[i].datasources[ds]._loadedCount === 0) {
                return false;
            }
        }
    }
    return true;
};

Marshaller.prototype.getVisualization = function (id) {
    return this._visualizations[id];
};

Marshaller.prototype.accept = function (visitor) {
    visitor.visit(this);
    this.dashboardTotal = 0;
    for (const key in this.dashboards) {
        this.dashboards[key].accept(visitor);
        ++this.dashboardTotal;
    }
};

Marshaller.prototype.url = function (url, callback) {
    this.espUrl = new Comms.ESPUrl()
        .url(url)
        ;
    let transport = null;
    let hipieResultName = "HIPIE_DDL";
    if (this.espUrl.isWorkunitResult()) {
        hipieResultName = this.espUrl._params["ResultName"];
        transport = new Comms.HIPIEWorkunit()
            .url(url)
            .proxyMappings(this._proxyMappings)
            .timeout(this._timeout)
            ;
    } else {
        transport = new Comms.HIPIERoxie()
            .url(url)
            .proxyMappings(this._proxyMappings)
            .timeout(this._timeout)
            ;
    }

    const context = this;
    transport.fetchResults().then(function (response) {
        if (Utility.exists(hipieResultName, response)) {
            return transport.fetchResult(hipieResultName).then(function (ddlResponse) {
                const json = ddlResponse[0][hipieResultName];
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
};

Marshaller.prototype.proxyMappings = function (_) {
    if (!arguments.length) return this._proxyMappings;
    this._proxyMappings = _;
    return this;
};

Marshaller.prototype.timeout = function (_) {
    if (!arguments.length) return this._timeout;
    this._timeout = _;
    return this;
};

Marshaller.prototype.widgetMappings = function (_) {
    if (!arguments.length) return this._widgetMappings;
    this._widgetMappings = _;
    return this;
};

Marshaller.prototype.clearDataOnUpdate = function (_) {
    if (!arguments.length) return this._clearDataOnUpdate;
    this._clearDataOnUpdate = _;
    return this;
};

Marshaller.prototype.propogateClear = function (_) {
    if (!arguments.length) return this._propogateClear;
    this._propogateClear = _;
    return this;
};

Marshaller.prototype.missingDataString = function (_) {
    if (!arguments.length) return this._missingDataString;
    this._missingDataString = _;
    return this;
};

Marshaller.prototype.parse = function (json, callback) {
    const context = this;
    this._json = json;
    this._jsonParsed = JSON.parse(this._json);
    this.dashboards = {};
    this.dashboardArray = [];
    this._visualizations = {};
    this._visualizationArray = [];
    this._jsonParsed.forEach(function (item) {
        const newDashboard = new Dashboard(context, item, context._proxyMappings);
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
    return this;
};

Marshaller.prototype.dashboardsLoaded = function () {
    return Promise.all(this.dashboardArray.map(function (dashboard) { return dashboard.loadedPromise(); }));
};

Marshaller.prototype.getVisualizations = function () {
    return this._visualizations;
};

Marshaller.prototype.getVisualizationArray = function () {
    return this._visualizationArray;
};

Marshaller.prototype.on = function (eventID, func) {
    const context = this;
    this.overrideMethod(eventID, function (origFunc, args) {
        const retVal = origFunc.apply(context, args);
        return func.apply(context, args) || retVal;
    });
    return this;
};

Marshaller.prototype.ready = function (callback) {
    if (!callback) {
        return;
    }
    this.dashboardsLoaded().then(function () {
        callback();
    });
};

Marshaller.prototype.vizEvent = function (sourceWidget, eventID, row, col, selected) {
    console.log("Marshaller.vizEvent:  " + sourceWidget.id() + "-" + eventID);
};

Marshaller.prototype.commsEvent = function (ddlSource, eventID, request, response) {
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
};

Marshaller.prototype.createDatabomb = function () {
    const retVal = {};
    this.dashboardArray.forEach(function (dashboard) {
        for (const key in dashboard.datasources) {
            const comms = dashboard.datasources[key].comms;
            retVal[key] = {};
            for (const key2 in comms._hipieResults) {
                const hipieResult = comms._hipieResults[key2];
                retVal[key][key2] = comms._resultNameCache[hipieResult.from];
            }
        }
    });
    return retVal;
};

Marshaller.prototype.primeData = function (state) {
    const promises = this.dashboardArray.map(function (dashboard) {
        return dashboard.primeData(state);
    });
    return Promise.all(promises);
};

Marshaller.prototype.serializeState = function () {
    const retVal = {};
    this.dashboardArray.forEach(function (dashboard, idx) {
        retVal[dashboard.id] = dashboard.serializeState();
    });
    return retVal;
};

Marshaller.prototype.deserializeState = function (state) {
    if (!state) return;
    this.dashboardArray.forEach(function (dashboard, idx) {
        dashboard.deserializeState(state[dashboard.id]);
    });
    return this;
};
