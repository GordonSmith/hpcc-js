var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Scatter"], function (require, exports, Scatter_1) {
    "use strict";
    var Area = (function (_super) {
        __extends(Area, _super);
        function Area() {
            _super.call(this);
            this
                .interpolate_default("linear")
                .interpolateFill_default(true);
        }
        return Area;
    }(Scatter_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Area;
    Area.prototype._class += " chart_Area";
});
//# sourceMappingURL=Area.js.map