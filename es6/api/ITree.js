import { ordinal } from "../common/Palette"

export default class ITree {
}
ITree.prototype._palette = ordinal("default");

//  Events  ---
ITree.prototype.click = function (row, column, selected) {
    console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
};

ITree.prototype.dblclick = function (row, column, selected) {
    console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
};
