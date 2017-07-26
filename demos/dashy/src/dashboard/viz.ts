// import { MegaChart } from "@hpcc-js/composite";
import { Pie } from "@hpcc-js/chart";
import { HTMLWidget, SVGWidget } from "@hpcc-js/common";

export class Viz {
    private _widget: HTMLWidget | SVGWidget = new Pie()
        .columns(["labek", "weight"])
        .data([["aaa", 22], ["bbb", 44]])
    ;

    widget() {
        return this._widget;
    }
}
