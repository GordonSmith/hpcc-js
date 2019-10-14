var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@hpcc-js/codemirror", "@hpcc-js/phosphor", "./sample.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codemirror_1 = require("@hpcc-js/codemirror");
    var phosphor_1 = require("@hpcc-js/phosphor");
    var sample_js_1 = require("./sample.js");
    var SourceSample = /** @class */ (function (_super) {
        __extends(SourceSample, _super);
        function SourceSample() {
            var _this = _super.call(this, "horizontal") || this;
            _this.jsEditor = new codemirror_1.JSEditor()
                .on("changes", function () {
                _this.sample
                    .data([[_this.infostring(), _this.jsEditor.text()]])
                    .lazyRender();
            });
            _this.sample = new sample_js_1.Sample();
            _this
                .addWidget(_this.jsEditor)
                .addWidget(_this.sample);
            return _this;
        }
        SourceSample.prototype.infostring = function () {
            return this.data()[0][0];
        };
        SourceSample.prototype.text = function () {
            return this.data()[0][1];
        };
        SourceSample.prototype.update = function (domNode, element) {
            this.height(Math.min(Math.max((this.text().split("\n").length + 1) * 14, 180), 320));
            _super.prototype.update.call(this, domNode, element);
            if (this._prevJS !== this.text()) {
                this._prevJS = this.text();
                this.jsEditor.javascript(this.text());
            }
        };
        return SourceSample;
    }(phosphor_1.SplitPanel));
    exports.SourceSample = SourceSample;
});
//# sourceMappingURL=sourceSample.js.map