//import json from 'rollup-plugin-json';
//import babel from 'rollup-plugin-babel';

export default {
  entry: 'obj-es6/common',
  format: 'umd',
  moduleName: 'chart',
  dest: 'dist-umd/hpcc-viz-common.js',
  sourceMap: true,

  //external: [ 'd3' ],
  paths: {
    //d3: 'https://d3js.org/d3.v4.min.js'
  }
};
