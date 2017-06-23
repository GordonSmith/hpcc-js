import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "rollup-plugin-commonjs";
import alias from "rollup-plugin-alias";
import uglify from "rollup-plugin-uglify";
import sourcemaps from "rollup-plugin-sourcemaps";

export default {
    entry: "lib-es6/index.js",
    format: "umd",
    moduleName: "@hpcc-js/common",
    external: [
    ],
    dest: "dist/common.min.js",
    plugins: [
        alias({
        }),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            namedExports: {
            }
        }),
        postcss({
            extensions: [".css"]
        }),
        sourcemaps(),
        //uglify()
    ]
};
