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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@hpcc-js/codemirror"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codemirror_1 = require("@hpcc-js/codemirror");
    var Source = /** @class */ (function (_super) {
        __extends(Source, _super);
        function Source(_mode, _minHeight) {
            if (_minHeight === void 0) { _minHeight = 0; }
            var _this = _super.call(this) || this;
            _this._mode = _mode;
            _this._minHeight = _minHeight;
            return _this;
        }
        Source.prototype.infostring = function () {
            return this.data()[0][0];
        };
        Source.prototype.text2 = function () {
            return this.data()[0][1];
        };
        Source.prototype.options = function () {
            return __assign({}, _super.prototype.options.call(this), { mode: this._mode, foldGutter: true, gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"] });
        };
        Source.prototype.update = function (domNode, element) {
            this.height(Math.max((this.text2().split("\n").length + 1) * 12, this._minHeight));
            _super.prototype.update.call(this, domNode, element);
            this.text(this.text2());
        };
        return Source;
    }(codemirror_1.Editor));
    exports.Source = Source;
});
//# sourceMappingURL=source.js.map