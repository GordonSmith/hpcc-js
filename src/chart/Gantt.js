var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Bar"], function (require, exports, Bar_1) {
    "use strict";
    var Gantt = (function (_super) {
        __extends(Gantt, _super);
        function Gantt() {
            _super.call(this);
            this
                .orientation_default("vertical")
                .xAxisType_default("ordinal")
                .yAxisType_default("time");
        }
        return Gantt;
    }(Bar_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Gantt;
    Gantt.prototype._class += " chart_Gantt";
});
//# sourceMappingURL=Gantt.js.map