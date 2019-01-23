declare const process: any;

//  @ts-ignore
export const root: any = new Function("return this;")(); //  Prevent bundlers from messing with "this"

export const isBrowser: boolean = typeof window !== "undefined" && root === window;
export const isNode: boolean = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
export const isTravis: boolean = isNode && process.env != null && process.env.TRAVIS != null;

const globalNS = "@hpcc-js/util/globals";
export function globalsT<T>(defaults: T, ns: string = globalNS): T {
    root[ns] = root[ns] || {} as T;
    for (const key in defaults) {
        root[ns][key] = root[ns][key] || defaults[key];
    }
    return root[ns];
}
