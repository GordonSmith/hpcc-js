const alias = require('rollup-plugin-alias');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require("rollup-plugin-commonjs");
const css = require('rollup-plugin-css-only');

export default {
    entry: 'src/index.js',
    format: 'umd',
    moduleName: "hpcc-js-preact-shim",
    dest: 'dist/preact-shim.js',
    plugins: [
        alias({
        }),
        nodeResolve({
            module: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "..\\..\\node_modules\\preact\\dist\\preact.js": ["Component", "cloneElement", "h", "options", "render"]
            }
        })
    ]
};