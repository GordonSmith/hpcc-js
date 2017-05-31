import { Pie } from "@hpcc-js/amchart";
import * as amchart from "@hpcc-js/amchart";
import { Class, HTMLWidget, SVGWidget } from "@hpcc-js/common";
import { data } from "@hpcc-js/sample-data";
import { expect } from "chai";
import { classDef, render } from "./coreTests";

const urlSearch: string = window.location.href.split("?")[1];

describe("@hpcc-js/layout", () => {
    for (const key in amchart) {
        const item = (amchart as any)[key];
        if (item) {
            if (!urlSearch || urlSearch === item.prototype.constructor.name) {
                describe(`${item.prototype.constructor.name}`, () => {
                    if (item.prototype instanceof Class) {
                        classDef("amchart", item);
                    }
                    if (item.prototype instanceof HTMLWidget || item.prototype instanceof SVGWidget) {
                        switch (item.prototype.constructor) {
                            case Pie:
                                render(new Pie()
                                    .columns(data.TwoD.subjects.columns)
                                    .data(data.TwoD.subjects.data)
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
