import { Column } from "./Column";

export class Bar extends Column {
    constructor() {
        super();

        this._chartType = "BarChart";
    }
}
Bar.prototype = Object.create(Column.prototype);
Bar.prototype.constructor = Bar;
Bar.prototype._class += " google_Bar";
