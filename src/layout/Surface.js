var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "../common/HTMLWidget", "css!./Surface", "css!font-awesome"], function (require, exports, d3, HTMLWidget_1) {
    "use strict";
    var Surface = (function (_super) {
        __extends(Surface, _super);
        function Surface() {
            _super.call(this);
            this._tag = "div";
            this._surfaceButtons = [];
        }
        return Surface;
    }(HTMLWidget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Surface;
    Surface.prototype._class += " layout_Surface";
    Surface.prototype.publish("title", "", "string", "Title", null, { tags: ["Intermediate"] });
    Surface.prototype.publish("surfaceShadow", false, "boolean", "3D Shadow");
    Surface.prototype.publish("surfaceTitlePadding", null, "number", "Title Padding (px)", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceTitleFontSize", null, "number", "Title Font Size (px)", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceTitleFontColor", null, "html-color", "Title Font Color", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceTitleFontFamily", null, "string", "Title Font Family", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceTitleFontBold", true, "boolean", "Enable Bold Title Font", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceTitleBackgroundColor", null, "html-color", "Title Background Color", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceTitleAlignment", "center", "set", "Title Alignment", ["left", "right", "center"], { tags: ["Basic"] });
    Surface.prototype.publish("surfacePadding", null, "string", "Surface Padding (px)", null, { tags: ["Intermediate"] });
    Surface.prototype.publish("surfaceBackgroundColor", null, "html-color", "Surface Background Color", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceBorderWidth", null, "number", "Surface Border Width (px)", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceBorderColor", null, "html-color", "Surface Border Color", null, { tags: ["Advanced"] });
    Surface.prototype.publish("surfaceBorderRadius", null, "number", "Surface Border Radius (px)", null, { tags: ["Advanced"] });
    Surface.prototype.publish("widget", null, "widget", "Widget", null, { tags: ["Basic"] });
    Surface.prototype.publish("buttonAnnotations", [], "array", "Button Array", null, { tags: ["Private"] });
    Surface.prototype.widgetSize = function (titleDiv, widgetDiv) {
        var width = this.clientWidth();
        var height = this.clientHeight();
        if (this.title()) {
            height -= this.calcHeight(titleDiv);
        }
        height -= this.calcFrameHeight(widgetDiv);
        width -= this.calcFrameWidth(widgetDiv);
        return { width: width, height: height };
    };
    Surface.prototype.enter = function (domNode, element) {
        HTMLWidget_1.default.prototype.enter.apply(this, arguments);
    };
    Surface.prototype.update = function (domNode, element) {
        HTMLWidget_1.default.prototype.update.apply(this, arguments);
        var context = this;
        element
            .classed("shadow2", this.surfaceShadow())
            .style("border-width", this.surfaceBorderWidth_exists() ? this.surfaceBorderWidth() + "px" : null)
            .style("border-color", this.surfaceBorderColor())
            .style("border-radius", this.surfaceBorderRadius_exists() ? this.surfaceBorderRadius() + "px" : null)
            .style("background-color", this.surfaceBackgroundColor());
        var titles = element.selectAll(".surfaceTitle").data(this.title() ? [this.title()] : []);
        titles.enter().insert("h3", "div")
            .attr("class", "surfaceTitle");
        titles
            .text(function (d) { return d; })
            .style("text-align", this.surfaceTitleAlignment())
            .style("color", this.surfaceTitleFontColor())
            .style("font-size", this.surfaceTitleFontSize_exists() ? this.surfaceTitleFontSize() + "px" : null)
            .style("font-family", this.surfaceTitleFontFamily())
            .style("font-weight", this.surfaceTitleFontBold() ? "bold" : "normal")
            .style("background-color", this.surfaceTitleBackgroundColor())
            .style("padding", this.surfaceTitlePadding_exists() ? this.surfaceTitlePadding() + "px" : null);
        titles.exit().remove();
        var surfaceTitle = element.select(".surfaceTitle");
        var surfaceButtons = surfaceTitle.append("div").attr("class", "html-button-container").selectAll(".surface-button").data(this.buttonAnnotations());
        surfaceButtons.enter().append("button").classed("surface-button", true)
            .each(function (button, idx) {
            var el = context._surfaceButtons[idx] = d3.select(this)
                .attr("class", "surface-button" + (button.class ? " " + button.class : ""))
                .attr("id", button.id)
                .style("padding", button.padding)
                .style("width", button.width)
                .style("height", button.height)
                .style("cursor", "pointer");
            if (button.font === "FontAwesome") {
                el
                    .style("background", "transparent")
                    .style("border", "none")
                    .on("click", function (d) { context.click(d); })
                    .append("i")
                    .attr("class", "fa")
                    .text(function (d) { return button.label; });
            }
            else {
                el
                    .text(function (d) { return button.label; })
                    .on("click", function (d) { context.click(d); });
            }
        });
        surfaceButtons.exit()
            .each(function (d, idx) {
            var element = d3.select(this);
            delete context._surfaceButtons[idx];
            element.remove();
        });
        var widgets = element.selectAll("#" + this._id + " > .surfaceWidget").data(this.widget() ? [this.widget()] : [], function (d) { return d._id; });
        widgets.enter().append("div")
            .attr("class", "surfaceWidget")
            .each(function (d) {
            d3.select(context.element().node().parentElement).classed("content-icon content-icon-" + (d.classID().split("_")[1]), true);
            d.target(this);
        });
        widgets
            .style("padding", this.surfacePadding_exists() ? this.surfacePadding() + "px" : null)
            .each(function (d) {
            var widgetSize = context.widgetSize(element.select("h3"), d3.select(this));
            if (widgetSize.width < 0)
                widgetSize.width = 0;
            if (widgetSize.height < 0)
                widgetSize.height = 0;
            d
                .resize({ width: widgetSize.width, height: widgetSize.height });
        });
        widgets.exit().each(function (d) {
            d.target(null);
        }).remove();
    };
    Surface.prototype.exit = function (domNode, element) {
        if (this.widget()) {
            this.widget(null);
            this.render();
        }
        HTMLWidget_1.default.prototype.exit.apply(this, arguments);
    };
    Surface.prototype.click = function (obj) {
        console.log("Clicked: " + obj.id);
    };
});
//# sourceMappingURL=Surface.js.map