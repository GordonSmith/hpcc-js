import { Workunit } from "@hpcc-js/comms";
import { Table } from "@hpcc-js/dgrid";
import { ChartPanel } from "@hpcc-js/layout";
import { hashSum } from "@hpcc-js/util";

export class WUStats extends ChartPanel {

    protected _chart = new Table();

    constructor() {
        super();
        this.topOverlay(false);
        this.widget(this._chart);
    }

    private _prevHashSum;
    // private _prevScopeGraph: ScopeGraph;
    fetchDetails() {
        const hash = hashSum({
            baseUrl: this.baseUrl(),
            wuid: this.wuid()
        });
        if (this._prevHashSum !== hash) {
            this._prevHashSum = hash;
            this.startProgress();
            const wu = Workunit.attach({ baseUrl: this.baseUrl() }, this.wuid());
            return wu.fetchDetailsNormalized({
                ScopeFilter: {
                    MaxDepth: 999999,
                    ScopeTypes: []
                },
                NestedFilter: {
                    Depth: 999999,
                    ScopeTypes: []
                },
                PropertiesToReturn: {
                    AllProperties: true,
                    AllStatistics: true,
                    AllHints: true,
                    MinVersion: undefined,
                    Measure: undefined,
                    Properties: []
                },
                ScopeOptions: {
                    IncludeId: true,
                    IncludeScope: true,
                    IncludeScopeType: true
                },
                PropertyOptions: {
                    IncludeName: true,
                    IncludeRawValue: true,
                    IncludeFormatted: false,
                    IncludeMeasure: true,
                    IncludeCreator: true,
                    IncludeCreatorType: true
                }
            }).then(details => {
                const columnIDs: string[] = [];
                const columns: string[] = [];
                for (const key in details.columns) {
                    if (details.columns[key].Measure) {
                        columnIDs.push(key);
                        columns.push(`${key} (${details.columns[key].Measure})`);
                    }
                }
                this
                    .columns(columns)
                    .data(details.data.map(row => {
                        const retVal = [];
                        for (const column of columnIDs) {
                            retVal.push(row[column]);
                        }
                        return retVal;
                    }))
                    .render()
                    ;
                this.finishProgress();
            });
        }
    }

    enter(domNode, _element) {
        super.enter(domNode, _element);
    }

    update(domNode, element) {
        this.fetchDetails();
        super.update(domNode, element);
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }
}
WUStats.prototype._class += " eclwatch_WUStats";

export interface WUStats {
    baseUrl(): string;
    baseUrl(_: string): this;
    wuid(): string;
    wuid(_: string): this;
}

WUStats.prototype.publish("baseUrl", "", "string", "HPCC Platform Base URL");
WUStats.prototype.publish("wuid", "", "string", "Workunit ID");
