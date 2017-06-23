import * as rollup from "rollup";
import * as alias from "rollup-plugin-alias";
import * as commonjs from "rollup-plugin-commonjs";
import * as resolve from "rollup-plugin-node-resolve";
import * as postcss from "rollup-plugin-postcss";
import * as sourcemaps from "rollup-plugin-sourcemaps";
import * as uglify from "rollup-plugin-uglify";

import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";

// tslint:disable:no-var-requires
declare const require: any;

program
    .version("0.0.1")
    .option("-m, --min", "Minimize")
    .parse(process.argv);

const myPackage = require(path.join(process.cwd(), "package.json"));
if (!myPackage) {
    throw new Error("Unable to locate package.json");
}
const leafID = myPackage.name.split("/")[1];

const aliases: { [key: string]: string } = {};
const externals: string[] = [];
const globals: { [key: string]: string } = {};
const deps: { [key: string]: any } = {};

function walkDependencies(folder: string, depth: number = 0) {
    const pkg = require(path.join(folder, "package.json"));
    for (const key in pkg.dependencies) {
        if (key === "@hpcc-js/dgrid-shim" || (key !== "@hpcc-js/d3-bullet" && key.indexOf("@hpcc-js") === 0 && key.indexOf("-shim") < 0)) {
            const depFolder = path.join(folder, "node_modules", key);
            const depPkg = walkDependencies(depFolder, depth + 1);
            depPkg.__folder = depFolder;
            deps[key] = depPkg;
            if (depth === 0) {
                console.log("Excluding:  " + key);
                externals.push(key);
                globals[key] = key;
            }
        }
    }
    return pkg;
}
walkDependencies(process.cwd());

for (const key in myPackage.dependencies) {
    if (key.indexOf("@hpcc-js") !== 0) {
        for (const depKey in deps) {
            if (deps[depKey].dependencies[key]) {
                const depPckg = deps[depKey];
                console.log(`Optimized:  ${key} in ${depPckg.name}`);
                aliases[key] = depKey;
                const indexSrc = fs.readFileSync(path.join(depPckg.__folder, "src", "index.ts"), "utf8");
                if (indexSrc.indexOf(key) < 0) {
                    console.log(`Error:  ${key} not exported by ${deps[depKey].name}`);
                }
                break;
            }
        }
    }
}

export default function bundle(min: boolean = false) {
    const plugins = [
        alias(aliases),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "../../shims/dgrid-shim/dist/dgrid-shim.js": ["Memory", "PagingGrid", "Grid"]
            }
        }),
        postcss({
            extensions: [".css"]
        }),
        sourcemaps()
    ];
    if (min) {
        plugins.push(uglify({}));
    }
    return rollup.rollup({
        entry: "lib-es6/index.js",
        external: externals,
        plugins
    }).then(function (bundle) {
        return bundle.write({
            dest: `dist/${leafID}${min ? ".min" : ""}.js`,
            format: "umd",
            moduleName: myPackage.name,
            globals,
            sourceMap: true
        });
    });
}

Promise.all([
    bundle(),
    bundle(true)
]).catch(console.error);
