import { publish } from "@hpcc-js/common";
import { ElementContainer } from "../model/element";
import { Databomb } from "./databomb";
import { Datasource, DatasourceSelection } from "./datasource";

function formatID(ds: Datasource) {
    return `${ds.id()} - ${ds.label()}`;
}

function parseID(dsID: string) {
    return dsID.split(" - ")[0];
}

let dsPickerID = 0;
export class DSPicker extends DatasourceSelection {
    private _elementContainer: ElementContainer;
    private _nullDatasource = new Databomb("empty");

    @publish("", "set", "Datasource", function (this: DSPicker) { return this.datasourceIDs(); }, { optional: false })
    _datasourceID: string; // DDL2.IDatasourceType;
    datasourceID(_?: string): this | string {
        if (!arguments.length) return this._datasourceID;
        if (this._datasourceID !== _) {
            this._datasourceID = _;
            this.selection(this._elementContainer.datasource(parseID(_)));
        }
        return this;
    }

    selection(): Datasource;
    selection(_: Datasource): this;
    selection(_?: Datasource): Datasource | this {
        const retVal = super.selection.apply(this, arguments);
        if (!arguments.length) return retVal || this._nullDatasource;
        if (this._datasourceID !== formatID(_)) {
            this._datasourceID = formatID(_);
        }
        return this;
    }

    constructor(ec: ElementContainer) {
        super();
        this._id = `ds_${++dsPickerID}`;
        this._elementContainer = ec;
        const ds = this._elementContainer.datasources()[0];
        this.selection(ds);
    }

    datasourceIDs() {
        return this._elementContainer.datasources().map(formatID).concat([
            "...new databomb",
            "...new form",
            "...new WU Result",
            "...new Roxie Request"
        ]);
    }
}
DSPicker.prototype._class += " DSPicker";
