import { HTMLWidget } from "./HTMLWidget";

export class Image extends HTMLWidget {
    static _class = "common_Image";
    constructor() {
        super();

        this._drawStartPos = "center";
    }

    enter(domNode, element) {
        super.enter(domNode, element);
    };

    update(domNode, element) {
        this._drawStartPos = this.alignment();
        super.update(domNode, element);
        var context = this;
        var img = element.selectAll("img").data(this.source() ? [this.source()] : [], function (d) { return d; });
        img.enter()
            .append("img")
            .attr("src", this.source())
            .on("load", function (d) {
                img.style(context.calcSize());
            })
            ;
        img.style(this.calcSize());
        img.exit()
            .remove()
            ;
    };

    calcSize() {
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
                    } else {
                        retVal.width = (bbox.width / yScale) + "px";
                        retVal.height = this.height() + "px";
                    }
                } else {
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

    exit(domNode, element) {
        super.exit(domNode, element);
    };

    source: { (): string; (_: string): Image; }
    sizing: { (): string; (_: string): Image; }
    customWidth: { (): string; (_: string): Image; }
    customHeight: { (): string; (_: string): Image; }
    lockAspectRatio: { (): boolean; (_: boolean): Image; }
    alignment: { (): string; (_: string): Image; }
}
Image.prototype.publish("source", null, "string", "Image Source", null, { tags: ["Basic"] });
Image.prototype.publish("sizing", "actual", "set", "Controls sizing mode", ["actual", "fit", "custom"], { tags: ["Basic"] });
Image.prototype.publish("customWidth", "50%", "string", "Applies this width to IMG element if 'sizing' is set to 'custom'", null, { tags: ["Basic"], disable: function (w) { return w.sizing() !== "custom"; } });
Image.prototype.publish("customHeight", "20%", "string", "Applies this height to IMG element if 'sizing' is set to 'custom'", null, { tags: ["Basic"], disable: function (w) { return w.sizing() !== "custom"; } });
Image.prototype.publish("lockAspectRatio", true, "boolean", "Locks the aspect ratio when scaling/stretching", null, { tags: ["Basic"], disable: function (w) { return w.sizing() !== "fit"; } });
Image.prototype.publish("alignment", "center", "set", "Image Alignment", ["center", "origin"], { tags: ["Basic"] });

