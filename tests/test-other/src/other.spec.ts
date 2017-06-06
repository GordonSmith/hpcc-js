import { Class, HTMLWidget, Palette, SVGWidget } from "@hpcc-js/common";
import * as other from "@hpcc-js/other";
import { WordCloud } from "@hpcc-js/other";
import { data } from "@hpcc-js/sample-data";
import { expect } from "chai";
import { classDef, render } from "./coreTests";

const urlSearch: string = window.location.href.split("?")[1];

describe("@hpcc-js/common", () => {
    for (const key in other) {
        const item = (other as any)[key];
        if (item) {
            if (!urlSearch || urlSearch === item.prototype.constructor.name) {
                describe(`${item.prototype.constructor.name}`, () => {
                    if (item.prototype instanceof Class) {
                        classDef("other", item);
                    }
                    if (item.prototype instanceof HTMLWidget || item.prototype instanceof SVGWidget) {
                        switch (item.prototype.constructor) {
                            case WordCloud:
                                const words = data.WordCloud.simple.words.map(function (d) {
                                    return [d, 1 + Math.random() * 100];
                                });
                                render(new WordCloud()
                                    .columns(data.WordCloud.simple.columns)
                                    .data(words)
                                );
                                break;
                            default:
                                it("Has render test", () => {
                                    expect(false).to.be.true;
                                });
                        }
                    }
                });
            }
        }
    }
});
