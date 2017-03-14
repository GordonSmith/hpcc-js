import { hierarchy as d3Hierarchy, pack as d3Pack } from "d3-hierarchy";
import { interpolateZoom as d3InterpolateZoom } from "d3-interpolate";
import { event as d3Event, select as d3Select } from "d3-selection";
import { ITree } from "../api/ITree";
import { SVGWidget } from "../common/SVGWidget";
import "./CirclePacking.css";

export class CirclePacking extends SVGWidget {
    diameter;
    pack;
    svg;
    circle;
    view;
    protected _node;

    constructor() {
        super();
        ITree.call(this);
    }

    enter(_domNode, element) {
        this.diameter = Math.min(this.width(), this.height());

        this.pack = d3Pack()
            .size([this.diameter - 4, this.diameter - 4])
            .padding(1.5)
            ;

        this.svg = element
            .append("g")
            .attr("transform", "rotate(30)")
            ;
    };

    update(_domNode, _element) {
        const context = this;
        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        this.svg.selectAll("circle").remove();
        this.svg.selectAll("text").remove();

        const root: any = d3Hierarchy(this.data())
            .sum(function () {
                return 1;
            }).sort(function (a, b) {
                return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
            })
            ;
        const focus = root;
        this.pack(root);

        this.circle = this.svg.selectAll("circle").data(root.descendants())
            .enter().append("circle")
            .attr("class", function (d) { return d.parent ? d.children ? "node" : "node leaf" : "node root"; })
            .style("fill", function (d) { return context._palette(d.data.label); })
            .on("click", function (d) { context.click(d.data, null, null); })
            .on("dblclick", function (d) {
                if (focus !== d) {
                    context.zoom(d);
                }
                d3Event.stopPropagation();
            })
            ;
        this.circle.append("title").text(function (d) { return d.data.label; });

        this.svg.selectAll("text").data(root.descendants())
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
            .style("display", function (d) { return d.parent === root ? null : "none"; })
            .text(function (d) { return d.data.label; })
            ;

        this._node = this.svg.selectAll("circle,text");

        this.zoomTo([root.x, root.y, root.r * 2]);
    };

    zoom(d2) {
        const context = this;
        const focus = d2;

        this.svg.selectAll("circle")
            .filter(function (d) { return d === focus; })
            ;
        const zoomTextSel = this.svg.selectAll("text")
            .filter(function (d) { return d !== focus && this.style.display === "inline"; })
            ;
        zoomTextSel.transition().duration(500)
            .style("opacity", 0)
            .each("end", function (d) {
                if (d !== focus) {
                    d3Select(this)
                        .style("display", "none")
                        .style("opacity", 1)
                        ;
                }
            })
            ;

        const transition = this.svg.transition()
            .duration(1000)
            .tween("zoom", function () {
                const i = d3InterpolateZoom(context.view, [focus.x, focus.y, focus.r * 2]);
                return function (t) { context.zoomTo(i(t)); };
            });

        transition.selectAll("text")
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
            .each("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
            .each("end", function (d) {
                if (d.parent !== focus) {
                    this.style.display = "none";
                }
            })
            ;
    };

    zoomTo(v) {
        const k = this.diameter / v[2];
        this.view = v;
        this._node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")rotate(-30)"; });
        this.circle.attr("r", function (d) { return d.r * k; });
    };

    paletteID: (_?: string) => string | CirclePacking;
    useClonedPalette: (_?: boolean) => boolean | CirclePacking;

    //  I2DChart
    _palette;
    click: (row, column, selected) => void;
    dblclick: (row, column, selected) => void;
}
CirclePacking.prototype._class += " tree_CirclePacking";
CirclePacking.prototype.implements(ITree.prototype);

CirclePacking.prototype.publish("paletteID", "default", "set", "Palette ID", CirclePacking.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
CirclePacking.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });
