// import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import commonjs from "rollup-plugin-commonjs";
const css = require('rollup-plugin-css-only');
const alias = require('rollup-plugin-alias');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');

export default {
    entry: 'node_modules/@hpcc-js/api/lib-es6/index.js',
    format: 'umd',
    moduleName: "hpcc-viz-api",
    dest: 'dist/api.js',
    plugins: [
        resolve({
            jsnext: false,
            main: true
        }),
        postcss({
            plugins: [
                // cssnext(),
                // yourPostcssPlugin()
            ],
            //sourceMap: false, // default value
            //extract: false, // default value
            extensions: ['.css']  // default value
            // parser: sugarss
        }),
        commonjs({
            namedExports: {
            }
        })
    ]
};
