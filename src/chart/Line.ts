import { Scatter } from "./Scatter";
import "css!./Line.css";

export function Line() {
    Scatter.call(this);

    this
        .interpolate_default("linear")
        ;
}
Line.prototype = Object.create(Scatter.prototype);
Line.prototype.constructor = Line;
Line.prototype._class += " chart_Line";
