"use strict";( function(root, factory) {
        if ( typeof define === "function" && define.amd) {
            define(["d3", "../common/SVGWidget", "../api/ITree", "css!./CollapsibleTree"], factory);
        } else {
            root.tree_Dendrogram = factory(root.d3, root.common_SVGWidget, root.api_ITree);
        }
    }(this, function(d3, SVGWidget, ITree) {
        function CollapsibleTree(target) {
            SVGWidget.call(this);
            ITree.call(this);

            this._drawStartPos = "origin";
            this._maxTextWidth = 0;
        }


        CollapsibleTree.prototype = Object.create(SVGWidget.prototype);
        CollapsibleTree.prototype.constructor = CollapsibleTree;
        CollapsibleTree.prototype._class += " tree_CollapsibleTree";
        CollapsibleTree.prototype.implements(ITree.prototype);

        CollapsibleTree.prototype.enter = function(domNode, element) {
            SVGWidget.prototype.enter.apply(this, arguments);
            this._offsets = [20, 120, 20, 120];
            this.i = 0;

            this._tree = d3.layout.tree();
            this._diagonal = d3.svg.diagonal().projection(function(d) {
                return [d.y, d.x];
            });
            this._svg = element.append("svg");
            this._vis = this._svg.append("g")
                .attr("transform", "translate(" + this._offsets[3] + "," + this._offsets[0] + ")");
        };

        CollapsibleTree.prototype.update = function(domNode, element) {
            SVGWidget.prototype.update.apply(this, arguments);
            var context = this;
            
             
            this._w = this.width() - context._offsets[1] - context._offsets[3];
            this._h = this.height() - context._offsets[0] - context._offsets[2];
            
            this._tree.size([this._h, this._w]);
             
            this._svg.attr("width", this._w + context._offsets[1] + context._offsets[3])
            .attr("height", this._h + context._offsets[0] + context._offsets[2]);
            
            
            
            this._json = this.data();
            this._json.x0 = this._h / 2;
            this._json.y0 = 0;

            function toggleAll(d) {
                if (d.children) {
                    d.children.forEach(toggleAll);
                    toggle(d);
                }
            }

            // Initialize the display to show a few nodes.
            this._json.children.forEach(toggleAll);
            toggle(this._json.children[1]);
            toggle(this._json.children[1].children[2]);
            toggle(this._json.children[9]);
            toggle(this._json.children[9].children[0]);


            update(this._json);
            
            
            
             function update(source) {
            var duration = d3.event && d3.event.altKey ? 5000 : 500;

            // Compute the new tree layout.
            var nodes = context._tree.nodes(context._json).reverse();

            // Normalize for fixed-depth.
            nodes.forEach(function(d) {
                d.y = d.depth * 180;
            });

            // Update the nodes…
            var node = context._vis.selectAll("g.node").data(nodes, function(d) {
                return d.id || (d.id = ++context.i);
            });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            }).on("click", function(d) {
                toggle(d);
                update(d);
            });

            nodeEnter.append("circle").attr("r", 1e-6).style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

            nodeEnter.append("text").attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            }).attr("dy", ".35em").attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            }).text(function(d) {
                return d.name;
            }).style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

            nodeUpdate.select("circle").attr("r", 4.5).style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

            nodeUpdate.select("text").style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            }).remove();

            nodeExit.select("circle").attr("r", 1e-6);

            nodeExit.select("text").style("fill-opacity", 1e-6);

            // Update the links…
            var link = context._vis.selectAll("path.link").data(context._tree.links(nodes), function(d) {
                return d.target.id;
            });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g").attr("class", "link").attr("d", function(d) {
                var o = {
                    x : source.x0,
                    y : source.y0
                };
                return context._diagonal({
                    source : o,
                    target : o
                });
            }).transition().duration(duration).attr("d", context._diagonal);

            // Transition links to their new position.
            link.transition().duration(duration).attr("d", context._diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition().duration(duration).attr("d", function(d) {
                var o = {
                    x : source.x,
                    y : source.y
                };
                return context._diagonal({
                    source : o,
                    target : o
                });
            }).remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Toggle children.
        function toggle(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }
            
        };

        CollapsibleTree.prototype.exit = function(domNode, element) {
            SVGWidget.prototype.exit.apply(this, arguments);
        };

        

       

        return CollapsibleTree;
    }));
