"use strict";
(function (root) {
    root.hpccsystems = root.hpccsystems || {};
    root.hpccsystems.cache = root.hpccsystems.cache || {};

    //  Keep at the top for the optimizer to find (optimizer requires 100% JSON in require.config call) ---
    function optimizerConfig(require) {
        var load = requirejs.load;
        require.load = function (context, moduleId, url) {
            //  Temp hook for transition to ts /d3.v4 ---
            if (moduleId.length >= 4 && moduleId.indexOf(".css") === moduleId.length - 4) {
                var newUrl = url.substring(0, url.length - 3);
                var link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = newUrl;
                document.getElementsByTagName("head")[0].appendChild(link);
                url = "../rjs.noop.js";
            }
            return load(context, moduleId, url);
        };
        return require.config({
            baseUrl: ".",
            paths: {
                "requireLib": "../node_modules/requirejs/require",
                "css": "../node_modules/require-css/css",
                "css-builder": "../node_modules/require-css/css-builder",
                "normalize": "../node_modules/require-css/normalize",
                "async": "../node_modules/requirejs-plugins/src/async",
                "propertyParser": "../node_modules/requirejs-plugins/src/propertyParser",
                "goog": "../node_modules/requirejs-plugins/src/goog",
                "text": "../node_modules/requirejs-text/text",
                "json": "../node_modules/requirejs-plugins/src/json",

                "ajv": "../../../node_modules/ajv/dist/ajv.bundle",
                "amcharts3": "../../../node_modules/amcharts3",
                "amchartsImg": "../../../node_modules/amcharts3/amcharts/images/",
                "colorbrewer": "../../../node_modules/colorbrewer/colorbrewer",
                "d3-array": "../../../node_modules/d3-array/build/d3-array",
                "d3-axis": "../../../node_modules/d3-axis/build/d3-axis",
                "@hpcc-js/d3-bullet": "../../../node_modules/@hpcc-js/d3-bullet/build/d3-bullet",
                "d3-brush": "../../../node_modules/d3-brush/build/d3-brush",
                "d3-cloud": "../../../node_modules/d3-cloud/build/d3.layout.cloud",
                "d3-dsv": "../../../node_modules/d3-dsv/build/d3-dsv",
                "d3-collection": "../../../node_modules/d3-collection/build/d3-collection",
                "d3-color": "../../../node_modules/d3-color/build/d3-color",
                "d3-dispatch": "../../../node_modules/d3-dispatch/build/d3-dispatch",
                "d3-drag": "../../../node_modules/d3-drag/build/d3-drag",
                "d3-ease": "../../../node_modules/d3-ease/build/d3-ease",
                "d3-interpolate": "../../../node_modules/d3-interpolate/build/d3-interpolate",
                "d3-force": "../../../node_modules/d3-force/build/d3-force",
                "d3-format": "../../../node_modules/d3-format/build/d3-format",
                "d3-geo": "../../../node_modules/d3-geo/build/d3-geo",
                "d3-hexbin": "../../../node_modules/d3-hexbin/build/d3-hexbin",
                "d3-hierarchy": "../../../node_modules/d3-hierarchy/build/d3-hierarchy",
                "d3-path": "../../../node_modules/d3-path/build/d3-path",
                "d3-quadtree": "../../../node_modules/d3-quadtree/build/d3-quadtree",
                "d3-random": "../../../node_modules/d3-random/build/d3-random",
                "d3-request": "../../../node_modules/d3-request/build/d3-request",
                "d3-scale": "../../../node_modules/d3-scale/build/d3-scale",
                "d3-shape": "../../../node_modules/d3-shape/build/d3-shape",
                "d3-sankey": "../../../node_modules/d3-sankey/build/d3-sankey",
                "d3-selection": "../../../node_modules/d3-selection/build/d3-selection",
                "d3-time": "../../../node_modules/d3-time/build/d3-time",
                "d3-timer": "../../../node_modules/d3-timer/build/d3-timer",
                "d3-time-format": "../../../node_modules/d3-time-format/build/d3-time-format",
                "d3-tip": "../../../node_modules/d3-tip/lib-browser/index",
                "d3-tile": "../../../node_modules/d3-tile/build/d3-tile",
                "d3-transition": "../../../node_modules/d3-transition/build/d3-transition",
                "d3-zoom": "../../../node_modules/d3-zoom/build/d3-zoom",
                "dagre": "../../../node_modules/dagre/dist/dagre",
                "es6-promise": "../../../node_modules/es6-promise/dist/es6-promise.auto",
                "font-awesome": "../../../node_modules/font-awesome",
                "google-maps": "../../../node_modules/google-maps/lib/Google",
                "grid-list": "../../../node_modules/grid-list/src/gridList",
                "handsontable": "../../../node_modules/handsontable/dist/handsontable.full",
                "javascript-autocomplete": "../../../node_modules/javascript-autocomplete/auto-complete",
                "orb": "../../../node_modules/orb",
                "react": "../../../node_modules/react/dist/react",
                "simpleheat": "../../../node_modules/simpleheat/simpleheat",
                "topojson": "../../../node_modules/topojson/build/topojson",
                "tslib": "../../../node_modules/tslib/tslib",

                "@hpcc-js/c3-shim": "../node_modules/@hpcc-js/c3-shim",
                "@hpcc-js/codemirror-shim": "../node_modules/@hpcc-js/codemirror-shim",
                "@hpcc-js/dgrid-shim": "../node_modules/@hpcc-js/dgrid-shim",
                "@hpcc-js/phosphor-shim": "../node_modules/@hpcc-js/phosphor-shim",
                "@hpcc-js/preact-shim": "../node_modules/@hpcc-js/preact-shim",

                "@hpcc-js/amchart": "../node_modules/@hpcc-js/amchart",
                "@hpcc-js/api": "../node_modules/@hpcc-js/api",
                "@hpcc-js/c3chart": "../node_modules/@hpcc-js/c3chart",
                "@hpcc-js/chart": "../node_modules/@hpcc-js/chart",
                "@hpcc-js/codemirror": "../node_modules/@hpcc-js/codemirror",
                "@hpcc-js/common": "../node_modules/@hpcc-js/common",
                "@hpcc-js/composite": "../node_modules/@hpcc-js/composite",
                "@hpcc-js/ddl": "../node_modules/@hpcc-js/ddl",
                "@hpcc-js/dgrid": "../node_modules/@hpcc-js/dgrid",
                "@hpcc-js/form": "../node_modules/@hpcc-js/form",
                "@hpcc-js/google": "../node_modules/@hpcc-js/google",
                "@hpcc-js/graph": "../node_modules/@hpcc-js/graph",
                "@hpcc-js/handson": "../node_modules/@hpcc-js/handson",
                "@hpcc-js/html": "../node_modules/@hpcc-js/html",
                "@hpcc-js/layout": "../node_modules/@hpcc-js/layout",
                "@hpcc-js/map": "../node_modules/@hpcc-js/map",
                "@hpcc-js/marshaller": "../node_modules/@hpcc-js/marshaller",
                "@hpcc-js/other": "../node_modules/@hpcc-js/other",
                "@hpcc-js/phosphor": "../node_modules/@hpcc-js/phosphor",
                "@hpcc-js/react": "../node_modules/@hpcc-js/react",
                "@hpcc-js/timeline": "../node_modules/@hpcc-js/timeline",
                "@hpcc-js/tree": "../node_modules/@hpcc-js/tree",

                "src": "../src"
            },
            packages: [
                { name: "@hpcc-js/c3-shim", main: "dist/c3-shim" },
                { name: "@hpcc-js/codemirror-shim", main: "dist/codemirror-shim" },
                { name: "@hpcc-js/dgrid-shim", main: "dist/dgrid-shim" },
                { name: "@hpcc-js/phosphor-shim", main: "dist/phosphor-shim" },
                { name: "@hpcc-js/preact-shim", main: "dist/preact-shim" },
                { name: "@phosphor/algorithm", main: "lib/index" },
                { name: "@phosphor/widgets", main: "lib/index" },
                { name: "@hpcc-js/amchart", main: "lib/index" },
                { name: "@hpcc-js/api", main: "lib/index" },
                { name: "@hpcc-js/c3chart", main: "lib/index" },
                { name: "@hpcc-js/chart", main: "lib/index" },
                { name: "@hpcc-js/codemirror", main: "lib/index" },
                { name: "@hpcc-js/common", main: "lib/index" },
                { name: "@hpcc-js/composite", main: "lib/index" },
                { name: "@hpcc-js/ddl", main: "lib/index" },
                { name: "@hpcc-js/dgrid", main: "lib/index" },
                { name: "@hpcc-js/form", main: "lib/index" },
                { name: "@hpcc-js/google", main: "lib/index" },
                { name: "@hpcc-js/graph", main: "lib/index" },
                { name: "@hpcc-js/handson", main: "lib/index" },
                { name: "@hpcc-js/html", main: "lib/index" },
                { name: "@hpcc-js/layout", main: "lib/index" },
                { name: "@hpcc-js/map", main: "lib/index" },
                { name: "@hpcc-js/marshaller", main: "lib/index" },
                { name: "@hpcc-js/other", main: "lib/index" },
                { name: "@hpcc-js/phosphor", main: "lib/index" },
                { name: "@hpcc-js/react", main: "lib/index" },
                { name: "@hpcc-js/timeline", main: "lib/index" },
                { name: "@hpcc-js/tree", main: "lib/index" }
            ],
            shim: {
                "simpleheat": {
                    exports: "simpleheat",
                    init: function () {
                        simpleheat.isReady = true;
                    }
                }
            }
        });
    }

    function rawgitPaths(srcUrl, rawgitBaseUrl) {
        return {
            "css": rawgitBaseUrl + "/guybedford/require-css/0.1.8/css.min",
            "css-builder": rawgitBaseUrl + "/guybedford/require-css/0.1.8/css-builder.min",
            "normalize": rawgitBaseUrl + "/guybedford/require-css/0.1.8/normalize.min",
            "async": rawgitBaseUrl + "/millermedeiros/requirejs-plugins/v1.0.3/src/async",
            "propertyParser": rawgitBaseUrl + "/millermedeiros/requirejs-plugins/v1.0.3/src/propertyParser",
            "goog": rawgitBaseUrl + "/millermedeiros/requirejs-plugins/v1.0.3/src/goog",
            "text": rawgitBaseUrl + "/requirejs/text/2.0.12/text",
            "json": rawgitBaseUrl + "/millermedeiros/requirejs-plugins/v1.0.3/src/json",

            "amcharts3": rawgitBaseUrl + "/amcharts3",
            "amchartsImg": rawgitBaseUrl + "/amcharts3/amcharts/images/",
            "colorbrewer": rawgitBaseUrl + "/colorbrewer/colorbrewer",
            "c3": rawgitBaseUrl + "/c3",
            "d3": rawgitBaseUrl + "/d3@3.5.17/d3",
            "d3-array": rawgitBaseUrl + "/d3-array/build/d3-array",
            "d3-axis": rawgitBaseUrl + "/d3-axis/build/d3-axis",
            "@hpcc-js/d3-bullet": rawgitBaseUrl + "/@hpcc-js/d3-bullet/build/d3-bullet",
            "d3-brush": rawgitBaseUrl + "/d3-brush/build/d3-brush",
            "d3-cloud": rawgitBaseUrl + "/d3-cloud/build/d3.layout.cloud",
            "d3-dsv": rawgitBaseUrl + "/d3-dsv/build/d3-dsv",
            "d3-collection": rawgitBaseUrl + "/d3-collection/build/d3-collection",
            "d3-color": rawgitBaseUrl + "/d3-color/build/d3-color",
            "d3-dispatch": rawgitBaseUrl + "/d3-dispatch/build/d3-dispatch",
            "d3-drag": rawgitBaseUrl + "/d3-drag/build/d3-drag",
            "d3-ease": rawgitBaseUrl + "/d3-ease/build/d3-ease",
            "d3-interpolate": rawgitBaseUrl + "/d3-interpolate/build/d3-interpolate",
            "d3-force": rawgitBaseUrl + "/d3-force/build/d3-force",
            "d3-format": rawgitBaseUrl + "/d3-format/build/d3-format",
            "d3-geo": rawgitBaseUrl + "/d3-geo/build/d3-geo",
            "d3-hexbin": rawgitBaseUrl + "/d3-hexbin/build/d3-hexbin",
            "d3-hierarchy": rawgitBaseUrl + "/d3-hierarchy/build/d3-hierarchy",
            "d3-path": rawgitBaseUrl + "/d3-path/build/d3-path",
            "d3-quadtree": rawgitBaseUrl + "/d3-quadtree/build/d3-quadtree",
            "d3-random": rawgitBaseUrl + "/d3-random/build/d3-random",
            "d3-request": rawgitBaseUrl + "/d3-request/build/d3-request",
            "d3-scale": rawgitBaseUrl + "/d3-scale/build/d3-scale",
            "d3-shape": rawgitBaseUrl + "/d3-shape/build/d3-shape",
            "d3-sankey": rawgitBaseUrl + "/d3-sankey/build/d3-sankey",
            "d3-selection": rawgitBaseUrl + "/d3-selection/build/d3-selection",
            "d3-time": rawgitBaseUrl + "/d3-time/build/d3-time",
            "d3-timer": rawgitBaseUrl + "/d3-timer/build/d3-timer",
            "d3-time-format": rawgitBaseUrl + "/d3-time-format/build/d3-time-format",
            "d3-tip": rawgitBaseUrl + "/d3-tip@0.8.0-alpha.1/index",
            "d3-transition": rawgitBaseUrl + "/d3-transition/build/d3-transition",
            "d3-zoom": rawgitBaseUrl + "/d3-zoom/build/d3-zoom",
            "dagre": rawgitBaseUrl + "/dagre/dist/dagre",
            "es6-promise": rawgitBaseUrl + "/es6-promise/dist/es6-promise.auto",
            "font-awesome": rawgitBaseUrl + "/font-awesome",
            "google-maps": rawgitBaseUrl + "/google-maps/lib/Google",
            "grid-list": rawgitBaseUrl + "/grid-list/src/gridList",
            "handsontable": rawgitBaseUrl + "/handsontable/dist/handsontable.full",
            "javascript-autocomplete": rawgitBaseUrl + "/javascript-autocomplete/auto-complete",
            "orb": rawgitBaseUrl + "/orb",
            "orb": rawgitBaseUrl + "/orb",
            "react": rawgitBaseUrl + "/react/dist/react",
            "simpleheat": rawgitBaseUrl + "/simpleheat/simpleheat",
            "topojson": rawgitBaseUrl + "/topojson/build/topojson",
            "tslib": rawgitBaseUrl + "/tslib/tslib",

            "src": srcUrl
        };
    }

    function srcConfig(srcUrl) {
        optimizerConfig(root.hpccsystems.require);
        var config = root.hpccsystems.require.s.contexts["_"].config;
        var paths = {};
        for (var key in config.paths) {
            paths[key] = srcUrl + "/" + config.paths[key];
        }
        root.hpccsystems.require.config({
            baseUrl: ".",
            paths: paths
        });
    }

    function buildConfig(srcUrl) {
        root.hpccsystems.require.config({
            baseUrl: ".",
            bundles: { replace: "me" },  //  Bundles get injected during gulp build-amd
            paths: {
                "src": srcUrl,
                "font-awesome": srcUrl + "/font-awesome/css/font-awesome.min",
                "amcharts-images": srcUrl + "/img/amcharts/"
            }
        });
    }

    function githubConfig(srcUrl) {
        optimizerConfig(root.hpccsystems.require);
        return root.hpccsystems.require.config({
            waitSeconds: 30,
            baseUrl: ".",
            paths: root.hpccsystems.cache[srcUrl].rawgitPaths
        });
    }

    function remoteGithubConfig(hostname, srcUrl, context, callback) {
        var rawgitBaseUrl = root.location.protocol === "https:" ? "https://" : "http://" + hostname;
        root.hpccsystems.require([srcUrl + "/loader.js"], function () {
            callback(root.hpccsystems.require.config({
                waitSeconds: 30,
                baseUrl: srcUrl,
                context: context,
                paths: root.hpccsystems.cache[srcUrl].rawgitPaths
            }));
        }, function (err) {
            callback(root.hpccsystems.require.config({
                waitSeconds: 30,
                baseUrl: srcUrl,
                context: context,
                paths: rawgitPaths(srcUrl, "https://unpkg.com")
            }));
        });
    }

    function remoteCDNConfig(srcUrl, version, callback) {
        var bundleUrl = srcUrl + "/hpcc-bundles-def.js";
        root.hpccsystems.require([bundleUrl], function (bundles) {
            var retVal = root.hpccsystems.require.config({
                context: version,
                baseUrl: srcUrl,
                bundles: bundles,
                paths: {
                    "src": srcUrl,
                    "font-awesome": srcUrl + "/font-awesome/css/font-awesome.min",
                    "amcharts-images": srcUrl + "/img/amcharts/"
                }
            });
            retVal([srcUrl + "/hpcc-viz.js"], function () {
                callback(retVal);
            });
        });
    }

    (function () {
        var myInfo = {
            url: "",
        };
        if (document && document.currentScript) {
            myInfo.url = document.currentScript.src;
        } else {
            var scripts = document.getElementsByTagName('script');
            for (var i = scripts.length - 1; i >= 0; --i) {
                var script = scripts[i];
                var url = script.getAttribute.length !== undefined ? script.src : script.getAttribute('src', -1);
                if (url.indexOf("loader.js") > 0 || url.indexOf("hpcc-viz.js") > 0) {
                    myInfo.url = url;
                    break;
                }
            }
        }
        var urlParts = myInfo.url.split("/");
        myInfo.filename = urlParts.pop();
        myInfo.srcUrl = urlParts.join("/");

        if (!root.hpccsystems.cache[myInfo.srcUrl]) {
            var rawgitBaseUrl = root.location.protocol === "https:" ? "https://rawgit.com" : "http://rawgit.com";
            root.hpccsystems.cache[myInfo.srcUrl] = {
                rawgitPaths: rawgitPaths(myInfo.srcUrl, "https://unpkg.com")
            };
        }

        if (!root.hpccsystems.require) {
            root.hpccsystems.require = root.require || require;
            if (!root.hpccsystems.skipAutoConfig) {
                switch (myInfo.filename) {
                    case "loader.js":
                        switch (root.location.hostname) {
                            case "rawgit.com":
                                githubConfig(myInfo.srcUrl);
                                break;
                            default:
                                srcConfig(myInfo.srcUrl);
                        }
                        break;
                    case "hpcc-viz.js":
                        buildConfig(myInfo.srcUrl);
                        break;
                }
            }
        }
    }());

    if (!root.hpccsystems.redirect) {
        root.hpccsystems.redirect = (function () {
            var cdnHost = "viz.hpccsystems.com";
            function url(opts) {
                opts = opts || {};
                var protocol = opts.protocol || (root.location.protocol === "https:" ? "https:" : "http:");
                var hostname = opts.hostname || root.location.hostname;
                var port = opts.port !== undefined ? opts.port : root.location.port;
                var host = hostname + (port ? ":" + port : "");
                var pathname = opts.pathname || root.location.pathname;
                var href = protocol + "//" + host + pathname;
                return href;
            }

            function cdnUrl(version) {
                return url({
                    hostname: cdnHost,
                    port: "",
                    pathname: "/" + version + "/dist-amd"
                });
            }

            return {
                cdnHost: function (_) {
                    if (!arguments.length) return cdnHost;
                    cdnHost = _;
                    return this;
                },
                github: function (branch, org, repo, callback) {
                    callback = arguments[arguments.length - 1];
                    switch (arguments.length) {
                        case 1:
                            branch = "master";
                        /* falls through */
                        case 2:
                            org = "hpcc-systems";
                        /* falls through */
                        case 3:
                            repo = "Visualization";
                            break;
                    }
                    var srcUrl = url({
                        hostname: "rawgit.com",
                        port: "",
                        pathname: "/" + org + "/" + repo + "/" + branch + "/src"
                    });
                    remoteGithubConfig("rawgit.com", srcUrl, org + "_" + repo + "_" + branch, callback);
                },
                cdn: function (version, callback) {
                    var srcUrl = cdnUrl(version);
                    remoteCDNConfig(srcUrl, version, callback);
                },
                create: function (state, callback) {
                    if (typeof state === "string") {
                        state = JSON.parse(state);
                    }
                    switch (state.__version) {
                        case "1":
                        case "2":
                        case "3":
                            this.cdn("v1.10.0", function (_req) {
                                _req(["src/other/Persist"], function (Persist) {
                                    Persist.create(state, function (widget) {
                                        callback(widget, _req);
                                    });
                                }, requireErrorHandler);
                            });
                            break;
                        default:
                            this.cdn("v" + state.__version, function (_req) {
                                _req(["src/other/Persist"], function (Persist) {
                                    Persist.create(state, function (widget) {
                                        callback(widget, _req);
                                    });
                                }, requireErrorHandler);
                            });
                            break;
                    }
                    function requireErrorHandler(err) {
                        console.log("Loader 'create' Error:\n" + err.message);
                    }
                }
            };
        }());
    }
}(this));