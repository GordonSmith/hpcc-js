import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const pkg = require("./package.json");

export default {
    input: "lib-es6/index",
    output: [{
        file: pkg.main,
        format: "umd",
        sourcemap: true,
        strict: false,
        name: pkg.name
    }],
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
            namedExports: {
                "node_modules/@hpcc-js/dgrid-shim/dist/index.js": ["Deferred", "domConstruct", "QueryResults", "Memory", "PagingGrid", "Grid"]
            }
        })
    ]
};
