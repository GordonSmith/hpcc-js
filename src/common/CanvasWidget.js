var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3"], function (require, exports, d3) {
    "use strict";
    var CanvasWidget = (function (_super) {
        __extends(CanvasWidget, _super);
        function CanvasWidget() {
            _super.call(this);
            this._tag = "canvas";
        }
        return CanvasWidget;
    }(Widget));
    exports.CanvasWidget = CanvasWidget;
    CanvasWidget.prototype._class += " common_CanvasWidget";
    CanvasWidget.prototype.resize = function (size) {
        var retVal = Widget.prototype.resize.apply(this, arguments);
        this._parentElement
            .style("width", this._size.width + "px")
            .style("height", this._size.height + "px");
        this._element.attr("width", this._size.width);
        this._element.attr("height", this._size.height);
        return retVal;
    };
    //  Properties  ---
    CanvasWidget.prototype.target = function (_) {
        if (!arguments.length)
            return this._target;
        if (this._target && _) {
            throw "Target can only be assigned once.";
        }
        this._target = _;
        //  Target is a DOM Node ID ---
        if (typeof (this._target) === "string" || this._target instanceof String) {
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
        }
        else {
            this.exit();
        }
        return this;
    };
    CanvasWidget.prototype.exit = function () {
        if (this._parentElement) {
            this._parentElement.remove();
        }
        Widget.prototype.exit.apply(this, arguments);
    };
});
//# sourceMappingURL=CanvasWidget.js.map