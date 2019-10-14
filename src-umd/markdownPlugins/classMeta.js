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
        define(["require", "exports", "@hpcc-js/common", "marked"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@hpcc-js/common");
    var marked = require("marked");
    var _renderer = new marked.Renderer();
    var _origLink = _renderer.link;
    var AlphaNum = "_abcdefghijklmnopqrstufwxyz0123456789";
    function replaceAt(str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }
    //  Link override ---
    _renderer.link = function (href, title, text) {
        var extLink = href.indexOf("http") === 0 || href.indexOf("file") === 0 || href.indexOf("api/") === 0;
        var retVal = _origLink.call(_renderer, (extLink ? "" : "#") + href, title, text);
        if (extLink) {
            retVal = retVal.replace('">', '" target="_blank">');
        }
        return retVal;
    };
    var ClassMeta = /** @class */ (function (_super) {
        __extends(ClassMeta, _super);
        function ClassMeta() {
            return _super.call(this) || this;
        }
        ClassMeta.prototype.infostring = function () {
            return this.data()[0][0].substr("meta:".length);
        };
        ClassMeta.prototype.text = function () {
            return this.data()[0][1];
        };
        ClassMeta.prototype.safeLabel = function (_label) {
            var label = _label.toLowerCase();
            for (var i = 0; i < label.length; ++i) {
                if (AlphaNum.indexOf(label[i]) < 0) {
                    label = replaceAt(label, i, "_");
                }
            }
            return label;
        };
        ClassMeta.prototype.type = function (type) {
            if (!type)
                return "";
            switch (type.type) {
                case "union":
                    return type.types.map(function (t) { return t.name; }).join(" | ");
                case "array":
                    return type.elementType.name + "[]";
                case "reference":
                    var json = JSON.parse(this.text());
                    if (json.sources && json.sources.length) {
                        var source = json.sources[0];
                        var fileName = "\"" + source.fileName.substr(0, source.fileName.length - 3) + "\"";
                        return "[" + type.name + "](api/common/modules/" + this.safeLabel(fileName) + ".html#" + this.safeLabel(type.name) + ")";
                    }
                //  fallthrough
                case "intrinsic":
                default:
                    return type.name;
            }
        };
        ClassMeta.prototype.params = function (parameters) {
            var _this = this;
            if (!parameters)
                return [];
            return parameters.map(function (param) { return "" + param.name + (param.flags.isOptional ? "?" : "") + ": " + _this.type(param.type); });
        };
        ClassMeta.prototype.update = function (domNode, element) {
            var _this = this;
            _super.prototype.update.call(this, domNode, element);
            var json = JSON.parse(this.text());
            var md = [];
            if (json.signatures) {
                json.signatures.forEach(function (sig) {
                    md.push("**" + json.name + "**(" + _this.params(sig.parameters).join(", ") + "): " + _this.type(sig.type));
                    md.push("");
                });
            }
            if (json.folder && json.sources && json.sources.length) {
                var source = json.sources[0];
                if (source.fileName.indexOf(".d.ts") < 0) {
                    md.push("Defined in [" + source.fileName + ":" + source.line + "](https://github.com/hpcc-systems/Visualization/blob/master/" + json.folder + "/src/" + source.fileName + "#L" + source.line + ")");
                }
            }
            element.html(marked(md.join("\r\n"), {
                renderer: _renderer
            }));
        };
        return ClassMeta;
    }(common_1.HTMLWidget));
    exports.ClassMeta = ClassMeta;
    ClassMeta.prototype._class = "";
});
//# sourceMappingURL=classMeta.js.map