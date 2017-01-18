import * as d3 from "d3";
import { Widget } from "./Widget";

export class CanvasWidget extends Widget {
    static _class = "common_CanvasWidget";

    protected _tag = "canvas";

    constructor() {
        super();
    }

    resize(size) {
        var retVal = super.resize(size);
        this._parentElement
            .style("width", this._size.width + "px")
            .style("height", this._size.height + "px")
            ;
        this._element.attr("width", this._size.width);
        this._element.attr("height", this._size.height);
        return retVal;
    };

    //  Properties  ---
    target(_) {
        if (!arguments.length) return this._target;
        if (this._target && _) {
            throw "Target can only be assigned once.";
        }
        this._target = _;

        //  Target is a DOM Node ID ---
        if (typeof (this._target) === "string") {
            this._target = document.getElementById(this._target);
        }

        if (this._target) {
            this._parentElement = d3.select(this._target);
            if (!this._size.width && !this._size.height) {
                var width = parseFloat(this._parentElement.style("width"));
                var height = parseFloat(this._parentElement.style("height"));
                this.size({
                    width: width,
                    height: height
                });
                this.resize(this._size);
            }
        } else {
            this.exit();
        }

        return this;
    };

    exit(domeNode?, element?) {
        if (this._parentElement) {
            this._parentElement.remove();
        }
        super.exit(domeNode, element);
    };
}