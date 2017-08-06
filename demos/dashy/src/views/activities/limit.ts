import { hashSum } from "@hpcc-js/util";
import { View } from "../view";
import { Activity } from "./activity";

export class Limit extends Activity {
    _owner: View;

    constructor(owner: View) {
        super();
        this._owner = owner;
        this.monitor((id, newVal, oldVal) => {
            this._owner.broadcast(id, newVal, oldVal, this);
        });
    }

    hash(): string {
        return hashSum({
            limit: this.rows()
        });
    }

    exists(): boolean {
        return this.rows_exists() && this.rows() > 0;
    }

    process(): any[] {
        const data = super.process();
        if (this.exists()) {
            data.length = this.rows();
        }
        return data;
    }
}
Limit.prototype._class += " Limit";

export interface Limit {
    rows(): number | undefined;
    rows(_: number | undefined): this;
    rows_exists: () => boolean;
}
Limit.prototype.publish("rows", undefined, "number", "Limit output");
