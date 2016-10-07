import Scatter from "./Scatter"
import "css!./Line"

export default class Line extends Scatter {
    constructor() {
        super();
        this
            .interpolate_default("linear")
        ;
    }
}
Line.prototype._class += " chart_Line";
