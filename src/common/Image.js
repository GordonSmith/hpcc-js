var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./HTMLWidget"], function (require, exports, HTMLWidget_1) {
    "use strict";
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image() {
            _super.call(this);
            HTMLWidget_1.HTMLWidget.call(this);
            this._drawStartPos = "center";
        }
        return Image;
    }(HTMLWidget_1.HTMLWidget));
    exports.Image = Image;
    Image.prototype._class += " common_Image";
    Image.prototype.publish("source", null, "string", "Image Source", null, { tags: ["Basic"] });
    Image.prototype.publish("sizing", "actual", "set", "Controls sizing mode", ["actual", "fit", "custom"], { tags: ["Basic"] });
    Image.prototype.publish("customWidth", "50%", "string", "Applies this width to IMG element if 'sizing' is set to 'custom'", null, { tags: ["Basic"], disable: function (w) { return w.sizing() !== "custom"; } });
    Image.prototype.publish("customHeight", "20%", "string", "Applies this height to IMG element if 'sizing' is set to 'custom'", null, { tags: ["Basic"], disable: function (w) { return w.sizing() !== "custom"; } });
    Image.prototype.publish("lockAspectRatio", true, "boolean", "Locks the aspect ratio when scaling/stretching", null, { tags: ["Basic"], disable: function (w) { return w.sizing() !== "fit"; } });
    Image.prototype.publish("alignment", "center", "set", "Image Alignment", ["center", "origin"], { tags: ["Basic"] });
    Image.prototype.enter = function (domNode, element) {
        HTMLWidget_1.HTMLWidget.prototype.enter.apply(this, arguments);
    };
    Image.prototype.update = function (domNode, element) {
        this._drawStartPos = this.alignment();
        HTMLWidget_1.HTMLWidget.prototype.update.apply(this, arguments);
        var context = this;
        var img = element.selectAll("img").data(this.source() ? [this.source()] : [], function (d) { return d; });
        img.enter()
            .append("img")
            .attr("src", this.source())
            .on("load", function (d) {
            img.style(context.calcSize());
        });
        img.style(this.calcSize());
        img.exit()
            .remove();
    };
    Image.prototype.calcSize = function () {
        var retVal = {
            width: "auto",
            height: "auto"
        };
        switch (this.sizing()) {
            case "fit":
                if (this.lockAspectRatio()) {
                    var img = this.element().select("img");
                    img.style({ width: "auto", height: "auto" });
                    var bbox = img.node().getBoundingClientRect();
                    var xScale = bbox.width / this.width();
                    var yScale = bbox.height / this.height();
                    if (xScale > yScale) {
                        retVal.width = this.width() + "px";
                        retVal.height = (bbox.height / xScale) + "px";
                    }
                    else {
                        retVal.width = (bbox.width / yScale) + "px";
                        retVal.height = this.height() + "px";
                    }
                }
                else {
                    retVal.width = this.width() + "px";
                    retVal.height = this.height() + "px";
                }
                break;
            case "custom":
                retVal.width = this.customWidth();
                retVal.height = this.customHeight();
                break;
        }
        return retVal;
    };
    Image.prototype.exit = function (domNode, element) {
        HTMLWidget_1.HTMLWidget.prototype.exit.apply(this, arguments);
    };
});
//# sourceMappingURL=Image.js.map