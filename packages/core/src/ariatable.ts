import * as d3 from "./d3";
import { publish } from "./serialize";
import { Surface } from "./surface";

import "../src/ARIATable.css";
import "./lite/api";

export class AriaTable extends Surface<"table"> {
    private _caption: any;
    private _tableHeader: any;
    private _tableBody: any;

    constructor() {
        super("table");
    }

    @publish("", "Table caption")
    caption: publish<string, this>;

    @publish([], "Table caption")
    columns: publish<string[], this>;

    @publish([], "Table caption")
    data: publish<any[][], this>;

    enter(element) {
        super.enter(element);
        element.classed("sr-only", true);
        this._caption = element.append("caption");
        this._tableHeader = element.append("thead").append("tr");
        this._tableBody = element.append("tbody");
    }

    update(element) {
        super.update(element);
        const id = this.id();

        this._caption.text(this.caption());
        const headerCells = this._tableHeader.selectAll(".th_" + id).data(this.columns());
        headerCells.enter().append("th")
            .attr("id", (d, i) => "c" + id + "_" + i)
            .attr("scope", "col")
            .attr("class", "th_" + id)
            .merge(headerCells)
            .text(d => d)
            ;
        headerCells.exit().remove();

        const rows = this._tableBody.selectAll(".tr_" + id).data(this.data());
        const rowsUpdate = rows.enter().append("tr")
            .attr("class", "tr_" + id)
            .merge(rows)
            ;

        //  Cells ---
        const cells = rowsUpdate.selectAll(".td_" + id).data(d => d);
        cells.enter().append((d, i) => document.createElement(i === 0 ? "th" : "td"))
            .attr("scope", "row")
            .attr("headers", (d, i) => "c" + id + "_" + i)
            .attr("class", "td_" + id)
            .each(function (this: Element, d, i) {
                if (i > 0) {
                    d3.select(this).append("a")
                        .attr("tabindex", -1)
                        .attr("href", "#")
                        .on("click", function (d, i) {
                            d3.event().preventDefault();
                            return false;
                        })
                        ;
                } else {
                    d3.select(this)
                        .attr("tabindex", -1)
                        ;
                }
            })
            .merge(cells)
            .each(function (this: Element, d, i) {
                if (i > 0) {
                    d3.select(this).select("a").text(d);
                } else {
                    d3.select(this).text(d);
                }
            })
            ;
        cells.exit().remove();

        rows.exit().remove();
    }
}
