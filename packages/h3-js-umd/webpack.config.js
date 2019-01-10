const path = require('path');

module.exports = {
    entry: {
        "index": "./lib-es6/index.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: "dist/",
        filename: "[name].js",
        libraryTarget: "umd",
        library: "@hpcc-js/h3-js-umd"
    },
    node: {
        fs: 'empty',
        path: 'empty'
    },
    mode: "production",
    optimization: {
        minimize: false
    }
};
