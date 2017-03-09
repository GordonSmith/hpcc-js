const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const fs = require('fs');
function gatherFiles(folder) {
    /*
    let exportFileContents = "";
    fs.readdirSync(`./src/${folder}`).filter((file) => {
        return file.indexOf(".ts") > 0 && file !== "Bullet.ts";
    }).map((file) => {
        let filename = file.substring(0, file.length - 3);
        exportFileContents += `export * from "./${folder}/${filename}";\n`
    });
    fs.writeFileSync(`./src/${folder}.ts`, exportFileContents);
    */
    return `./src/${folder}.ts`;
}

const config = {
    entry: {
        //common: path.resolve(__dirname, 'src/common.ts'),
        //chart: path.resolve(__dirname, 'src/chart.ts'),
        index: path.resolve(__dirname, 'src/index.ts')
    },
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'lib-browser'),
        filename: '[name].js',
        library: "HPCCViz",
        libraryTarget: "umd"
    },
    resolve: {
        alias: {
        },
        extensions: [
            ".ts", ".js"
        ]
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
                //test: require.resolve("./bower_components/colorbrewer/colorbrewer.js"),
                //use: 'exports-loader?colorbrewer'
            }
        ]
    },
    externals: {
    },
    plugins: [
        new ExtractTextPlugin('index.css')
    ]
};

//  Uncomment for unittesting in webbrowser
// config.entry.push("./test/index.ts");
switch (process.env.NODE_ENV) {
    case "watch":
        config.watch = true;
        config.watchOptions = {
        };
        break;
    case "min":
        config.output.filename = 'index.min.js';
        config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
        break;
    case "min-debug":
        config.output.filename = 'index.min-debug.js';
        config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            beautify: true,
            mangle: false
        }));
        break;
    case "test":
        config.entry = ["./test/index.ts"];
        config.output.filename = 'hpcc-platform-comms.test.js';
        config.module.rules[0].options.configFileName = "./tsconfig-test.json"
        break;
    default:
}

module.exports = config;
