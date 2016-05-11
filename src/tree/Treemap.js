"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "css!./Treemap"], factory);
    } else {
        root.tree_Treemap = factory(root.d3, root.common_HTMLWidget);
    }
}(this, function (d3, HTMLWidget) {
    function Treemap(target) {
        HTMLWidget.call(this);
        this._tag = "div";
    }
    Treemap.prototype = Object.create(HTMLWidget.prototype);
    Treemap.prototype.constructor = Treemap;
    Treemap.prototype._class += " tree_Treemap";

    Treemap.prototype.publish("stringProp", "defaultValue", "string", "Sample Property");

    Treemap.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        this.myroot = element.append("div");
    };

    Treemap.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        var width = this.width();
        var height = this.height();
        var color = d3.scale.category20c();

        var treemap = d3.layout.treemap()
            .size([width, height])
            .sticky(true)
            .value(function (d) {
                return d.size || 50;
            });

        var root = this.data();
        var node = this.myroot.datum(root).selectAll(".node").data(treemap.nodes);
        node.enter().append("div")
            .attr("class", "node")
        ;
        node
            .call(position)
                .style("background", function (d) { return d.children ? color(d.label) : null; })
                .text(function (d) { return d.children ? null : d.label; })
        ;
        node.exit().remove();

            d3.selectAll("input").on("change", function change() {
                var value = this.value === "count" ? function () { return 1; } : function (d) {
                    return d.size;
                };

                node
                    .data(treemap.value(value).nodes)
                  .transition()
                    .duration(1500)
                    .call(position);
            });
        
        function position() {
            this.style("left", function (d) { return d.x + "px"; })
                .style("top", function (d) { return d.y + "px"; })
                .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
                .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; });
        }
    };

    Treemap.prototype.exit = function (domNode, element) {
        HTMLWidget.prototype.exit.apply(this, arguments);
    };
    return Treemap;
}));
