const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const commonjs = require("rollup-plugin-commonjs");
const alias = require('rollup-plugin-alias');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');

export default {
    entry: 'tmp/index.js',
    format: 'umd',
    moduleName: "hpcc-js-requirejs-shim",
    dest: 'dist/requirejs-shim.js',
    globals: {
        //        "../tmp/requirejs-shim": "hpcc_js"
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true
        }),
        postcss({
            plugins: [],
            extensions: ['.css']  // default value
        }),
        commonjs({
            namedExports: {
                "../tmp/requirejs-shim": ["hpcc_js"]
            }
        }),
        sourcemaps(),
        //uglify()
    ]
};
