(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./hpccIndex.js", "./hpccScrollNav.js", "./markdown.js", "../src-umd/index.json"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    var hpccIndex_js_1 = require("./hpccIndex.js");
    var hpccScrollNav_js_1 = require("./hpccScrollNav.js");
    var markdown_js_1 = require("./markdown.js");
    // @ts-ignore
    var indexJson = require("../src-umd/index.json");
    function transformIndexJson(indexJson) {
        var leftnavMap = {};
        var leftnavData = [];
        indexJson.map(function (row) {
            var root = row.root, folder = row.folder, path = row.path, headings = row.headings;
            var packageLabel = root.indexOf("packages/") === 0 ? "@hpcc-js/" + root.substr("packages/".length) : "";
            var navFolder = packageLabel || folder;
            var folderPath = "" + root + (!!root ? "/" : "") + "docs/" + folder + (!!folder ? "/" : "");
            var mdFile = path.substr(folderPath.length);
            var label = mdFile === "index.md" ? "Overview" : headings && headings.length ? headings[0].text : mdFile.replace(".md", "");
            if (navFolder) {
                if (leftnavMap[navFolder] === undefined) {
                    leftnavMap[navFolder] = leftnavData.length;
                    leftnavData.push({
                        label: navFolder,
                        children: []
                    });
                }
                leftnavData[leftnavMap[navFolder]].children.push({
                    label: label,
                    path: path
                });
            }
            else {
                if (leftnavMap[path] === undefined) {
                    leftnavMap[path] = leftnavData.length;
                    leftnavData.push({
                        label: label,
                        path: path,
                        children: []
                    });
                }
            }
        });
        leftnavData.sort(function (l, r) {
            var folderSort = (l.children.length > 0 ? 1 : 0) - (r.children.length > 0 ? 1 : 0);
            if (folderSort)
                return folderSort;
            return 0;
        });
        leftnavData.forEach(function (row) {
            row.children.sort(function (l, r) {
                var lIndexMD = l.path.indexOf("index.md") >= 0 ? 1 : 0;
                var rIndexMD = r.path.indexOf("index.md") >= 0 ? 1 : 0;
                var indexMdSort = rIndexMD - lIndexMD;
                if (indexMdSort)
                    return indexMdSort;
                return l.path.localeCompare(r.path);
            });
        });
        return leftnavData;
    }
    var App = /** @class */ (function () {
        function App() {
            this.leftnavData = transformIndexJson(indexJson);
            this.leftnav = new hpccIndex_js_1.HPCCIndex()
                .target("leftnav")
                .data(this.leftnavData)
                .render();
            this.content = new markdown_js_1.Markdown()
                .target("content")
                .markdown("")
                .render();
            this.rightnav = new hpccScrollNav_js_1.HPCCScrollNav()
                .target("rightnav")
                .data([])
                .render();
            this._prevHash = "";
            var context = this;
            this.content.on("scroll", function () {
                if (context.rightnav._tempDisableScrollHandler) {
                    context.rightnav._tempDisableScrollHandler = false;
                    return;
                }
                var contentNode = this.element().node();
                var anchors = contentNode.querySelectorAll("h1 > a,h2 > a");
                var contentRect = contentNode.getBoundingClientRect();
                var yOffset = contentRect.top;
                var scrollIndex = 0;
                for (var i = 0; i < anchors.length; i++) {
                    var rect = anchors[i].getBoundingClientRect();
                    if (rect.top > 0 + yOffset) {
                        break;
                    }
                    scrollIndex = i;
                }
                var rightnavNode = context.rightnav.element().node();
                var rightnavAnchor = rightnavNode.querySelectorAll(".hpccNavScroll-li")[scrollIndex];
                var top = rightnavAnchor.getBoundingClientRect().top;
                context.rightnav.moveMarker(top - yOffset - 2);
            });
            this.leftnav.on("clicked", function (path) {
                window.location.hash = path;
            });
            if (window.location.hash) {
                this.hashChange();
            }
            else {
                window.location.hash = "docs/index.md";
            }
        }
        App.prototype.showPage = function (path, heading) {
            var _this = this;
            return new Promise(function (resolve) {
                var _a;
                (_a = "../../" + path, __syncRequire ? Promise.resolve().then(function () { return require(_a); }) : new Promise(function (resolve_1, reject_1) { require([_a], resolve_1, reject_1); })).then(function (md) {
                    _this.content
                        .path(path)
                        .markdown(md)
                        .lazyRender(function (w) {
                        _this.rightnav
                            .data(w._anchors)
                            .render();
                        resolve();
                    });
                }).catch(function (e) {
                    _this.content
                        .path(path)
                        .markdown("    # File not found\n\n    Unable to locate:  `\"" + path + "\"`\n    ")
                        .lazyRender(function (w) {
                        _this.rightnav
                            .data([])
                            .render();
                        resolve();
                    });
                });
            });
        };
        App.prototype.hashChange = function () {
            var hash = window.location.hash.substr(1);
            var parts = this._prevHash.split("/");
            parts.pop();
            if (hash.indexOf("#") >= 0) {
                var hashParts = hash.split("#");
                if (this._prevHash.split("#")[0] !== hashParts[0]) {
                    this._prevHash = hash;
                    this.showPage(hashParts[0], hashParts[1]);
                }
                return;
            }
            else if (hash.indexOf("../") === 0) {
                while (hash.indexOf("../") === 0) {
                    parts.pop();
                    hash = hash.substr(3);
                }
                hash = parts.join("/") + (parts.length ? "/" : "") + hash;
                window.history.replaceState(undefined, undefined, window.location.pathname + "#" + hash);
            }
            else if (hash.indexOf("./") === 0) {
                hash = parts.join("/") + hash.substr(1);
                window.history.replaceState(undefined, undefined, window.location.pathname + "#" + hash);
            }
            if (this._prevHash !== hash) {
                this._prevHash = hash;
                this.showPage(hash);
            }
        };
        return App;
    }());
    exports.App = App;
});
//# sourceMappingURL=index.js.map