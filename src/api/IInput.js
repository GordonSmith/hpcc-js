var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../common/Widget"], function (require, exports, Widget_1) {
    "use strict";
    var IInput = (function (_super) {
        __extends(IInput, _super);
        function IInput() {
            _super.call(this);
        }
        return IInput;
    }(Widget_1.Widget));
    exports.IInput = IInput;
    IInput.prototype = Object.create(Widget_1.Widget.prototype);
    IInput.prototype.publish("name", "", "string", "HTML name for the input");
    IInput.prototype.publish("label", "", "string", "Descriptive label");
    IInput.prototype.publish("value", "", "string", "Input Current Value");
    IInput.prototype.publish("validate", null, "string", "Input Validation");
    //  Implementation  ---
    IInput.prototype.isValid = function () {
        if (this.validate()) {
            var re = new RegExp(this.validate());
            if (!re.test(this.value())) {
                return false;
            }
        }
        return true;
    };
    IInput.prototype.hasValue = function () {
        if (typeof this.type === "function") {
            switch (this.type()) {
                case "radio":
                /* falls through */
                case "checkbox":
                    if (this.value() && this.value() !== "false") {
                        return true;
                    }
                    break;
                default:
                    if (this.value()) {
                        return true;
                    }
                    break;
            }
            return false;
        }
        return this.value() !== "";
    };
    //  Events  ---
    IInput.prototype.blur = function (w) {
    };
    IInput.prototype.click = function (w) {
    };
    IInput.prototype.dblclick = function (w) {
    };
    IInput.prototype.change = function (w) {
    };
    IInput.prototype.resetValue = function (w) {
        w.value(w._inputElement[0].node().value);
    };
    IInput.prototype.disable = function (disable) {
        this._inputElement.forEach(function (e, idx) {
            e.attr("disabled", disable ? "disabled" : null);
        });
    };
});
//# sourceMappingURL=IInput.js.map