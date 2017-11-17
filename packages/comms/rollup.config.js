import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import postcss from "rollup-plugin-postcss";
const definition = require("./package.json");
const name = definition.name.split("/").pop();
const external = Object.keys(definition.dependencies || {}).filter(dep => dep.indexOf("@hpcc-js") === 0 && dep.indexOf("-shim") < 0);
const globals = {};
const external2 = Object.keys(globals);
external.forEach(dep => { globals[dep] = dep });
const node_libs = ["child_process", "fs", "os", "path", "semver", "request", "safe-buffer", "tmp", "xmldom"];

export default {
    input: "lib/index.browser",
    external: external.concat(external2).concat(node_libs),
    output: {
        file: `build/${name}.js`,
        format: "umd",
        globals,
        name: definition.name
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
        }),
        alias({
        }),
        postcss({
            extensions: [".css"]
        })
    ]
};
