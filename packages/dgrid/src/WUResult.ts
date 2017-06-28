import { publish } from "@hpcc-js/common";
import { HTMLWidget } from "@hpcc-js/common";
import { Result, Workunit, XSDXMLNode } from "@hpcc-js/comms";
import { Deferred, domConstruct, PagingGrid, QueryResults } from "@hpcc-js/dgrid-shim";

function entitiesEncode(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeEncode(item) {
    switch (Object.prototype.toString.call(item)) {
        case "[object Boolean]":
        case "[object Number]":
            return item;
        case "[object String]":
            return entitiesEncode(item);
        default:
            console.log("Unknown cell type.");
    }
    return item;
}

const LINE_SPLITTER = "<br><hr style='border: 0px; border-bottom: 1px solid rgb(221, 221, 221);margin: 0px;'>";
const LINE_SPLITTER2 = "<br><hr style='visibility: hidden; border: 0px; border-bottom: 1px solid rgb(221, 221, 221);margin: 0px;'>";

class RowFormatter {
    _columns = [];
    _columnIdx = {};
    _formattedRow = {};
    _grid = {};

    constructor(columns, row) {
        this.flattenColumns(columns);

        this.formatRow(columns, row);
    }

    flattenColumns(columns) {
        const context = this;
        columns.forEach(function (column) {
            context.flattenColumn(column);
        });
    }

    flattenColumn(column) {
        if (column.children) {
            const context = this;
            column.children.forEach(function (column2) {
                context.flattenColumn(column2);
            });
        } else {
            this._columnIdx[column.field] = this._columns.length;
            this._columns.push(column.field);
        }
    }

    formatRow(columns, row: any = {}, rowIdx: number = 0) {
        const context = this;
        let maxChildLen = 0;
        const colLenBefore = {};
        columns.forEach(function (column) {
            if (!column.children && context._formattedRow[column.field] !== undefined) {
                colLenBefore[column.field] = ("" + context._formattedRow[column.field]).split(LINE_SPLITTER).length;
            }
            maxChildLen = Math.max(maxChildLen, context.formatCell(column, column.isRawHTML ? row[column.leafID] : safeEncode(row[column.leafID]), rowIdx));
        });
        columns.forEach(function (column) {
            if (!column.children) {
                const cellLength = ("" + context._formattedRow[column.field]).split(LINE_SPLITTER).length - (colLenBefore[column.field] || 0);
                const delta = maxChildLen - cellLength;
                if (delta > 0) {
                    const paddingArr = [];
                    paddingArr.length = delta + 1;
                    const padding = paddingArr.join(LINE_SPLITTER2);
                    context._formattedRow[column.field] += padding;
                }
            }
        });
        return maxChildLen;
    }

    formatCell(column, cell, rowIdx) {
        let internalRows = 0;
        if (column.children) {
            const children = cell && cell.Row ? cell.Row : [cell];
            if (children.length === 0) {
                children.push({});
            }
            const context = this;
            children.forEach(function (row, idx) {
                internalRows += context.formatRow(column.children, row, rowIdx + idx) + 1;
            });
            return children.length;
        }
        if (this._formattedRow[column.field] === undefined) {
            this._formattedRow[column.field] = cell === undefined ? "" : cell;
            ++internalRows;
        } else {
            this._formattedRow[column.field] += LINE_SPLITTER + (cell === undefined ? "" : cell);
            ++internalRows;
        }
        if (!this._grid[rowIdx]) {
            this._grid[rowIdx] = {};
        }
        this._grid[rowIdx][column.field] = cell;
        return internalRows;
    }

    row() {
        const retVal = {};
        const context = this;
        this._columns.forEach(function (column) {
            retVal[column] = context._formattedRow[column];
        });
        return retVal;
    }
}

class MyStore {
    wuResult: Result;
    _structure;

    constructor(wuResult: Result, columns?) {
        this.wuResult = wuResult;
        this._structure = columns;
    }

    getIdentity(row) {
        return row.__hpcc_id;
    }

    _request(start, end): Promise<{ totalLength: number, data: any[] }> {
        if (!this.wuResult) return Promise.resolve({ totalLength: 0, data: [] });
        return this.wuResult.fetchRows(start, end - start).then((rows: any[]) => {
            if (this._structure) {
                rows = this._formatRows(this._structure, rows);
            }
            return {
                totalLength: this.wuResult.Total,
                data: rows.map((row, idx) => {
                    row.__hpcc_id = start + idx;
                    return row;
                })
            };
        });
    }

    _formatRows(columns, rows) {
        return rows.map((row) => {
            const rowFormatter = new RowFormatter(columns, row);
            return rowFormatter.row();
        });
    }


    fetchRange(options): Promise<any[]> {
        const retVal = new Deferred();
        this._request(options.start, options.end).then(response => retVal.resolve(response));
        return new QueryResults(retVal.then(response => response.data), {
            totalLength: retVal.then(response => response.totalLength)
        });
    }
}

export class WUResult extends HTMLWidget {

    protected _wu: Workunit;
    protected _result: Result;
    _dgridDiv;
    _dgrid;

    constructor() {
        super();
        this._tag = "div";
    }

    @publish("http://192.168.3.22:8010", "URL to WsWorkunits")
    wsWorkunitsUrl: { (): string, (_: string): WUResult };
    @publish("W20170627-102820", "Workunit ID")
    wuid: { (): string, (_: string): WUResult };
    @publish("NestedChildDataset", "Result Name")
    resultName: { (): string, (_: string): WUResult };

    enter(domNode, element) {
        super.enter(domNode, element);
        this._dgridDiv = element
            .append("div")
            .attr("class", "placeholder")
            ;
        this._dgrid = new PagingGrid({
            columns: [],
            selectionMode: "single",
            cellNavigation: false,
            pagingLinks: 1,
            pagingTextBox: true,
            previousNextArrows: true,
            firstLastArrows: true,
            rowsPerPage: 100,
            pageSizeOptions: [10, 25, 100, 1000]
        }, this._dgridDiv.node());
        this._dgrid.on("dgrid-select", (evt) => {
            if (evt.rows && evt.rows.length) {
                this.click(this.rowToObj(this.data()[evt.rows[0].id]), "", true);
            }
        });
    }

    update(domNode, element) {
        super.update(domNode, element);
        this._dgridDiv
            .style("width", this.width() + "px")
            .style("height", this.height() - 2 + "px")
            ;
        this._dgrid.resize();
        if (!this._result || this._result.Wuid !== this.wuid() || this._result.ResultName !== this.resultName()) {
            this._result = new Result({ baseUrl: this.wsWorkunitsUrl() }, this.wuid(), this.resultName());
            this._result.fetchXMLSchema().then(() => {
                const columns = this.schema2Columns(this._result.rootField(), "");
                console.log(columns);
                this._dgrid.set("columns", columns);
                /*this._result.fields().map(field => {
                    return {
                        field: field.name,
                        label: field.name,
                        sortable: false
                    };
                }));
                */
                this._dgrid.set("collection", new MyStore(this._result, columns));
                // this._dgrid.refresh();
            });
        }
    }

    schema2Columns(parentNode: XSDXMLNode, prefix): any[] {
        if (!parentNode) return [];
        const retVal = [];
        const parentNodeChildren = parentNode.children();
        for (const node of parentNodeChildren) {
            console.log(node);
            switch (node.type) {
                default:
                    const name = node.name;
                    const type = node.type;
                    const keyed = false;
                    /*
                    const appInfo = this.getFirstSchemaNode(node, "appinfo");
                    if (appInfo) {
                        keyed = appInfo.getAttribute("hpcc:keyed");
                    }
                    */
                    if (name && name.indexOf("__hidden", name.length - "__hidden".length) !== -1) {
                    } else {
                        let column = null;
                        switch (type) {
                            case undefined:
                            case "hpcc:childDataset":
                                let childWidth = 10;  //  Allow for html table
                                const children = this.schema2Columns(node, prefix + name + "_");
                                children.forEach(function (item, idx) {
                                    childWidth += item.width;
                                });
                                column = {
                                    label: name,
                                    field: prefix + name,
                                    leafID: name,
                                    renderCell: (row, cell, node2, options) => {
                                        this.rowToTable(cell, row, node2);
                                    },
                                    width: childWidth,
                                    children
                                };
                                break;
                            default:
                                column = {
                                    label: name,
                                    leafID: name,
                                    field: prefix + name,
                                    width: node.charWidth() * 9,
                                    formatter: (cell, row) => {
                                        switch (typeof cell) {
                                            case "string":
                                                return cell.replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
                                        }
                                        return cell;
                                    }
                                };
                        }
                        if (column) {
                            column.__hpcc_keyed = keyed;
                            column.className = "resultGridCell";
                            column.sortable = false;
                            column.width += keyed ? 16 : 0;
                            column.renderHeaderCellXXX = function () {
                                node.innerHTML = this.label + (this.__hpcc_keyed ? "" /*dojoConfig.getImageHTML("index.png", context.i18n.Index)*/ : "");
                            };
                            retVal.push(column);
                        }
                    }
            }
        }
        return retVal;
    }

    isChildDataset(cell) {
        if (Object.prototype.toString.call(cell) !== "[object Object]") {
            return false;
        }
        let propCount = 0;
        let firstPropType = null;
        for (const key in cell) {
            if (!firstPropType) {
                firstPropType = Object.prototype.toString.call(cell[key]);
            }
            propCount++;
        }
        return propCount === 1 && firstPropType === "[object Array]";
    }

    rowToTable(cell, __row, node) {
        if (this.isChildDataset(cell)) {  //  Don't display "Row" as a header  ---
            for (const key in cell) {
                this.rowToTable(cell[key], __row, node);
            }
            return;
        }

        const table = domConstruct.create("table", { border: 1, cellspacing: 0, width: "100%" }, node);
        switch (Object.prototype.toString.call(cell)) {
            case "[object Object]":
                let tr = domConstruct.create("tr", null, table);
                for (const key in cell) {
                    domConstruct.create("th", { innerHTML: safeEncode(key) }, tr);
                }
                tr = domConstruct.create("tr", null, table);
                for (const key in cell) {
                    switch (Object.prototype.toString.call(cell[key])) {
                        case "[object Object]":
                        case "[object Array]":
                            this.rowToTable(cell[key], __row, node);
                            break;
                        default:
                            domConstruct.create("td", { innerHTML: safeEncode(cell[key]) }, tr);
                            break;
                    }
                }
                break;
            case "[object Array]":
                for (let i = 0; i < cell.length; ++i) {
                    switch (Object.prototype.toString.call(cell[i])) {
                        case "[object Boolean]":
                        case "[object Number]":
                        case "[object String]":
                            //  Item in Scalar  ---
                            const tr1 = domConstruct.create("tr", null, table);
                            domConstruct.create("td", { innerHTML: safeEncode(cell[i]) }, tr1);
                            break;
                        default:
                            //  Child Dataset  ---
                            if (i === 0) {
                                const tr2 = domConstruct.create("tr", null, table);
                                for (const key in cell[i]) {
                                    domConstruct.create("th", { innerHTML: safeEncode(key) }, tr2);
                                }
                            }
                            domConstruct.create("tr", null, table);
                            for (const key in cell[i]) {
                                if (cell[i][key]) {
                                    if (Object.prototype.toString.call(cell[i][key]) === "[object Object]" || Object.prototype.toString.call(cell[i][key]) === "[object Array]") {
                                        const td = domConstruct.create("td", null, tr1);
                                        this.rowToTable(cell[i][key], cell[i], td);
                                    } else if (key.indexOf("__html", key.length - "__html".length) !== -1) {
                                        domConstruct.create("td", { innerHTML: cell[i][key] }, tr1);
                                    } else if (key.indexOf("__javascript", key.length - "__javascript".length) !== -1) {
                                        /*const td = */ domConstruct.create("td", null, tr1);
                                        // this.injectJavascript(cell[i][key], cell[i], td);
                                    } else {
                                        const val = cell[i][key];
                                        domConstruct.create("td", { innerHTML: safeEncode(val) }, tr1);
                                    }
                                } else {
                                    domConstruct.create("td", { innerHTML: "" }, tr1);
                                }
                            }
                    }
                }
                break;
        }
    }

    click(row, col, sel) {
        console.log(row, col, sel);
    }
}
