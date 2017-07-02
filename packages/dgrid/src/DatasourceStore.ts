import { IDatasource, IField } from "@hpcc-js/api";
import { Deferred, QueryResults } from "@hpcc-js/dgrid-shim";

import "../src/WUResultStore.css";

function entitiesEncode(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeEncode(item) {
    switch (Object.prototype.toString.call(item)) {
        case "[object Undefined]":
        case "[object Boolean]":
        case "[object Number]":
            return item;
        case "[object String]":
            return entitiesEncode(item);
        default:
            console.log("Unknown cell type:  " + Object.prototype.toString.call(item));
    }
    return item;
}

const LINE_SPLITTER = `<br><hr class='dgrid-fakeline'>`;
const LINE_SPLITTER2 = `<br><hr class='dgrid-fakeline' style='visibility: hidden'>`;

class RowFormatter {
    private _columns;
    private _flattenedColumns = [];
    private _columnIdx = {};
    private _formattedRow = {};
    private _grid = {};

    constructor(columns) {
        this._columns = columns;
        this.flattenColumns(columns);
    }

    flattenColumns(columns) {
        for (const column of columns) this.flattenColumn(column);

    }

    flattenColumn(column) {
        if (column.children) {
            for (const childColumn of column.children) this.flattenColumn(childColumn);
        } else {
            this._columnIdx[column.field] = this._flattenedColumns.length;
            this._flattenedColumns.push(column.field);
        }
    }

    format(row) {
        this._formattedRow = {};
        this._grid = {};
        this.formatRow(this._columns, row);
        return this.row();
    }

    formatRow(columns, row: { [key: string]: any } = [], rowIdx: number = 0) {
        let maxChildLen = 0;
        const colLenBefore = {};
        for (const column of columns) {
            if (!column.children && this._formattedRow[column.field] !== undefined) {
                colLenBefore[column.field] = ("" + this._formattedRow[column.field]).split(LINE_SPLITTER).length;
            }
            maxChildLen = Math.max(maxChildLen, this.formatCell(column, column.isRawHTML ? row[column.field] : safeEncode(row[column.field]), rowIdx));
        }
        for (const column of columns) {
            if (!column.children) {
                const cellLength = ("" + this._formattedRow[column.field]).split(LINE_SPLITTER).length - (colLenBefore[column.field] || 0);
                const delta = maxChildLen - cellLength;
                if (delta > 0) {
                    const paddingArr = [];
                    paddingArr.length = delta + 1;
                    const padding = paddingArr.join(LINE_SPLITTER2);
                    this._formattedRow[column.field] += padding;
                }
            }
        }
        return maxChildLen;
    }

    formatCell(column, cell, rowIdx) {
        let internalRows = 0;
        if (column.children) {
            const children = cell;
            if (children.length === 0) {
                children.push({});
            }
            for (let idx = 0, _children = children; idx < _children.length; ++idx) {
                const row = _children[idx];
                internalRows += this.formatRow(column.children, row, rowIdx + idx) + 1;
            }
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
        for (const column of this._flattenedColumns) {
            retVal[column] = this._formattedRow[column];
        }
        return retVal;
    }
}

export class DatasourceStore {
    _datasource: IDatasource;
    _columnsIdx: { [key: string]: number } = {};
    _columns;
    protected _cache: { [key: string]: Promise<{ totalLength: number, data: any[] }> } = {};

    private rowFormatter: RowFormatter;

    constructor(datasource: IDatasource) {
        this._datasource = datasource;

        this._columnsIdx = {};
        this._columns = this.db2Columns(this._datasource.fields()).map((column, idx) => {
            this._columnsIdx[column.field] = idx;
            return column;
        });
        this.rowFormatter = new RowFormatter(this._columns);
    }

    columns() {
        return this._columns;
    }

    db2Columns(fields: IField[], prefix = ""): any[] {
        if (!fields) return [];
        return fields.map((field, idx) => {
            const label = field.label;
            const column: any = {
                label,
                leafID: label,
                field: prefix + label,
                idx,
                className: "resultGridCell",
                sortable: true
            };
            console.log(field.type);
            if (field.children) {
                column.children = this.db2Columns(field.children, prefix + label + "_");
            } else {
                column.formatter = (cell, row) => {
                    switch (typeof cell) {
                        case "string":
                            return cell.replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
                    }
                    return cell;
                };
            }
            return column;
        });
    }

    getIdentity(row) {
        return row.__hpcc_id;
    }

    _request(start, end): Promise<{ totalLength: number, data: any[] }> {
        if (!this._datasource) return Promise.resolve({ totalLength: 0, data: [] });
        const cacheKey = `${start}->${end}`;
        if (this._cache[cacheKey]) return this._cache[cacheKey];
        const retVal = this._datasource.fetch(start, end - start).then((response: { total: number, data: any[] }) => {
            return {
                totalLength: response.total,
                data: response.data.map((row, idx) => {
                    const formattedRow: any = this.rowFormatter.format(row);
                    formattedRow.__hpcc_id = start + idx;
                    formattedRow.__hpcc_orig = row;
                    return formattedRow;
                })
            };
        });
        this._cache[cacheKey] = retVal;
        return retVal;
    }

    _formatRows(rows) {
        return rows.map((row) => {
            const rowFormatter = new RowFormatter(this._columns);
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
