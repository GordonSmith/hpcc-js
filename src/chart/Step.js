var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Scatter"], function (require, exports, Scatter_1) {
    "use strict";
    var Step = (function (_super) {
        __extends(Step, _super);
        function Step() {
            _super.call(this);
            this
                .interpolate_default("step");
        }
        return Step;
    }(Scatter_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Step;
    Step.prototype._class += " chart_Step";
});
//# sourceMappingURL=Step.js.map