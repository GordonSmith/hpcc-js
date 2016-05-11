"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/SVGWidget", "../api/ITree", "css!./CircularDendrogram"], factory);
    } else {
        root.tree_CircularDendrogram = factory(root.d3, root.common_SVGWidget, root.api_ITree);
    }
}(this, function (d3, SVGWidget, ITree) {
    function CircularDendrogram(target) {
        SVGWidget.call(this);
        ITree.call(this);

        this._drawStartPos = "origin";
        this._maxTextWidth = 0;
    }
    CircularDendrogram.prototype = Object.create(SVGWidget.prototype);
    CircularDendrogram.prototype.constructor = CircularDendrogram;
    CircularDendrogram.prototype._class += " tree_CircularDendrogram";
    CircularDendrogram.prototype.implements(ITree.prototype);

    CircularDendrogram.prototype.publish("paletteID", "default", "set", "Palette ID", CircularDendrogram.prototype._palette.switch(),{tags:["Basic","Shared"]});
    CircularDendrogram.prototype.publish("textOffset", 8, "number", "Text offset from circle",null,{tags:["Private"]});
    CircularDendrogram.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette",null,{tags:["Intermediate","Shared"]});

    CircularDendrogram.prototype.enter = function (domNode, element) {
        SVGWidget.prototype.enter.apply(this, arguments);

        this._container = element.append("div");
    };

    CircularDendrogram.prototype.update = function (domNode, element, secondPass) {
        var context = this;
        SVGWidget.prototype.update.apply(this, arguments);

        debugger;

        var w = this.width(),
            h = this.height(),
            rx = w / 2,
            ry = h / 2,
            m0,
            rotate = 0;

        var cluster = d3.layout.cluster()
            .size([360, ry - 120])
            .sort(null);

        var diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        var min = (w < h) ? w : h;

        var svg = this._container
            .style("width", min + "px")
            .style("height", min + "px");

        var vis = svg.append("svg:svg")
            .attr("width", min)
            .attr("height", min)
            .append("svg:g")
            .attr("transform", "translate(" + rx + "," + ry + ")");

        vis.append("svg:path")
            .attr("class", "arc")
            .attr("d", d3.svg.arc().innerRadius(ry - 120).outerRadius(ry).startAngle(0).endAngle(2 * Math.PI));
            //.on("mousedown", mousedown);

        d3.json("../src/tree/flare.json", function(json) {
            var nodes = cluster.nodes(json);

            var link = vis.selectAll("path.link")
                .data(cluster.links(nodes))
                .enter().append("svg:path")
                .attr("class", "link")
                .attr("d", diagonal);

            var node = vis.selectAll("g.node")
                .data(nodes)
                .enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

            node.append("svg:circle")
                .attr("r", 3);

            node.append("svg:text")
                .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
                .attr("dy", ".31em")
                .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
                .text(function(d) { return d.name; });
        });

        //d3.select(window)
        //    .on("mousemove", mousemove)
        //    .on("mouseup", mouseup);

        function mouse(e) {
            return [e.pageX - rx, e.pageY - ry];
        }

        function mousedown() {
            m0 = mouse(d3.event);
            d3.event.preventDefault();
        }

        function mousemove() {
            if (m0) {
                var m1 = mouse(d3.event),
                    dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI,
                    tx = "translate3d(0," + (ry - rx) + "px,0)rotate3d(0,0,0," + dm + "deg)translate3d(0," + (rx - ry) + "px,0)";
                svg
                    .style("-moz-transform", tx)
                    .style("-ms-transform", tx)
                    .style("-webkit-transform", tx);
            }
        }

        function mouseup() {
            if (m0) {
                var m1 = mouse(d3.event),
                    dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI,
                    tx = "rotate3d(0,0,0,0deg)";

                rotate += dm;
                if (rotate > 360) rotate -= 360;
                else if (rotate < 0) rotate += 360;
                m0 = null;

                svg
                    .style("-moz-transform", tx)
                    .style("-ms-transform", tx)
                    .style("-webkit-transform", tx);

                vis
                    .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
                    .selectAll("g.node text")
                    .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
                    .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
                    .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
            }
        }

        function cross(a, b) {
            return a[0] * b[1] - a[1] * b[0];
        }

        function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1];
        }











    };

    CircularDendrogram.prototype.exit = function (domNode, element) {
        SVGWidget.prototype.exit.apply(this, arguments);
    };

    return CircularDendrogram;
}));
