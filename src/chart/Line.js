var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Scatter", "css!./Line"], function (require, exports, Scatter_1) {
    "use strict";
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line() {
            _super.call(this);
            this
                .interpolate_default("linear");
        }
        return Line;
    }(Scatter_1.Scatter));
    exports.Line = Line;
    Line.prototype._class += " chart_Line";
});
//# sourceMappingURL=Line.js.map