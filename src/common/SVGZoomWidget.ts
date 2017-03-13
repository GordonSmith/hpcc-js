import "./SVGZoomWidget.css";
import { event as d3Event } from "d3-selection";
import { zoom as d3Zoom } from "d3-zoom";
import { SVGWidget } from "./SVGWidget";
import { Icon } from "./Icon";
import "css!./SVGZoomWidget.css";

export class SVGZoomWidget extends SVGWidget {

    protected _renderElement;

    protected _zoom;
    protected _zoomElement;
    protected _zoomGrab;
    protected _zoomG;

    protected _buttonToFit;
    protected _buttonPlus;
    protected _buttonMinus;
    protected _buttonLast;

    constructor() {
        super();
    }

    zoomTo(translate, scale, transitionDuration?) {
        translate = translate || this._zoom.translate();
        scale = scale || this._zoom.scale();
        transitionDuration = transitionDuration === undefined ? this.zoomDuration() : 0;

        this._zoomElement.transition().duration(transitionDuration)
            .call(this._zoom.translate(translate).scale(scale).event)
            ;
    };

    zoomToFit(transitionDuration?) {
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

    enter(domNode, element) {
        super.enter(domNode, element);

        this._zoomElement = element.append("g");
        this._zoomGrab = this._zoomElement.append("rect")
            .attr("class", "background")
            ;
        this._zoomG = this._zoomElement.append("g");
        this._renderElement = this._zoomG.append("g");

        var context = this;
        this._zoom = d3Zoom()
            .scaleExtent([0.05, 20])
            .on("zoom", function () {
                context._zoomG.attr("transform", "translate(" + d3Event.translate + ")scale(" + d3Event.scale + ")");
            })
            ;
        this._zoomElement.call(this._zoom);
    };

    update(domNode, element) {
        super.update(domNode, element);

        this._zoomGrab
            .attr("width", this.width())
            .attr("height", this.height())
            ;

        var context = this;
        var toolbar = element.selectAll(".toolbar").data(this.zoomToolbar() ? ["dummy"] : []);
        var iconDiameter = 24;
        var faCharHeight = 14;
        toolbar.enter().append("g")
            .attr("class", "toolbar")
            .each(function () {
                context._buttonToFit = new Icon()
                    .target(this)
                    .faChar("\uf0b2")
                    .shape("square")
                    .diameter(iconDiameter)
                    .paddingPercent((1 - faCharHeight / iconDiameter) * 100)
                    .on("click", function () {
                        context.zoomToFit();
                    })
                    ;
                context._buttonPlus = new Icon()
                    .target(this)
                    .faChar("\uf067")
                    .shape("square")
                    .diameter(iconDiameter)
                    .paddingPercent((1 - faCharHeight / iconDiameter) * 100)
                    .on("click", function () {
                        context.zoomTo(null, context._zoom.scale() * 1.20);
                    })
                    ;
                context._buttonMinus = new Icon()
                    .target(this)
                    .faChar("\uf068")
                    .shape("square")
                    .diameter(iconDiameter)
                    .paddingPercent((1 - faCharHeight / iconDiameter) * 100)
                    .on("click", function () {
                        context.zoomTo(null, context._zoom.scale() / 1.20);
                    })
                    ;
                context._buttonLast = context._buttonMinus;
            })
            ;
        if (this.zoomToolbar()) {
            this._buttonToFit
                .x(this.width() - iconDiameter / 2 - 4)
                .y(iconDiameter / 2 + 4)
                .render()
                ;
            this._buttonPlus
                .x(this.width() - iconDiameter / 2 - 4)
                .y(this._buttonToFit.y() + 4 + iconDiameter)
                .render()
                ;
            this._buttonMinus
                .x(this.width() - iconDiameter / 2 - 4)
                .y(this._buttonPlus.y() + iconDiameter)
                .render()
                ;
        }
        toolbar.exit()
            .each(function () {
                context._buttonToFit
                    .target(null)
                    .render()
                    ;
                delete context._buttonToFit;
            })
            .remove()
            ;
    };

    exit(domNode, element) {
        super.exit(domNode, element);
    };

    zoomToolbar: { (): boolean; (_: boolean): SVGZoomWidget; }
    zoomDuration: { (): number; (_: number): SVGZoomWidget; }
}
SVGZoomWidget.prototype._class += " common_SVGZoomWidget";

SVGZoomWidget.prototype.publish("zoomToolbar", true, "boolean", "Show Zoom Toolbar");
SVGZoomWidget.prototype.publish("zoomDuration", 250, "number", "Transition Duration");

