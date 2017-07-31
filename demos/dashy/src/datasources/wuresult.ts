import { publish } from "@hpcc-js/common";
import { Result } from "@hpcc-js/comms";
import { hashSum } from "@hpcc-js/util";
import { ESPResult } from "./espresult";

export class WUResult extends ESPResult {
    url: { (): string; (_: string): WUResult };
    @publish("", "string", "Workunit ID")
    wuid: { (): string; (_: string): WUResult };
    @publish("", "string", "Result Name")
    resultName: { (): string; (_: string): WUResult };

    _prevHash: string;

    label(): string {
        return `${super.label()}\n${this.wuid()}\n${this.resultName()}`;
    }

    hash(): string {
        return hashSum({
            url: this.url(),
            wuid: this.wuid(),
            resultName: this.resultName()
        });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();
            this._result = new Result({ baseUrl: this.url() }, this.wuid(), this.resultName());
            this.refreshPromise = super.refresh();
        }
        return this.refreshPromise;
    }
}
WUResult.prototype._class += " WUResult";
