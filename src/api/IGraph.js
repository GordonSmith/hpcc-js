/**
 * @file Graph Interface
 * @author HPCC Systems
 */

"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.api_IGraph = factory();
    }
}(this, function () {
    /**
     * @interface api_IGraph
     * @class api_IGraph
     */
    function IGraph() {
    }

    //  Events  ---
    /**
     * @method Overridable click callback function for Graph Vertex (Icon)
     * @memberof api_I1DChart
     * @param {type} row
     * @param {type} column
     * @returns {undefined}
     */
    IGraph.prototype.vertex_click = function (d) {
        console.log("Vertex Click: " + d.id());
    };

    /**
     * @method Overridable click callback function for Graph Edge (Line/Arrow).
     * @memberof api_I1DChart
     * @param {type} row
     * @param {type} column
     * @returns {undefined}
     */
    IGraph.prototype.edge_click = function (d) {
        console.log("Edge Click: " + d.id());
    };

    return IGraph;
}));
