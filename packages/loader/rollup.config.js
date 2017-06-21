import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import commonjs from "rollup-plugin-commonjs";
const css = require('rollup-plugin-css-only');
const alias = require('rollup-plugin-alias');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');

export default {
    entry: 'lib-es6/index.js',
    format: 'iife',
    moduleName: "@hpcc-js/loader",
    external: [
    ],
    dest: 'dist/loader.js',
    plugins: [
        alias({
        }),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "..\..\shims\requirejs-shim\dist\requirejs-shim.js": ["hpcc_js_requirejs"]
            }
        }),
        postcss({
            extensions: ['.css']  // default value
        }),
        sourcemaps(),
        uglify()
    ]
};