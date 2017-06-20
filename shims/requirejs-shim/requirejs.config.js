({
    baseUrl: ".",
    appDir: "../nullDir",
    dir: "dist",
    paths: {
        "requireLib": "../../node_modules/requirejs/require"
    },
    optimize: "none",
    wrap: {
        start: "Object.defineProperty(exports, \"__esModule\", { value: true });",
        end: "exports.hpcc_js = hpcc_js;"
    },
    namespace: "hpcc_js",
    modules: [{
        name: "requirejs-shim",
        include: ["requireLib"],
        create: true
    }]
})