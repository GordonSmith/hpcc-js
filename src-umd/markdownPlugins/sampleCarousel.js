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
        define(["require", "exports", "@hpcc-js/common", "@hpcc-js/layout", "d3-fetch", "https://raw.githack.com/hpcc-systems/Visualization/master/demos/gallery/src-umd/config.js", "./sample.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@hpcc-js/common");
    var layout_1 = require("@hpcc-js/layout");
    var d3_fetch_1 = require("d3-fetch");
    // @ts-ignore
    var config = require("https://raw.githack.com/hpcc-systems/Visualization/master/demos/gallery/src-umd/config.js");
    var sample_js_1 = require("./sample.js");
    var samplePath = "https://raw.githack.com/hpcc-systems/Visualization/master/demos/gallery/";
    var SampleCarousel = /** @class */ (function (_super) {
        __extends(SampleCarousel, _super);
        function SampleCarousel() {
            var _this = _super.call(this) || this;
            _this._samples = [];
            _this._sampleWidgets = [];
            _this._sampleCarousel = new layout_1.Carousel();
            _this._prevButton = new common_1.Button()
                .faChar("fa-step-backward")
                .on("click", function () {
                _this.decIdx();
                _this.renderSample();
            });
            _this._playPauseButton = new common_1.Button()
                .faChar("fa-pause")
                .on("click", function () {
                _this._playPauseButton.faChar(_this.isPaused() ? "fa-pause" : "fa-play").lazyRender();
            });
            _this._nextButton = new common_1.Button()
                .faChar("fa-step-forward")
                .on("click", function () {
                _this.incIdx();
                _this.renderSample();
            });
            _this._idx = -1;
            _this.visit(config.samples);
            _this.shuffle();
            _this._sampleWidgets = [];
            _this._sampleCarousel.widgets(_this._sampleWidgets);
            _this
                .buttons([_this._prevButton, _this._playPauseButton, _this._nextButton])
                .titleFontSize(16)
                .widget(_this._sampleCarousel);
            return _this;
        }
        SampleCarousel.prototype.isPaused = function () {
            return this._playPauseButton.faChar() === "fa-play";
        };
        SampleCarousel.prototype.shuffle = function () {
            var _a;
            for (var i = this._samples.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [this._samples[j], this._samples[i]], this._samples[i] = _a[0], this._samples[j] = _a[1];
            }
        };
        SampleCarousel.prototype.visit = function (item) {
            var _this = this;
            if (item.type === "folder") {
                item.children.forEach(function (item) { return _this.visit(item); });
            }
            else if (item.type === "file") {
                this._samples.push(samplePath + item.path);
            }
        };
        SampleCarousel.prototype.renderSample = function () {
            var _this = this;
            var retVal;
            if (this._sampleWidgets[this._idx]) {
                this._sampleCarousel
                    .active(this._idx);
                retVal = Promise.resolve();
            }
            else {
                retVal = d3_fetch_1.text(this._samples[this._idx]).then(function (js) {
                    _this._sampleWidgets[_this._idx] = new sample_js_1.Sample().data([["", js]]);
                    _this._sampleCarousel
                        .widgets(_this._sampleWidgets)
                        .active(_this._idx);
                });
            }
            return retVal.then(function () {
                _this
                    .title(_this._samples[_this._idx].substring((samplePath + "./samples/").length))
                    .lazyRender();
            });
        };
        SampleCarousel.prototype.incIdx = function (wrap) {
            if (wrap === void 0) { wrap = false; }
            if (++this._idx >= this._samples.length) {
                this._idx = wrap ? 0 : this._samples.length - 1;
            }
            this._prevButton.enabled(this._idx !== 0).lazyRender();
            this._nextButton.enabled(this._idx !== this._samples.length - 1).lazyRender();
        };
        SampleCarousel.prototype.decIdx = function () {
            if (--this._idx < 0) {
                this._idx = 0;
            }
            this._prevButton.enabled(this._idx !== 0).lazyRender();
            this._nextButton.enabled(this._idx !== this._samples.length - 1).lazyRender();
        };
        SampleCarousel.prototype.loadRandom = function () {
            var _this = this;
            if (!this.isPaused()) {
                this.incIdx(true);
                return this.renderSample().then(function () {
                    setTimeout(function () {
                        _this.loadRandom();
                    }, 3000);
                });
            }
            else {
                setTimeout(function () {
                    _this.loadRandom();
                }, 3000);
            }
        };
        SampleCarousel.prototype.enter = function (domNode, element) {
            var _this = this;
            _super.prototype.enter.call(this, domNode, element);
            this.height(240);
            this.scale(0.5);
            setTimeout(function () {
                _this.loadRandom();
            }, 1000);
        };
        return SampleCarousel;
    }(layout_1.ChartPanel));
    exports.SampleCarousel = SampleCarousel;
});
//# sourceMappingURL=sampleCarousel.js.map