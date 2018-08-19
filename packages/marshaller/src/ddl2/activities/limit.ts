import { publish } from "@hpcc-js/common";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { hashSum } from "@hpcc-js/util";
import { Activity } from "./activity";
import { ImmData, ImmDB, ImmFields } from "./immutable";

export class Limit extends Activity {

    @publish(undefined, "number", "Limit output")
    rows: publish<this, number | undefined>;
    rows_exists: () => boolean;

    constructor() {
        super();
    }

    toDDL(): DDL2.ILimit {
        return {
            type: "limit",
            limit: this.rows()
        };
    }

    static fromDDL(ddl: DDL2.ILimit): Limit {
        return new Limit()
            .rows(ddl.limit)
            ;
    }

    hash(): string {
        return hashSum({
            limit: this.rows()
        });
    }

    exists(): boolean {
        return this.rows_exists() && this.rows() > 0;
    }

    dataFunc(): (inDB: ImmDB) => ImmDB {
        return (inDB: ImmDB) => {
            if (inDB.data.size === 0 || !this.exists()) return inDB;
            return {
                fields: inDB.fields,
                data: inDB.data = inDB.data.slice(0, Math.min(this.rows(), inDB.data.size))
            };
        };
    }
}
Limit.prototype._class += " Limit";
