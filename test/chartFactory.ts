﻿import { Column } from "@hpcc-js/chart";
import { range as d3Range } from "d3-array";
import { randomNormal as d3RandomNormal } from "d3-random";
import { DataFactory } from "./DataFactory";
import { es6Require } from "./es6Require";

export const chartFactory = {
    Column: {
        simple: (callback) => {
            callback(new Column()
                .columns(DataFactory.ND.subjects.columns)
                .data(DataFactory.ND.subjects.data)
            );
        },
        longLabels: (callback) => {
            callback(new Column()
                .columns(DataFactory.ND.subjects.columns)
                .data([
                    ["Geography Geography Geography\nGeography Geography", 75, 68, 65],
                    ["English English English\nEnglish English English", 45, 55, 52],
                    ["Math Math Math Math Math\nMath Math Math Math Math", 98, 92, 90],
                    ["Science Science Science\nScience Science Science", 66, 60, 72]
                ])
                .xAxisOverlapMode("wrap")
                // .xAxisLabelRotation(45)
            );
        },
        bar: (callback) => {
            chartFactory.Column.simple(function (widget) {
                widget.orientation("vertical");
                callback(widget);
            });
        },
        ordinalRange: (callback) => {
            callback(new Column()
                .columns(DataFactory.ordinalRange.default.columns)
                .data(DataFactory.ordinalRange.default.data)

                .yAxisType("linear")
                .xAxisType("ordinal")
            );
        },
        linear: (callback) => {
            callback(new Column()
                .columns(DataFactory.linear.default.columns)
                .data(DataFactory.linear.default.data)

                .xAxisType("linear")
                .yAxisType("linear")
            );
        },
        timeX: (callback) => {
            callback(new Column()
                .columns(DataFactory.timeX.default.columns)
                .data(DataFactory.timeX.default.data)

                .xAxisType("time")
                .xAxisTypeTimePattern("%Y-%m-%dT%H:%M:%S")
                .yAxisType("linear")
            );
        },
        timeY: (callback) => {
            callback(new Column()
                .columns(DataFactory.timeY.default.columns)
                .data(DataFactory.timeY.default.data)

                .xAxisType("ordinal")
                .yAxisType("time")
                .yAxisTypeTimePattern("%Y-%m-%d")
            );
        },
    },
    Bar: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Bar"], function (DataFactory, Bar) {
                callback(new Bar()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        },
    },
    Gantt: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Gantt"], function (_DataFactory, Gantt) {
                callback(new Gantt()
                    .yAxisTypeTimePattern("%Y-%m-%d")
                    .columns(["Project", "Date Range"])
                    .data([
                        ["Docs", ["2012-09-09", "2012-10-09"]],
                        ["Coding", ["2011-08-09", "2012-09-09"]],
                        ["Specs", ["2010-07-09", "2011-08-09"]]
                    ])
                );
            });
        }
    },
    Bubble: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Bubble"], function (DataFactory, Bubble) {
                callback(new Bubble()
                    .columns(DataFactory.TwoD.subjects.columns)
                    .data(DataFactory.TwoD.subjects.data)
                );
            });
        }
    },
    Scatter: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Scatter"], function (DataFactory, Scatter) {
                callback(new Scatter()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        }
    },
    HexBin: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/HexBin"], function (DataFactory, HexBin) {
                const randomX = d3RandomNormal(200, 80);
                const randomY = d3RandomNormal(200, 80);
                const points = d3Range(2000).map(function () { return [randomX(), randomY()]; });

                callback(new HexBin()
                    .xAxisType("linear")
                    .yAxisType("linear")
                    .columns(DataFactory.ND.subjects.columns)
                    .data(points)
                );
            });
        }
    },
    Line: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Line"], function (DataFactory, Line) {
                callback(new Line()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        },
        timeX: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Line"], function (DataFactory, Line) {
                callback(new Line()
                    .columns(DataFactory.timeX.default.columns)
                    .data(DataFactory.timeX.default.data)

                    .xAxisType("time")
                    .xAxisTypeTimePattern("%Y-%m-%dT%H:%M:%S")
                    .yAxisType("linear")
                );
            });
        },
        cardinal_interpolation: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Line"], function (DataFactory, Line) {
                callback(new Line()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                    .interpolate("cardinal")
                );
            });
        }
    },
    Area: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Area"], function (DataFactory, Area) {
                callback(new Area()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        }
    },
    Pie: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Pie"], function (DataFactory, Pie) {
                callback(new Pie()
                    .columns(DataFactory.TwoD.subjects.columns)
                    .data(DataFactory.TwoD.subjects.data)
                );
            });
        }
    },
    Step: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Step"], function (DataFactory, Step) {
                callback(new Step()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        }
    },
    Summary: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Summary"], function (_DataFactory, Summary) {
                callback(new Summary()
                    .columns(["Summary", "Score", "Details", "Status", "Icon"])
                    .data([
                        ["Elephants", 22, "<a href='http://www.google.com#q=Elephants'>Big an grey</a>", "grey", "fa-info-circle"],
                        ["Mice", 87, "<a href='http://www.google.com#q=Elephants'>Squeaky</a>", "red", "fa-briefcase"],
                        ["Sheep", 50, "<a href='http://www.google.com#q=Elephants'>Tasty</a>", "green", "fa-info-circle"],
                        ["People", 42, "<a href='http://www.google.com#q=Elephants'>Two Legs</a>", "orange", "fa-briefcase"]
                    ])
                    .iconColumn("Icon")
                    .labelColumn("Summary")
                    .valueColumn("Score")
                    .moreTextColumn("Details")
                    .moreTextHTML(true)
                    .colorFillColumn("Status")
                    .playInterval(1000)
                );
            });
        }
    },
    MultiChart: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/MultiChart"], function (DataFactory, MultiChart) {
                callback(new MultiChart()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        },
        dataBreach: (callback) => {
            es6Require(["test/DataFactory", "src/chart/MultiChart"], function (DataFactory, MultiChart) {
                callback(new MultiChart()
                    .chartType("TABLE")
                    .chartTypeDefaults({
                        pagination: true
                    })
                    .columns(DataFactory.Sample.DataBreach.columns)
                    .data(DataFactory.Sample.DataBreach.data)
                );
            });
        },
        flightPath: (callback) => {
            es6Require(["test/DataFactory", "src/chart/MultiChart"], function (DataFactory, MultiChart) {
                callback(new MultiChart()
                    .chartType("TABLE")
                    .chartTypeDefaults({
                        pagination: true
                    })
                    .columns(DataFactory.Sample.FlightPath.columns)
                    .data(DataFactory.Sample.FlightPath.data)
                );
            });
        },
        stockMarket: (callback) => {
            es6Require(["test/DataFactory", "src/chart/MultiChart"], function (DataFactory, MultiChart) {
                callback(new MultiChart()
                    .chartType("TABLE")
                    .chartTypeDefaults({
                        pagination: true
                    })
                    .columns(DataFactory.Sample.StockMarket.columns)
                    .data(DataFactory.Sample.StockMarket.data)
                );
            });
        }
    },
    MultiChartSurface: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/MultiChartSurface"], function (DataFactory, MultiChartSurface) {
                callback(new MultiChartSurface()
                    .columns(DataFactory.ND.subjects.columns)
                    .data(DataFactory.ND.subjects.data)
                );
            });
        }
    },
    Axis: {
        ordinal: (callback) => {
            es6Require(["src/chart/Axis"], function (Axis) {
                callback(new Axis()
                    .type("ordinal")
                    .ordinals(["Year 1", "Year 2", "Year 3", "Year 4"])
                );
            });
        },
        longLabels: (callback) => {
            es6Require(["src/chart/Axis"], function (Axis) {
                callback(new Axis()
                    .type("ordinal")
                    .ordinals(["Geography-Geography-Geography-Geography-Geography", "English-English-English-English-English-English", "Math-Math-Math-Math-Math-Math-Math-Math-Math-Math", "Science-Science-Science-Science-Science-Science"])
                );
            });
        },
        linear: (callback) => {
            es6Require(["src/chart/Axis"], function (Axis) {
                callback(new Axis()
                    .type("linear")
                    .low(0)
                    .high(100)
                );
            });
        },
        time: (callback) => {
            es6Require(["src/chart/Axis"], function (Axis) {
                callback(new Axis()
                    .type("time")
                    .low("2010-03-15")
                    .high("2012-01-14")
                );
            });
        }
    },
    Bullet: {
        simple: (callback) => {
            es6Require(["test/DataFactory", "src/chart/Bullet"], function (_DataFactory, Bullet) {
                callback(new Bullet()
                    .columns(["title", "subtitle", "ranges", "measures", "markers"])
                    .data([
                        ["Revenue", "US$, in thousands", [150, 225, 300], [220, 270], [250, 25]],
                        ["Profit  ", "%", [20, 25, 30], [21, 23], [26]],
                        ["Order Size", "US$, average", [350, 500, 600], [100, 320], [550]],
                        ["New Customers", "count", [1400, 2000, 2500], [1000, 1650], 2100],
                        ["Satisfaction", "out of 5", [3.5, 4.25, 5], [3.2, 4.7], [4.4]]
                    ])
                    .titleColumn("title")
                    .subtitleColumn("subtitle")
                    .rangesColumn("ranges")
                    .measuresColumn("measures")
                    .markersColumn("markers")
                );
            });
        }
    }
};