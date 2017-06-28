import { publish } from "@hpcc-js/common";
import { HTMLWidget } from "@hpcc-js/common";
import { Result, Workunit } from "@hpcc-js/comms";
import { Deferred, PagingGrid, QueryResults } from "@hpcc-js/dgrid-shim";

class MyStore {
    wuResult: Result;

    constructor(wuResult: Result) {
        this.wuResult = wuResult;
    }

    getIdentity(row) {
        return row.__hpcc_id;
    }

    _request(start, end): Promise<{ totalLength: number, data: any[] }> {
        if (!this.wuResult) return Promise.resolve({ totalLength: 0, data: [] });
        return this.wuResult.fetchRows(start, end - start).then((rows: any[]) => {
            return {
                totalLength: this.wuResult.Total,
                data: rows.map((row, idx) => {
                    row.__hpcc_id = start + idx;
                    return row;
                })
            };
        });
    }

    fetchRange(options): Promise<any[]> {
        const retVal = new Deferred();
        this._request(options.start, options.end).then(response => retVal.resolve(response));
        return new QueryResults(retVal.then(response => response.data), {
            totalLength: retVal.then(response => response.totalLength)
        });
    }
}

export class WUResult extends HTMLWidget {

    protected _wu: Workunit;
    protected _result: Result;
    _dgridDiv;
    _dgrid;

    constructor() {
        super();
        this._tag = "div";
    }

    @publish("http://192.168.3.22:8010", "URL to WsWorkunits")
    wsWorkunitsUrl: { (): string, (_: string): WUResult };
    @publish("W20170424-070701", "Workunit ID")
    wuid: { (): string, (_: string): WUResult };
    @publish("Result 1", "Result Name")
    resultName: { (): string, (_: string): WUResult };

    enter(domNode, element) {
        super.enter(domNode, element);
        this._dgridDiv = element
            .append("div")
            .attr("class", "placeholder")
            ;
        this._dgrid = new PagingGrid({
            columns: [],
            selectionMode: "single",
            cellNavigation: false,
            pagingLinks: 1,
            pagingTextBox: true,
            previousNextArrows: true,
            firstLastArrows: true,
            rowsPerPage: 100,
            pageSizeOptions: [10, 25, 100, 1000]
        }, this._dgridDiv.node());
        this._dgrid.on("dgrid-select", (evt) => {
            if (evt.rows && evt.rows.length) {
                this.click(this.rowToObj(this.data()[evt.rows[0].id]), "", true);
            }
        });
    }

    update(domNode, element) {
        super.update(domNode, element);
        this._dgridDiv
            .style("width", this.width() + "px")
            .style("height", this.height() - 2 + "px")
            ;
        this._dgrid.resize();
        if (!this._result || this._result.Wuid !== this.wuid() || this._result.ResultName !== this.resultName()) {
            this._result = new Result({ baseUrl: this.wsWorkunitsUrl() }, this.wuid(), this.resultName());
            this._result.fetchXMLSchema().then(() => {
                this._dgrid.set("columns", this._result.fields().map(field => {
                    return {
                        field: field.name,
                        label: field.name,
                        sortable: false
                    };
                }));
                this._dgrid.set("collection", new MyStore(this._result));
                // this._dgrid.refresh();
            });
        }
    }

    click(row, col, sel) {
        console.log(row, col, sel);
    }
}
