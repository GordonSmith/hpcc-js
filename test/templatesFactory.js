"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.test_templatesFactory = factory();
    }
}(this, function (DataFactory, HeatMap, WordCloud, Table) {
    return {
        HTML: {
            simple: function (callback) {
                require(["test/DataFactory", "templates/HTML"], function (DataFactory, HTML) {
                    callback(new HeatMap()
                        .columns(DataFactory.HeatMap.simple.columns)
                        .data(DataFactory.HeatMap.simple.data)
                    );
                });
            }
        },
        SVG: {
            simple: function (callback) {
                require(["test/DataFactory", "templates/SVG"], function (DataFactory, SVG) {
                    callback(new HeatMap()
                        .columns(DataFactory.HeatMap.simple.columns)
                        .data(DataFactory.HeatMap.simple.data)
                    );
                });
            }
        }

    };
}));
