var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Column"], function (require, exports, Column_1) {
    "use strict";
    var Bar = (function (_super) {
        __extends(Bar, _super);
        function Bar() {
            _super.call(this);
            this.orientation_default("vertical");
        }
        return Bar;
    }(Column_1.Column));
    exports.Bar = Bar;
    Bar.prototype._class += " chart_Bar";
});
//# sourceMappingURL=Bar.js.map