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

        this._drawStartPos = "center";
        this._maxTextWidth = 0;
    }
    CircularDendrogram.prototype = Object.create(SVGWidget.prototype);
    CircularDendrogram.prototype.constructor = CircularDendrogram;
    CircularDendrogram.prototype._class += " tree_CircularDendrogram";
    CircularDendrogram.prototype.implements(ITree.prototype);

    CircularDendrogram.prototype.publish("paletteID", "default", "set", "Palette ID", CircularDendrogram.prototype._palette.switch(),{tags:["Basic","Shared"]});
    CircularDendrogram.prototype.publish("textOffset", 8, "number", "Text offset from circle",null,{tags:["Private"]});
    CircularDendrogram.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette",null,{tags:["Intermediate","Shared"]});
    CircularDendrogram.prototype.publish("radius", 360, "number", "Enable or disable using a cloned palette",null,{tags:["Intermediate","Shared"]});

    CircularDendrogram.prototype.enter = function (domNode, element) {
        SVGWidget.prototype.enter.apply(this, arguments);
        this._path = element.append("svg:path");
        this._svg = this._parentElement;
        this._element = element;
    };

    CircularDendrogram.prototype.update = function (domNode, element) {
        SVGWidget.prototype.update.apply(this, arguments);

        var w = this.width(),
            h = this.height(),
            m0,
            rx = w / 2,
            ry = h / 2,
            rotate = 0,
            svg = this._svg,
            vis = this._element;

        var cluster = d3.layout.cluster()
            .size([this.radius(), ry - 120])
            .sort(null);

        var diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        console.log('width: ' + w);
        console.log('height: ' + h);

        this._path
            .attr("class", "arc")
            .attr("d", d3.svg.arc().innerRadius(ry - 120).outerRadius(ry).startAngle(0).endAngle(2 * Math.PI))
            .on("mousedown", mousedown);

        var json = this.data();

        var nodes = cluster.nodes(json);

        var link = element.selectAll("path.link")
            .data(cluster.links(nodes));

        link.enter().append("svg:path")
            .attr("class", "link");

        link.each(function () {
            var l = d3.select(this);
            l.transition()
                .duration(500)
                .attr("d", diagonal);
        });

        var node = element.selectAll("g.node")
            .data(nodes);

        var g = node.enter().append("svg:g");

        g.each(function () {
            var ge = d3.select(this);

            ge.append("svg:circle")
                .attr("r", 3);

            ge.append("svg:text")
                .attr("dy", ".31em")
                .text(function(d) { return d.name; });
        });

        node.each(function () {
            var ge = d3.select(this);

            ge.attr("class", "node")
                .transition()
                .duration(500)
                .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

            ge.select("text")
                .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
                .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; });
        });

        d3.select(window)
            .on("mousemove", mousemove)
            .on("mouseup", mouseup);


        link.exit().remove();
        node.exit().remove();

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
                    .transition()
                    .duration(500)
                    .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")");

                vis
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
