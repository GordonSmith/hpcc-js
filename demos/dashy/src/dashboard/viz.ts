// import { MegaChart } from "@hpcc-js/composite";
import { Pie } from "@hpcc-js/chart";
import { HTMLWidget, SVGWidget } from "@hpcc-js/common";
import { Model } from "../model";
import { FlatView } from "../views/flatview";

export class Viz extends FlatView {
    private _widget: HTMLWidget | SVGWidget = new Pie()
        .columns(["labek", "weight"])
        .data([["aaa", 22], ["bbb", 44]])
    ;

    constructor(model: Model, label: string = "Viz") {
        super(model, label);
    }

    widget() {
        return this._widget;
    }
}
