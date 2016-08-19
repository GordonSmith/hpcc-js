"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "css!./ARIATable"], factory);
    } else {
        root.common_ARIATable = factory(root.d3, root.common_HTMLWidget);
    }
}(this, function (d3, HTMLWidget) {
    function ARIATable() {
        HTMLWidget.call(this);
        this._tag = "div";
    }
    ARIATable.prototype = Object.create(HTMLWidget.prototype);
    ARIATable.prototype.constructor = ARIATable;
    ARIATable.prototype._class += " common_ARIATable";

    ARIATable.prototype.publish("caption", "Some sample text", "string", "Caption");

    ARIATable.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        this._parentElement.style("overflow", "auto");

        this._table = element.append("table");
        this._tableCaption = this._table.append("caption");
        this._tableHeader = this._table.append("thead").append("tr");
        this._tableBody = this._table.append("tbody");
    };

    ARIATable.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        var context = this;

        this._tableCaption.text(this.caption());
        var headerCells = this._tableHeader.selectAll(".th_" + this.id()).data(this.columns());
        headerCells.enter().append("th")
            .attr("class", "th_" + this.id())
            .attr("id", function (d, i) { return "c" + context.id() + "_" + i; })
        ;
        headerCells
            .text(function (d) { return d; })
        ;

        var rows = this._tableBody.selectAll(".tr_" + this.id()).data(this.data());
        rows.enter().append("tr")
            .attr("class", "tr_" + this.id())
        ;
        var cells = rows.selectAll(".td_" + this.id()).data(function(d) {return d;});
        cells.enter().append("td")
            .attr("class", "td_" + this.id())
            .attr("headers", function (d, i) { return "c" + context.id() + "_" + i; })
            .text(function (d) { return d; })
        ;
    };

    ARIATable.prototype.click = function (row, column, selected) {
        console.log("click:  " + JSON.stringify(row, replacer) + ", " + column + "," + selected);
    };

    ARIATable.prototype.dblclick = function (row, column, selected) {
        console.log("dblclick:  " + JSON.stringify(row, replacer) + ", " + column + "," + selected);
    };

    return ARIATable;
}));
