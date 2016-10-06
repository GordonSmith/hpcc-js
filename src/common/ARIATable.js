"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "css!./ARIATable"], factory);
    } else {
        root.common_ARIATable = factory(root.d3, root.common_HTMLWidget);
    }
}(this, function (d3, HTMLWidget) {
    return function (id, element, columns, data) {
        var root = columns ? ["dummy"] : [];
        var table = element.selectAll("table").data(root);
        table.enter().append("table")
            .attr("class", "common_ARIATable")
            .each(function (d) {
                var element = d3.select(this);
                element.append("thead").append("tr");
                element.append("tbody");
            })
        ;
        var _tableHeader = table.select("thead > tr");
        var headerCells = _tableHeader.selectAll(".th_" + id).data(columns);
        headerCells.enter().append("th")
            .attr("class", "th_" + id)
            .attr("id", function (d, i) { return "c" + id + "_" + i; })
        ;
        headerCells
            .text(function (d) { return d; })
        ;
        headerCells.exit().remove();

        var _tableBody = table.select("tbody");
        var rows = _tableBody.selectAll(".tr_" + id).data(data);
        rows.enter().append("tr")
            .attr("class", "tr_" + id)
        ;
        var cells = rows.selectAll(".td_" + id).data(function (d) { return d; });
        cells.enter().append("td")
            .attr("class", "td_" + id)
            .attr("headers", function (d, i) { return "c" + id + "_" + i; })
        ;
        cells
            .text(function (d) { return d; })
        ;
        cells.exit().remove();

        rows.exit().remove();

        table.exit().remove();
    };
}));
