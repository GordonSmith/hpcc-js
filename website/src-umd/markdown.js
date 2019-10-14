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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@hpcc-js/common", "marked", "./markdownPlugins/index.js", "../src/markdown.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@hpcc-js/common");
    var marked = require("marked");
    var index_js_1 = require("./markdownPlugins/index.js");
    require("../src/markdown.css");
    var Markdown = /** @class */ (function (_super) {
        __extends(Markdown, _super);
        function Markdown() {
            var _this = _super.call(this) || this;
            _this._renderer = new marked.Renderer();
            _this._origCode = _this._renderer.code;
            _this._origLink = _this._renderer.link;
            _this._origHtml = _this._renderer.html;
            _this._codeSamples = [];
            _this._anchors = [];
            //  Heading override ---
            var context = _this;
            _this._renderer.heading = function (text, level) {
                var escapedText = text.toLowerCase().replace(/[^\w]+/g, "");
                var href = _this.path() + "#" + escapedText;
                context._anchors.push({
                    label: text,
                    href: "#" + href
                });
                return "<h" + level + ">\n    <a id=\"" + href + "\" class=\"anchor\" href=\"#" + href + "\">\n        <span class=\"header-link\"></span>\n    </a>\n    " + text + "\n</h" + level + ">";
            };
            //  Link override ---
            _this._renderer.link = function (href, title, text) {
                console.log("href:  " + href);
                var extLink = href.indexOf("http") === 0 || href.indexOf("file") === 0 || href.indexOf("api/") === 0;
                var retVal = _this._origLink.call(_this._renderer, (extLink ? "" : "#") + href, title, text);
                if (extLink) {
                    retVal = retVal.replace('">', '" target="_blank">');
                }
                return retVal;
            };
            //  Code override ---
            _this._renderer.code = function (text, infostring, escaped) {
                var mdWidget = index_js_1.markdownWidget(infostring, text);
                if (mdWidget) {
                    return _this.renderPlaceholder(mdWidget);
                }
                return _this._origCode.call(_this._renderer, text, infostring, escaped);
            };
            _this._renderer.html = function (html) {
                if (html.indexOf("<!--meta") === 0) {
                    html = html.substr(0, html.indexOf("-->"));
                    var htmlParts = html.split("\n");
                    var infostring = htmlParts.shift().substr("<!--".length);
                    var mdWidget = index_js_1.markdownWidget(infostring, htmlParts.join("\n"));
                    if (mdWidget) {
                        return _this.renderPlaceholder(mdWidget);
                    }
                }
                return _this._origHtml.call(_this._renderer, html);
            };
            return _this;
        }
        Markdown.prototype.path = function (_) {
            if (!arguments.length)
                return this._path;
            this._path = _;
            return this;
        };
        Markdown.prototype.markdown = function (_) {
            if (!arguments.length)
                return this._markdown;
            this._anchors = [];
            this._markdown = _;
            return this;
        };
        Markdown.prototype.scroll = function () { };
        Markdown.prototype.renderPlaceholder = function (mdWidget) {
            this._codeSamples.push(mdWidget);
            return "<div id=\"placeholder" + mdWidget.id() + "\"></div>";
        };
        Markdown.prototype.enter = function (domNode, element) {
            _super.prototype.enter.call(this, domNode, element);
            var context = this;
            element
                .style("overflow-x", "hidden")
                .style("overflow-y", "scroll")
                .on("scroll", function () {
                context.scroll.apply(this, arguments);
            });
        };
        Markdown.prototype.update = function (domNode, element) {
            var _this = this;
            _super.prototype.update.call(this, domNode, element);
            element.style("height", this.height() + "px");
            if (this._prevMarkdown !== this.markdown()) {
                this._prevMarkdown = this.markdown();
                this._codeSamples = [];
                element.html(marked(this.markdown(), {
                    renderer: this._renderer,
                    highlight: function (code, lang, callback) {
                        return hljs.highlightAuto(code).value;
                    }
                }) + "<br>");
                this._codeSamples.forEach(function (cs) {
                    cs
                        .target("placeholder" + cs.id())
                        .render();
                });
            }
            else {
                this._codeSamples.forEach(function (cs) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, cs.resize().renderPromise()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
        };
        return Markdown;
    }(common_1.HTMLWidget));
    exports.Markdown = Markdown;
    Markdown.prototype._class += " website_Markdown";
    Markdown.prototype.publish("markdown", "", "string", "String to be rendered as markdown");
});
//# sourceMappingURL=markdown.js.map