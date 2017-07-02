import { IDatasource } from "@hpcc-js/api";
import { publish } from "@hpcc-js/common";
import { Common } from "./Common";
import { DatasourceStore } from "./DatasourceStore";

export class DatasourceTable extends Common {
    _prevDatasource;

    constructor() {
        super();
    }

    @publish(null, "object", "Datasource")
    datasource: { (): IDatasource; (_: IDatasource): DatasourceTable };

    invalidate(): this {
        delete this._prevDatasource;
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
    }

    update(domNode, element) {
        super.update(domNode, element);
        if (this._prevDatasource !== this.datasource()) {
            this._prevDatasource = this.datasource();
            if (this._prevDatasource) {
                const store = new DatasourceStore(this._prevDatasource);
                this._dgrid.set("columns", store.columns());
                this._dgrid.set("collection", store);
            }
        }
    }

    click(row, col, sel) {
        console.log(row, col, sel);
    }
}
DatasourceTable.prototype._class += " dgrid_DatasourceTable";
