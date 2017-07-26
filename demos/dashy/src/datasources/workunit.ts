import { PropertyExt } from "@hpcc-js/common";
import { Workunit as CommsWorkunit } from "@hpcc-js/comms";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { WUResult } from "./wuresult";

export class Workunit extends PropertyExt implements IDatasource {
    _workunit: CommsWorkunit;
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

            this._workunit = CommsWorkunit.attach({ baseUrl: this.url() }, this.wuid());
            this.refreshPromise = new Promise((resolve, reject) => {
                this._workunit.fetchResults().then(results => {
                    this._results = results.map(result => {
                        return new WUResult()
                            .url(this.url())
                            .wuid(this.wuid())
                            .resultName(result.Name)
                            ;
                    });
                    resolve();
                }).catch(e => {
                    resolve();
                });
            });
        }
        return this.refreshPromise;
    }

    results(): WUResult[] {
        return [...this._results];
    }

    outFields(): IField[] {
        return [];
    }

    total(): number {
        return 0;
    }

    fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve([]);
    }
}
Workunit.prototype._class += " ESPWorkunit";

export interface Workunit {
    url(): string;
    url(_: string): this;
    wuid(): string;
    wuid(_: string): this;
}

Workunit.prototype.publish("url", "http://192.168.3.22:8010", "string", "ESP Url");
Workunit.prototype.publish("wuid", "", "string", "WU ID");
