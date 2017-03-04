const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const fs = require('fs');
function gatherFiles(folder) {
    let exportFileContents = "";
    fs.readdirSync(`./src/${folder}`).filter((file) => {
        return file.indexOf(".ts") > 0 && file !== "Bullet.ts";
    }).map((file) => {
        let filename = file.substring(0, file.length - 3);
        exportFileContents += `export * from "./${folder}/${filename}";\n`
    });
    fs.writeFileSync(`./src/${folder}.ts`, exportFileContents);
    return `./src/${folder}.ts`;
}

const config = {
    entry: {
        //common: gatherFiles("common"),
        //api: gatherFiles("api"),
        //c3chart: gatherFiles("c3chart"),
        chart: gatherFiles("chart"),
        //layout: gatherFiles("layout"),
    },
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'dist-webpack'),
        filename: 'hpcc-viz-[name].js',
        library: "HPCCViz_[name]",
        libraryTarget: "umd"
    },
    resolve: {
        alias: {
            "request$": "xhr",
            "c3": path.resolve(__dirname, "bower_components/c3/c3.js"),
            "c3.css": path.resolve(__dirname, "bower_components/c3/c3.css"),
            "font-awesome.css": "font-awesome/css/font-awesome.css"
        },
        extensions: [
            ".ts", ".js"
        ],
        modules: ["node_modules", "bower_components"],
        descriptionFiles: ["package.json", "bower.json"]
    },
    resolveLoader: {
        alias: {
            'css': path.resolve(__dirname, 'util/webpack-null-stub.js'),
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader"
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            }, {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000',
            }, {
                test: require.resolve("./bower_components/colorbrewer/colorbrewer.js"),
                use: 'exports-loader?colorbrewer'
            }
        ]
    },
    externals: {
    },
    plugins: [
        new ExtractTextPlugin('hpcc-viz-[name].css'),
        //new webpack.optimize.CommonsChunkPlugin({
        //name: "global"
        //})
    ]
};

config.output.filename = 'hpcc-platform-comms.min-debug.js';
config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    beautify: true,
    mangle: false
}));
switch (process.env.NODE_ENV) {
    case "watch":
        config.watch = true;
        config.watchOptions = {
        };
        //  Uncomment for unittesting in webbrowser
        //config.entry.push("./test/index.ts");
        break;
    case "min":
        config.output.filename = 'hpcc-platform-comms.min.js';
        config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
        break;
    case "min-debug":
        config.output.filename = 'hpcc-platform-comms.min-debug.js';
        config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            beautify: true,
            mangle: false
        }));
        break;
    default:
}

module.exports = config;
