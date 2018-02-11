import { HTMLWidget, IDatasource, IField, publish } from "@hpcc-js/common";
import { Grid, PagingGrid } from "@hpcc-js/dgrid-shim";
import { hashSum } from "@hpcc-js/util";

import "../src/Common.css";

export class DBStore2 {
    private _db: IDatasource;

    Model: null;
    idProperty: "__hpcc_id";

    constructor(db: IDatasource) {
        this._db = db;
    }

    columns() {
        // const columnsIdx = {};
        return this.db2Columns(this._db.fields()).map((column, idx) => {
            // columnsIdx[column.field] = idx;
            return column;
        });
    }

    db2Columns(fields: ReadonlyArray<IField>, prefix = ""): any[] {
        if (!fields) return [];
        return fields.map((field, idx) => {
            const label = field.label;
            const column: any = {
                label,
                leafID: label,
                field: label,
                idx,
                className: "resultGridCell",
                sortable: true
            };
            switch (field.type) {
                case "object":
                    column.children = this.db2Columns(field.fields, prefix + label + "_");
                    break;
                default:
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

    getIdentity(object) {
        return object.__hpcc_id;
    }

    fetchRange(opts: { start: number, end: number }): Promise<object[]> {
        const data = this._db.json().slice(opts.start, opts.end).map((d, i) => {
            return {
                ...d,
                __hpcc_id: hashSum(d)
            };
        });
        const retVal = Promise.resolve(data);
        (retVal as any).totalLength = Promise.resolve(this._db.length() - 1);
        return retVal;
    }

    sort(opts) {
        [].sort();
        this._db.sort((l, r) => {
            for (const item of opts) {
                const idx = item.property;
                if (l[idx] < r[idx]) return item.descending ? 1 : -1;
                if (l[idx] > r[idx]) return item.descending ? -1 : 1;
            }
            return 0;
        });
        return this;
    }
}

export class Common extends HTMLWidget {
    protected _columns = [];
    protected _store = new DBStore2(this._db);
    protected _dgridDiv;
    protected _dgrid;
    protected _prevPaging;

    constructor() {
        super();
        this._tag = "div";
        //        this._store.idProperty = "__hpcc_id";
    }

    @publish(true, "boolean", "Enable paging")
    pagination: { (): boolean, (_: boolean): Common };

    enter(domNode, element) {
        super.enter(domNode, element);
        this._dgridDiv = element.append("div")
            .attr("class", "flat")
            ;
    }

    update(domNode, element) {
        super.update(domNode, element);
        if (this._prevPaging !== this.pagination()) {
            this._prevPaging = this.pagination();
            if (this._dgrid) {
                this._dgrid.destroy();
                this._dgridDiv = element.append("div")
                    .attr("class", "flat")
                    ;
            }
            this._dgrid = new (this._prevPaging ? PagingGrid : Grid)({
                columns: this._columns,
                collection: this._store,
                selectionMode: "single",
                deselectOnRefresh: false,
                cellNavigation: false,
                pagingLinks: 1,
                pagingTextBox: true,
                previousNextArrows: true,
                firstLastArrows: true,
                rowsPerPage: 25,
                pageSizeOptions: [1, 10, 25, 100, 1000]
            }, this._dgridDiv.node());
            this._dgrid.on("dgrid-select", (evt) => {
                if (evt.rows && evt.rows.length && evt.rows[0].data) {
                    this.click(this.rowToObj(evt.rows[0].data), "", true);
                }
            });
            this._dgrid.on("dgrid-deselect", (evt) => {
                if (evt.rows && evt.rows.length && evt.rows[0].data) {
                    this.click(this.rowToObj(evt.rows[0].data), "", false);
                }
            });
        }
        this._dgridDiv
            .style("width", this.width() + "px")
            .style("height", this.height() - 2 + "px")
            ;
        this._dgrid.resize();
    }

    click(row, col, sel) {
    }
}
Common.prototype._class += " dgrid_Common";
