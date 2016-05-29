"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["../common/SVGWidget", "../common/Icon"], factory);
    } else {
        root.common_SVGZoomWidget = factory(root.common_SVGWidget, root.common_Icon);
    }
}(this, function (SVGWidget, Icon) {
    function Spacer() {
        Icon.call(this);

        this
            .faChar("")
            .shape("square")
            .shape_colorFill("white")
            .shape_colorStroke("white")
            .shape_opacity(0)
        ;
    }
    Spacer.prototype = Object.create(Icon.prototype);
    Spacer.prototype.constructor = Spacer;
    Spacer.prototype._class += " common_SVGToolbar.Spacer";

    //  ===
    function SVGToolbar() {
        SVGWidget.call(this);

    }
    SVGToolbar.prototype = Object.create(SVGWidget.prototype);
    SVGToolbar.prototype.constructor = SVGToolbar;
    SVGToolbar.prototype._class += " common_SVGToolbar";
    SVGToolbar.prototype.Spacer = Spacer;
    SVGToolbar.prototype.Icon = Icon;

    SVGToolbar.prototype.publish("orientation", "horizontal", "set", "Orientation", ["horizontal", "vertical"]);
    SVGToolbar.prototype.publish("iconHeight", 10, "number", "Icon Height");
    SVGToolbar.prototype.publish("opacity", 0.33, "number", "Opacity");
    SVGToolbar.prototype.publish("content", [], "widgetArray", "Toolbar Items");

    SVGToolbar.prototype.enter = function (domNode, element) {
        SVGWidget.prototype.enter.apply(this, arguments);
        var context = this;
        element
            .style("opacity", this.opacity())
            .on("mouseover", function (w) {
                w.element().transition()
                    .style("opacity", 1)
                ;
            })
            .on("mouseout", function (w) {
                w.element().transition()
                    .style("opacity", context.opacity())
                ;
            })
        ;
        this.content().forEach(function (w) {
            w.target(domNode);
        });
    };

    SVGToolbar.prototype.update = function (domNode, element) {
        SVGWidget.prototype.update.apply(this, arguments);
        var faCharHeight = this.iconHeight();
        var iconDiameter = this.iconHeight() + 8;

        var isHorizontal = this.orientation() === "horizontal";
        var prevPos = 0;
        this.content().forEach(function (w) {
            var prevXPos = isHorizontal ? prevPos : 0;
            var prevYPos = isHorizontal ? 0 : prevPos;
            if (w instanceof Spacer) {
                w.diameter(iconDiameter / 3);
            } else if (w instanceof Icon) {
                w
                    .diameter(iconDiameter)
                    .paddingPercent((1 - faCharHeight / iconDiameter) * 100)
                ;
            }
            w
                .x(prevXPos + iconDiameter / 2)
                .y(prevYPos + iconDiameter / 2)
                .render()
            ;
            var bbox = w.getBBox();
            prevPos += isHorizontal ? bbox.width : bbox.height;
        }, this);
    };

    SVGToolbar.prototype.exit = function (domNode, element) {
        this.content().forEach(function (w) {
            w.target(null);
        });
        SVGWidget.prototype.exit.apply(this, arguments);
    };

    return SVGToolbar;
}));
