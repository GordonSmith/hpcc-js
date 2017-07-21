import { publish } from "@hpcc-js/common";
import { Result } from "@hpcc-js/comms";
import { hashSum } from "@hpcc-js/util";
import { ESPResult } from "./espresult";

export class LogicalFile extends ESPResult {
    url: { (): string; (_: string): LogicalFile };
    @publish("", "string", "Logical File Name")
    filename: { (): string; (_: string): LogicalFile };

    _prevHash: string;

    label(): string {
        return `${super.label()}\n${this.filename()}`;
    }

    hash(): string {
        return hashSum({ url: this.url(), fileName: this.filename() });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();
            this._result = new Result({ baseUrl: this.url() }, this.filename());
            this.refreshPromise = super.refresh();
        }
        return this.refreshPromise;
    }
}
LogicalFile.prototype._class += " LogicalFile";
