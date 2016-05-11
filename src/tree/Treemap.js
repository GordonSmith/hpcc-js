"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "../api/ITree", "css!./Treemap"], factory);
    } else {
        root.tree_Treemap = factory(root.d3, root.common_HTMLWidget);
    }
}(this, function (d3, HTMLWidget, ITree) {
    function Treemap(target) {
        HTMLWidget.call(this);
        ITree.call(this);
        this._tag = "div";
    }
    Treemap.prototype = Object.create(HTMLWidget.prototype);
    Treemap.prototype.constructor = Treemap;
    Treemap.prototype._class += " tree_Treemap";
    Treemap.prototype.implements(ITree.prototype);

    Treemap.prototype.publish("paletteID", "default", "set", "Palette ID", Treemap.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
    Treemap.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });

    Treemap.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        this.myroot = element.append("div");
    };

    Treemap.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        var width = this.width();
        var height = this.height();
        var context = this;

        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }
        
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
            .attr("opacity", 0)
        ;
        node.transition().duration(1000)
            .attr("opacity",1)
            .call(position)
                .style("background", function (d) { return d.children ? context._palette(d.label) : null; })
                .text(function (d) { return d.children ? null : d.label; })
        ;
        node.exit().remove();

        function position() {
            this
                .style("left", function (d) { return d.x + "px"; })
                .style("top", function (d) { return d.y + "px"; })
                .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
                .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; })
            ;
        }
    };

    Treemap.prototype.exit = function (domNode, element) {
        HTMLWidget.prototype.exit.apply(this, arguments);
    };
    return Treemap;
}));
