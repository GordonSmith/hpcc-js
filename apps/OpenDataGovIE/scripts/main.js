"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["src/other/Table", "src/chart/Column", "json!./CJA07.json"], factory);
    }
}(this, function (Table, Column, j) {
    JSONstat("http://www.cso.ie/StatbankServices/StatbankServices.svc/jsonservice/responseinstance/CJA07", function () {
        var d = 0;
    });
    var stats = JSONstat(j);
    var len = stats.length;
    for (var i = 0; i < len; ++i) {
        var ids = stats.Dataset(i).id;
        var dimensionMap = {};
        var dimensions = ids.map(function (id) {
            var retVal = stats.Dataset(i).Dimension(id);
            dimensionMap[retVal.label] = retVal;
            var test = retVal.Category(0).label;
            return retVal;
        });
    }

    var data = stats.Dataset(0).toTable();
    var col = new Table()
        .target("col")
        .pagination(true)
        .columns(ids)
        //.data(data)
        .render()
    ;

    return function () {
        col
            .resize()
            .render()
        ;
    }
}));