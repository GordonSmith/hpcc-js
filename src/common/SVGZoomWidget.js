"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "./SVGWidget", "./SVGToolbar", "css!./SVGZoomWidget"], factory);
    } else {
        root.common_SVGZoomWidget = factory(root.d3, root.common_SVGWidget, root.common_SVGToolbar);
    }
}(this, function (d3, SVGWidget, SVGToolbar) {
    function SVGZoomWidget() {
        SVGWidget.call(this);
        this._drawStartPos = "origin";
    }
    SVGZoomWidget.prototype = Object.create(SVGWidget.prototype);
    SVGZoomWidget.prototype.constructor = SVGZoomWidget;
    SVGZoomWidget.prototype._class += " common_SVGZoomWidget";

    SVGZoomWidget.prototype.publish("zoomToolbar", true, "boolean", "Show Zoom Toolbar");
    SVGZoomWidget.prototype.publish("zoomDuration", 250, "number", "Transition Duration");

    SVGZoomWidget.prototype.zoomTo = function (translate, scale, transitionDuration) {
        translate = translate || this._zoom.translate();
        scale = scale || this._zoom.scale();
        transitionDuration = transitionDuration === undefined ? this.zoomDuration() : 0;

        this._zoomElement.transition().duration(transitionDuration)
                .call(this._zoom.translate(translate).scale(scale).event)
        ;
    };

    SVGZoomWidget.prototype.zoomToFit = function (transitionDuration) {
        var bbox = this._renderElement.node().getBBox();
        if (bbox.width && bbox.height) {
            var x = bbox.x + bbox.width / 2;
            var y = bbox.y + bbox.height / 2;
            var dx = bbox.width;
            var dy = bbox.height;
            var width = this.width();
            var height = this.height();

            var scale = 1 / Math.max(dx / width, dy / height);
            var translate = [width / 2 - scale * x, height / 2 - scale * y];
            this.zoomTo(translate, scale, transitionDuration);
        }
    };

    SVGZoomWidget.prototype.enter = function (domNode, element) {
        SVGWidget.prototype.enter.apply(this, arguments);

        this._zoomElement = element.append("g");
        this._zoomGrab = this._zoomElement.append("rect")
            .attr("class", "background")
        ;
        this._zoomG = this._zoomElement.append("g");
        this._renderElement = this._zoomG.append("g");

        var context = this;
        this._zoom = d3.behavior.zoom()
            .scaleExtent([0.05, 20])
            .on("zoom", function () {
                context._zoomG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            })
        ;
        this._zoomElement.call(this._zoom);

        var context = this;
        this._toolbar = new SVGToolbar()
            .target(domNode)
            .orientation("vertical")
            .content([
                new SVGToolbar.prototype.Icon()
                    .faChar("\uf0b2")
                    .shape("square")
                    .tooltip("Zoom to fit")
                    .on("click", function () {
                        context.zoomToFit();
                    }),
                new SVGToolbar.prototype.Spacer(),
                new SVGToolbar.prototype.Icon()
                    .faChar("\uf067")
                    .shape("square")
                    .tooltip("Zoom +")
                    .on("click", function () {
                        context.zoomTo(null, context._zoom.scale() * 1.20);
                    }),
                new SVGToolbar.prototype.Icon()
                    .faChar("\uf068")
                    .shape("square")
                    .tooltip("Zoom -")
                    .on("click", function () {
                        context.zoomTo(null, context._zoom.scale() / 1.20);
                    })
            ])
        ;
    };

    SVGZoomWidget.prototype.update = function (domNode, element) {
        SVGWidget.prototype.update.apply(this, arguments);

        this._zoomGrab
            .attr("width", this.width())
            .attr("height", this.height())
        ;

        this._toolbar
            .display(this.zoomToolbar())
            .render()
        ;
        var toolbarBBox = this._toolbar.getBBox();
        this._toolbar
            .move({ x: this.width() - toolbarBBox.width - 4, y: 4 })
        ;
    };
    SVGZoomWidget.prototype.exit = function (domNode, element) {
        this._toolbar
            .target(null)
        ;
        SVGWidget.prototype.exit.apply(this, arguments);
    };

    return SVGZoomWidget;
}));
