import { define, require as requirejs } from "@hpcc-js/requirejs-shim";
import { packages, shims, thirdParty } from "./meta";

//  Calculate hosting url
const hostUrl = (function () {
    let retVal = "";
    if (document && document.currentScript) {
        retVal = (document.currentScript as any).src;
    } else {
        const scripts = document.getElementsByTagName("script");
        for (let i = scripts.length - 1; i >= 0; --i) {
            const script = scripts[i];
            const url: string = script.getAttribute.length !== undefined ? script.src : script.getAttribute("src") || "";
            if (url.indexOf("loader.js") > 0 || url.indexOf("hpcc-viz.js") > 0) {
                retVal = url;
                break;
            }
        }
    }
    const retValParts = retVal.split("/");
    retValParts.pop();  //  loader.js
    retValParts.pop();  //  dist/
    retValParts.pop();  //  loader/
    return retValParts.join("/");
})();

const load = requirejs.load;
requirejs.load = function (context, moduleId, url) {
    //  Temp hook for transition to ts /d3.v4 ---
    if (moduleId.length >= 4 && moduleId.indexOf(".css") === moduleId.length - 4) {
        const newUrl = url.substring(0, url.length - 3);
        const link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = newUrl;
        document.getElementsByTagName("head")[0].appendChild(link);
        url = hostUrl + "/loader/rjs.noop.js";
    }
    return load(context, moduleId, url);
};

if (!(window as any).define) {
    (window as any).define = define;
}

export function bundle(url: string, additionalPaths: { [key: string]: string } = {}, min: boolean = true): any {
    const paths: { [key: string]: string } = additionalPaths;
    const minStr = min ? ".min" : "";
    shims.forEach(shim => { paths[`@hpcc-js/${shim}`] = `${url}/${shim}/dist/${shim}`; });
    packages.forEach(pckg => {
        paths[`@hpcc-js/${pckg}`] = `${url}/${pckg}/dist/${pckg}${minStr}`;
        paths[`@hpcc-js/${pckg}-vendor`] = `${url}/${pckg}/dist/${pckg}-vendor${minStr}`;
    });
    return requirejs.config({
        context: url,
        paths
    });
}

export function npm(additionalPaths: { [key: string]: string } = {}, min: boolean = true): any {
    return bundle("https://unpkg.com/@hpcc-js", additionalPaths, min);
}

export function cdn(version?: string, additionalPaths: { [key: string]: string } = {}, min: boolean = true): any {
    const url = version === void 0 ? hostUrl : `https://viz.hpccsystems.com/${version}`;
    return bundle(url, additionalPaths, min);
}

export function amd(url: string = hostUrl, additionalPaths: { [key: string]: string } = {}, thirdPartyUrl: string = "file:///C:/Users/gordon/git/hpcc-js/node_modules"): any {
    const thirdPartyPaths: { [key: string]: string } = {};
    for (const key in thirdParty) {
        thirdPartyPaths[key] = `${thirdPartyUrl}/${thirdParty[key]}`;
    }
    const paths: { [key: string]: string } = {
        ...thirdPartyPaths,
        ...additionalPaths
    };
    const rjsPackages: any = [];
    shims.forEach(shim => { paths[`@hpcc-js/${shim}`] = `${url}/${shim}/dist/${shim}`; });
    packages.forEach(pckg => {
        paths[`@hpcc-js/${pckg}`] = `${url}/${pckg}`;
        rjsPackages.push({
            name: `@hpcc-js/${pckg}`,
            main: "lib/index"
        });
        paths[`@hpcc-js/${pckg}`] = `${url}/${pckg}`;
    });
    return requirejs.config({
        context: url,
        paths,
        packages: rjsPackages
    });
}
