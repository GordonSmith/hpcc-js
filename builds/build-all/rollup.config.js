// import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import commonjs from "rollup-plugin-commonjs";
const css = require('rollup-plugin-css-only');
const alias = require('rollup-plugin-alias');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');

export default {
    entry: 'node_modules/@hpcc-js/dgrid/lib-es6/index.js',
    format: 'amd',
    moduleName: "HPCCViz",
    external: [
        "@hpcc-js/common",
        "@hpcc-js/common-vendor"
    ],
    dest: 'dist/dgrid.js',
    plugins: [
        alias({
            "@hpcc-js/common": "@hpcc-js/common",
            "d3-selection": "@hpcc-js/common-vendor",
            "tslib": "@hpcc-js/common-vendor"
        }),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "..\\..\\packages\\dgrid-lib\\dist\\dgrid-lib.js": ["Memory", "PagingGrid"]
            }
        }),
        postcss({
            extensions: ['.css']  // default value
        }),
        sourcemaps()
    ]
};
