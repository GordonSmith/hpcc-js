const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require("rollup-plugin-commonjs");
const sourcemaps = require('rollup-plugin-sourcemaps');
const definition = require("./package.json");
const name = definition.name.split("/").pop();

export default {
    input: "lib/index",
    output: {
        file: `build/${name}.js`,
        format: "umd",
        name: `@hpcc-js/${name}`
    },
    sourcemap: true,
    plugins: [
        nodeResolve({
            module: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "..\\..\\node_modules\\preact\\dist\\preact.js": ["Component", "cloneElement", "h", "options", "render"]
            }
        }),
        sourcemaps()
    ]
};