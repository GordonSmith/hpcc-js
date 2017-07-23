import { PropertyExt, publish } from "@hpcc-js/common";
import { Workunit } from "@hpcc-js/comms";
import { hashSum } from "@hpcc-js/util";
import { WUResult } from "./wuresult";

export class ESPWorkunit extends PropertyExt {
    url: { (): string; (_: string): Workunit };
    @publish("", "string", "Workunit ID")
    wuid: { (): string; (_: string): Workunit };

    _workunit: Workunit;
    _results: WUResult[] = [];
    _prevHash: string;

    label(): string {
        return `${this.wuid()}`;
    }

    hash(): string {
        return hashSum({ url: this.url(), wuid: this.wuid() });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();

            this._workunit = Workunit.attach({ baseUrl: this.url() }, this.wuid());
            return this._workunit.fetchResults().then(results => {
                this._results = results.map(result => {
                    return new WUResult()
                        .url(this.url())
                        .wuid(this.wuid())
                        .resultName(result.Name)
                        ;
                });
            });
        }
        return this.refreshPromise;
    }
}
ESPWorkunit.prototype._class += " ESPWorkunit";

