import { json as d3Json } from "d3-request";
import * as toposort from "toposort";

export interface IPackage {
    json: object;
    deps: IPackage[];
}

let cachedPackages: { [path: string]: PackageInfo } = {};
let resolvedPackages: { [path: string]: PackageInfo } = {};
export function clearCache() {
    cachedPackages = {};
    resolvedPackages = {};
}

function idFormatter(packageID: string, version: string = ""): string {
    return version ? `${packageID}@${version}` : packageID;
}

function pathFormatter(basePath: string, packageID: string, version: string = "") {
    return `${basePath}/${idFormatter(packageID, version)}/package.json`;
}

export class PackageInfo {
    protected _basePath: string;
    protected _packageID: string;
    protected _version: string;
    protected _cache: { [path: string]: PackageInfo };

    protected _packageJson: object | null = null;
    protected _dependencies: PackageInfo[] = [];
    protected _dependenciesLoaded: boolean = false;
    protected _rdependencies: PackageInfo[] = [];

    private constructor(basePath: string, packageID: string, version: string = "", cache = cachedPackages) {
        this._basePath = basePath;
        this._packageID = packageID;
        this._version = version;
        this._cache = cache;
        this._cache[this.path()] = this;
    }

    static create(id: string, deps: PackageInfo[]): PackageInfo {
        const retVal = new PackageInfo("", id, "");
        retVal.dependencies(deps);
        return retVal;
    }

    static attach(basePath: string, packageID: string, version: string = "", cache = cachedPackages): PackageInfo {
        let retVal = cache[pathFormatter(basePath, packageID, version)];
        if (!retVal) {
            retVal = new PackageInfo(basePath, packageID, version, cache);
            cache[pathFormatter(basePath, packageID, version)] = retVal;
        }
        return retVal;
    }

    static npmAttach(packageID: string, version: string = "", cache = cachedPackages): PackageInfo {
        return PackageInfo.attach("https://unpkg.com", packageID, version, cache);
    }

    packageID() {
        return this._packageID;
    }

    id() {
        return idFormatter(this._packageID, this._version);
    }

    path() {
        return pathFormatter(this._basePath, this._packageID, this._version);
    }

    fetchPackageInfo(): Promise<any> {
        if (this._packageJson) {
            return Promise.resolve(this._packageJson);
        }
        return new Promise<object>((resolve, reject) => {
            d3Json(this.path(), (json: object) => {
                this._packageJson = json;
                resolvedPackages[this.path()] = this;
                resolve(json);
            });
        });
    }

    fetchDependencies(recursive: boolean = false): Promise<PackageInfo[]> {
        if (this._dependenciesLoaded) {
            return Promise.resolve(this._dependencies);
        }
        this._dependenciesLoaded = true;
        return this.fetchPackageInfo().then((json) => {
            const deps = json && json.dependencies ? json.dependencies : {};
            const promises: any[] = [];
            for (const key in deps) {
                const dependent = PackageInfo.attach(this._basePath, key, deps[key], this._cache);
                this.addDependency(dependent);
                if (recursive) {
                    promises.push(dependent.fetchDependencies(recursive));
                }
            }
            return Promise.all(promises).then(() => {
                return this._dependencies;
            });
        });
    }

    dependencies(): PackageInfo[];
    dependencies(_: PackageInfo[]): this;
    dependencies(_?: PackageInfo[]): PackageInfo[] | this {
        if (_ === void 0) return this._dependencies || [];
        while (this.dependencies().length) {
            this.removeDepencey(this._dependencies[0]);
        }
        _.forEach(dep => this.addDependency(dep));
        return this;
    }

    addDependency(dependent: PackageInfo) {
        if (this._dependencies.indexOf(dependent) < 0) {
            this._dependencies.push(dependent);
            dependent.addRDepencey(this);
        }
    }

    removeDepencey(dependent: PackageInfo) {
        const idx = this._dependencies.indexOf(dependent);
        if (idx >= 0) {
            this._dependencies.splice(idx, 1);
            dependent.removeRDepencey(this);
        }
    }

    addRDepencey(rdependent: PackageInfo) {
        if (this._rdependencies.indexOf(rdependent) < 0) {
            this._rdependencies.push(rdependent);
        }
    }

    removeRDepencey(rdependent: PackageInfo) {
        const idx = this._rdependencies.indexOf(rdependent);
        if (idx >= 0) {
            this._rdependencies.splice(idx, 1);
        }
    }

    allDependencies(): PackageInfo[] {
        const retVal: PackageInfo[] = [];
        this.walk(pckg => {
            retVal.push(pckg);
        });
        return retVal;
    }

    rdependencies() {
        return this._rdependencies;
    }

    walk(callback: (pckg: PackageInfo) => void) {
        callback(this);
        this.dependencies().forEach(pckg => pckg.walk(callback));
    }
}

export interface IEdge {
    from: PackageInfo;
    to: PackageInfo;
}

export interface IGraph {
    vertices: PackageInfo[];
    edges: IEdge[];
}

function packages2Graph(packages: PackageInfo[]): IGraph {
    const retVal: IGraph = {
        vertices: [],
        edges: []
    };
    for (const from of packages) {
        retVal.vertices.push(from);
        from.dependencies()!.forEach((to) => {
            retVal.edges.push({ from, to });
        });
    }
    return retVal;
}

function cache2Graph(cache: { [path: string]: PackageInfo }): IGraph {
    const packages: PackageInfo[] = [];
    for (const key in cache) {
        packages.push(cache[key]);
    }
    return packages2Graph(packages);
}

export function dependencyGraph(packages: string[]): Promise<IGraph> {
    const cache: { [path: string]: PackageInfo } = {};
    return Promise.all(packages.map((packageID) => {
        return PackageInfo.npmAttach(packageID, "", cache).fetchDependencies(true);
    })).then(() => {
        return cache2Graph(cache);
    });
}

export function dependencyGraphNoVersions(packages: string[]): Promise<IGraph> {
    return dependencyGraph(packages).then(graph => {
        const vArr: PackageInfo[] = [];
        const vMap: { [id: string]: PackageInfo } = {};
        const eArr: IEdge[] = [];
        const eMap: { [id: string]: IEdge } = {};

        graph.vertices.forEach(function (v) {
            if (!vMap[v.packageID()]) {
                vMap[v.packageID()] = v;
                vArr.push(v);
            }
        });
        graph.edges.forEach(function (e) {
            const edgeID = e.from.packageID() + "->" + e.to.packageID();
            if (!eMap[edgeID]) {
                eMap[edgeID] = e;
                eArr.push(e);
            }
        });
        return {
            vertices: vArr,
            edges: eArr
        };
    });
}

export function optimize(packages: string[], graph: IGraph): IGraph {
    const pMap: { [packageID: string]: PackageInfo } = {};
    graph.vertices.forEach(v => pMap[v.packageID()] = v);
    const order: string[] = toposort.default(graph.edges.map(e => [e.from.packageID(), e.to.packageID()])).filter((id: string) => packages.indexOf(id) >= 0).reverse();

    const newPackages: PackageInfo[] = [];
    const aliases: { [id: string]: PackageInfo } = {};
    order.forEach(id => {
        const p = pMap[id];
        newPackages.push(p);
        const deps = p.dependencies().filter(dep => packages.indexOf(dep.packageID()) >= 0);
        const vendorDeps = p.allDependencies().filter(dep => packages.indexOf(dep.packageID()) < 0);
        const p_vendor = PackageInfo.create(id + "-vendor", vendorDeps.map(vdep => {
            let retVal = aliases[vdep.packageID()];
            if (!retVal) {
                aliases[vdep.packageID()] = p_vendor;
                retVal = vdep;
            }
            return retVal;
        }));
        vendorDeps.forEach(vdep => aliases[vdep.packageID()] = p_vendor);
        newPackages.push(p_vendor);
        p.dependencies(deps.concat([p_vendor]));
    });

    return packages2Graph(newPackages);
}
