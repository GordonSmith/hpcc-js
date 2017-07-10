import { publish } from "@hpcc-js/common";
import { Result } from "@hpcc-js/comms";
import { hashSum } from "@hpcc-js/util";
import { ESPResult } from "./espresult";

export class LogicalFile extends ESPResult {
    url: { (): string; (_: string): LogicalFile };
    @publish("", "string", "Logical File Name")
    fileName: { (): string; (_: string): LogicalFile };

    _prevHash;

    label(): string {
        return this.fileName();
    }

    hash(): string {
        return hashSum({ url: this.url(), fileName: this.fileName() });
    }

    refreshPromise: Promise<void>;
    refresh(): Promise<void> {
        if (this._prevHash !== this.hash()) {
            this._prevHash = this.hash();
            this._result = new Result({ baseUrl: this.url() }, this.fileName());
            this.refreshPromise = super.refresh();
        }
        return this.refreshPromise;
    }
}
LogicalFile.prototype._class += " LogicalFile";
