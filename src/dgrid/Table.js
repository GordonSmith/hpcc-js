"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "dojo/_base/declare", "dstore/Memory", "dgrid/OnDemandGrid", "dgrid/Keyboard", "dgrid/Selection", "dgrid/extensions/Pagination", "css!dgrid/css/dgrid", "css!./Table"], factory);
    } else {
        //root.other_Table = factory(root.common_HTMLWidget);
    }
}(this, function (d3, HTMLWidget, declare, Memory, OnDemandGrid, Keyboard, Selection, Pagination) {
    var Grid = declare([OnDemandGrid, Keyboard, Selection]);
    var PagingGrid = declare([OnDemandGrid, Keyboard, Selection, Pagination]);

    function Table() {
        HTMLWidget.call(this);
        this._tag = "div";
        this._store = new Memory();
    }
    Table.prototype = Object.create(HTMLWidget.prototype);
    Table.prototype.constructor = Table;
    Table.prototype._class += " dgrid_Table";

    Table.prototype.publish("pagination", false, "boolean", "Enable or disable pagination", null, { tags: ["Private"] });

    Table.prototype.dgridColumns = function () {
        return this.fields().map(function (field, idx) {
            return {
                field: "field_" + idx,
                label: field.label()
            };
        });
    };

    Table.prototype.dgridData = function () {
        return this.data().map(function (row, idx) {
            var retVal = {
                id: idx
            };
            row.forEach(function (cell, idx) {
                retVal["field_" + idx] = cell;
            });
            return retVal;
        });
    };

    Table.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        this._dgridDiv = element
            .append("div")
            .attr("class", "placeholder")
        ;
        this._dgrid = new PagingGrid({
            columns: this.dgridColumns(),
            collection: this._store,
            selectionMode: "single",
            cellNavigation: false,
            firstLastArrows: true,
            previousNextArrows: true
        }, this._dgridDiv.node());
    };

    Table.prototype.resize = function () {
        HTMLWidget.prototype.resize.apply(this, arguments);
    };

    Table.prototype.safeGetBBox = function (classID) {
        var domNode = d3.select(classID).node();
        if (domNode) {
            return domNode.getBoundingClientRect();
        }
        return null;
    };

    Table.prototype.calcVisibleRows = function (domNode, element) {
        var contentBBox = this.safeGetBBox(".dgrid-content");
        var rowBBox = this.safeGetBBox(".dgrid-row");
        if (!rowBBox) {
            rowBBox = {
                height: 27  //  Dermatology default height
            }
        }
        return Math.max(Math.floor(contentBBox.height / rowBBox.height), 1);
    };

    Table.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        this._dgridDiv
            .style({
                width: this.width() + "px",
                height: this.height() - 2 + "px"
            })
        ;
        this._dgrid.resize();
        this._store.setData(this.dgridData());
        var visibleRows = this.calcVisibleRows();
        //if (this._prevPagination !== this.pagination() || this._prevVisibleRows !== visibleRows) {
        this._dgrid.set("rowsPerPage", this.pagination() ? visibleRows : this.MAX_SAFE_INTEGER);
        this._dgrid.set("firstLastArrows", this.pagination() ? true : false);
        this._dgrid.set("previousNextArrows", this.pagination() ? true : false);
        this._dgrid.set("pagingLinks", this.pagination() ? 3 : 0);
        this._dgrid.refresh();
        this._prevPagination = this.pagination();
        //}
    };

    Table.prototype.exit = function (domNode, element) {
        HTMLWidget.prototype.exit.apply(this, arguments);
    };

    return Table;
}));
