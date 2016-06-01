"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["src/other/Table", "src/chart/Column", "json!../data/CJA07.json"], factory);
    }
}(this, function (Table, Column, j) {
    var stats = JSONstat(j);
    var len = stats.length;
    for (var i = 0; i < len; ++i) {
        var ids = stats.Dataset(i).id;
        var dimensionMap = {};
        var dimensions = ids.map(function (id) {
            var retVal = stats.Dataset(i).Dimension(id);
            dimensionMap[retVal.label] = retVal;
            var test = retVal.Category(0);
            return retVal;
        });
    }

    var t2 = stats.Dataset(0).Data(0);
    var data = stats.Dataset(0).toTable();
    var col = new Table()
        .target("col")
        .pagination(true)
        .columns(data[0])
        .data(data.filter(function (row, idx) { return idx > 0; }))
        .render()
        ;
    return function () {
        col
            .resize()
            .render()
        ;
    }
}));