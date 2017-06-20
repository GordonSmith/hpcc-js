import { define, requirejs } from "@hpcc-js/requirejs-shim";

if (!(window as any).define) {
    (window as any).define = define;
}

const shims = ["codemirror-shim", "c3-shim", "dgrid-shim", "phosphor-shim", "preact-shim"];
const packages = [
    "common", "layout", "phosphor", "api", "dgrid", "chart", "other", "form",
    "c3chart", "google", "amchart", "tree", "graph", "map",
    "handson", "react", "composite", "marshaller", "ddl", "html", "codemirror"
];

let rjs: any = npm();
export function source(url: string, additionalPaths: { [key: string]: string } = {}): any {
    const paths: { [key: string]: string } = additionalPaths;
    shims.forEach(shim => { paths[`@hpcc-js/${shim}`] = `${url}/@hpcc-js/${shim}/dist/${shim}`; });
    packages.forEach(pckg => {
        paths[`@hpcc-js/${pckg}`] = `${url}/@hpcc-js/${pckg}/dist/${pckg}.min`;
        paths[`@hpcc-js/${pckg}-vendor`] = `${url}/@hpcc-js/${pckg}/dist/${pckg}-vendor.min`;
    });
    rjs = requirejs.config({ paths });
    return rjs;
}

export function npm(additionalPaths: { [key: string]: string } = {}): any {
    return source("https://unpkg.com", additionalPaths);
}

export { rjs as require };
