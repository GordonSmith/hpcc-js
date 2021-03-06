// tslint:disable: no-require-imports

// DOM Parser polyfill  ---
import { root } from "@hpcc-js/util";
import { DOMParser } from "xmldom";
root.DOMParser = DOMParser;

//  fetch polyfill  ---
import fetch from "node-fetch";
if (typeof root.fetch === "undefined") {
    root.fetch = fetch;

    // tslint:disable-next-line: no-var-requires
    const https = require("https");
    root.fetch.__agent = new https.Agent({
        rejectUnauthorized: false
    });
}

//  btoa polyfill  ---
import { Buffer } from "safe-buffer";
if (typeof root.btoa === "undefined") {
    root.btoa = function (str: string) {
        return Buffer.from(str || "", "utf8").toString("base64");
    };
}

export * from "./index-common";

//  Client Tools  ---
export * from "./clienttools/eclcc";
export * from "./clienttools/eclMeta";
