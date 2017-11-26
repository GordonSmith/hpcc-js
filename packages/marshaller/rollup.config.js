import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import postcss from "rollup-plugin-postcss";
const definition = require("./package.json");
const name = definition.name.split("/").pop();
const external = Object.keys(definition.dependencies || {}).filter(dep => dep.indexOf("@hpcc-js") === 0 && dep.indexOf("-shim") < 0);
const globals = {};
external.forEach(dep => { globals[dep] = dep });

export default {
    input: "lib/index",
    external,
    output: {
        file: `build/${name}.js`,
        format: "umd", sourcemap: true,
        globals,
        name: definition.name
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
            namedExports: {
                "../ddl-shim/build/ddl-shim.js": ["DDL2"]
            }
        }),
        alias({
        }),
        postcss({
            extensions: [".css"]
        })
    ]
};
