import { hpcc_js } from "@hpcc-js/requirejs-shim";
import { json as d3Json } from "d3-request";

if (!(window as any).define) {
    (window as any).define = hpcc_js.define;
}

class HTTPResolver {
    _basePath: string;
    cachedPaths: { [key: string]: any } = {};

    constructor(basePath: string) {
        this._basePath = basePath;
    }

    fetchDeps(pckg: string, version: string = "", recursive: boolean = false): Promise<{ [key: string]: any }> {
        if (this.cachedPaths[pckg]) {
            return Promise.resolve(this.cachedPaths);
        } else if (pckg.indexOf("@hpcc-js/") !== 0 || pckg === "@hpcc-js/d3-bullet") {
            return Promise.resolve(this.cachedPaths);
        }
        this.cachedPaths[pckg] = this.formatPath(pckg, version);
        this.cachedPaths[pckg + "-vendor"] = this.formatVendorPath(pckg, version);
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            d3Json(this.formatPackagePath(pckg), (response) => {
                if (!recursive) {
                    resolve(this.cachedPaths);
                }
                const deps = response.dependencies || {};
                const promises = [];
                for (const key in deps) {
                    promises.push(this.fetchDeps(key, deps[key], recursive));
                }
                Promise.all(promises).then(() => {
                    resolve(this.cachedPaths);
                });
            });
        });
    }

    formatPath(pckg: string, version: string = "") {
        return this._basePath + pckg + "/dist/" + pckg.split("/")[1];
    }

    formatVendorPath(pckg: string, version: string = "") {
        return this._basePath + pckg + "/dist/" + pckg.split("/")[1] + "-vendor";
    }

    formatPackagePath(pckg: string) {
        return this._basePath + pckg + "/package.json";
    }
}

class NPMResolver extends HTTPResolver {
    constructor() {
        super("https://unpkg.com/");
    }

    formatPath(pckg: string, version: string = "") {
        if (version) {
            version = "@" + version;
        }
        return this._basePath + pckg + version + "/dist/" + pckg.split("/")[1];
    }

    formatVendorPath(pckg: string, version: string = "") {
        if (version) {
            version = "@" + version;
        }
        return this._basePath + pckg + version + "/dist/" + pckg.split("/")[1] + "-vendor";
    }
}

const httpResolver: { [key: string]: HTTPResolver } = {};
const npmResolver: NPMResolver = new NPMResolver();

function load(resolver: HTTPResolver, ...packages: string[]): Promise<any[]> {
    return new Promise<any>((resolve, reject) => {
        Promise.all(packages.map((pckg) => {
            return resolver.fetchDeps(pckg, "", true);
        })).then(() => {
            const requirejs = hpcc_js.require.config({
                paths: resolver.cachedPaths
            });
            requirejs(packages, (...response: any[]) => {
                resolve(response);
            }, (err: any) => {
                reject(err);
            });
        });
    });
}

export function httpLoad(basePath: string, ...packages: string[]): Promise<any[]> {
    if (!httpResolver[basePath]) {
        httpResolver[basePath] = new HTTPResolver(basePath);
    }
    return load(httpResolver[basePath], ...packages);
}

export function npmLoad(...packages: string[]): Promise<any[]> {
    return load(npmResolver, ...packages);
}
