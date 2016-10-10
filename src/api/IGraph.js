define(["require", "exports"], function (require, exports) {
    "use strict";
    var IGraph = (function () {
        function IGraph() {
        }
        return IGraph;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = IGraph;
    //  Events  ---
    IGraph.prototype.vertex_click = function (row, col, sel, more) {
        if (more && more.vertex) {
            console.log("Vertex click: " + more.vertex.id());
        }
    };
    IGraph.prototype.vertex_dblclick = function (row, col, sel, more) {
        if (more && more.vertex) {
            console.log("Vertex double click: " + more.vertex.id());
        }
    };
    IGraph.prototype.edge_click = function (row, col, sel, more) {
        if (more && more.edge) {
            console.log("Edge click: " + more.edge.id());
        }
    };
    IGraph.prototype.edge_dblclick = function (row, col, sel, more) {
        if (more && more.edge) {
            console.log("Edge double click: " + more.edge.id());
        }
    };
});
//# sourceMappingURL=IGraph.js.map