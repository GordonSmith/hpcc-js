var webpack = require('webpack');
var path = require('path');

const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
    entry: {
        common: './build/common.js',
        api: './build/api.js',
        chart: './build/chart.js',
        tree: './build/tree.js',
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
        libraryTarget: "amd"
    },
    devtool: "source-map",
    module: {
        rules: [{
            enforce: 'pre',
            test: /\.js$/,
            loader: "source-map-loader"
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            }]
        }]
    },
    plugins: [
    ]
}
