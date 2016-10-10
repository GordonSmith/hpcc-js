import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";

export default {
    entry: "es6/chart",
    format: "amd",
    moduleName: "chart",
    dest: "dist/hpcc-viz-chart.js",
    sourceMap: true,

    plugins: [json(), babel()],

    external: ["d3", "c3", "colorbrewer", "dagre", "topojson", "d3-cloud", "font-awesome", "amcharts", "es6-promise", "amcharts.funnel", "amcharts.gauge", "amcharts.pie", "amcharts.radar", "amcharts.serial", "amcharts.xy", "amcharts.gantt", "amcharts.plugins.responsive", "simpleheat", "d3-hexbin", "d3-tip", "d3-bullet", "d3-sankey", "autoComplete", "handsontable", "grid-list"],

    paths: {
        //d3: "https://d3js.org/d3.v4.min.js"
    }
};
