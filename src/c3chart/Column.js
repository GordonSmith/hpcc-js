import { CommonND } from "./CommonND";

export function Column(target) {
    CommonND.call(this);

    this._type = "bar";
}
Column.prototype = Object.create(CommonND.prototype);
Column.prototype.constructor = Column;
Column.prototype._class += " c3chart_Column";

Column.prototype.publish("stacked", false, "boolean", "Stack Chart", null, { tags: ["Basic", "Shared"] });

Column.prototype.enter = function (domNode, element) {
    CommonND.prototype.enter.apply(this, arguments);
};

Column.prototype.update = function (domNode, element) {
    CommonND.prototype.update.apply(this, arguments);

    if (this.stacked()) {
        this.c3Chart.groups([this.columns().slice(1, this.columns().length)]);
    } else {
        this.c3Chart.groups([]);
    }
};
