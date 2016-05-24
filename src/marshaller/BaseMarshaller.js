"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["../common/HTMLWidget", "./HipieDDLMixin"], factory);
    } else {
        root.marshaller_BSMarshaller = factory(root.layout_HTMLWidget, root.marshaller_HipieDDLMixin);
    }
}(this, function (HTMLWidget, HipieDDLMixin) {
    function BaseMarshaller() {
        HTMLWidget.call(this);

        HipieDDLMixin.call(this);
    }
    BaseMarshaller.prototype = Object.create(HTMLWidget.prototype);
    BaseMarshaller.prototype.constructor = BaseMarshaller;
    BaseMarshaller.prototype.mixin(HipieDDLMixin);
    BaseMarshaller.prototype._class += " marshaller_BaseMarshaller";

    BaseMarshaller.prototype.content = function () {
        return [];
    };

    BaseMarshaller.prototype.populateContent = function () {
    };

    BaseMarshaller.prototype.render = function (callback) {
        this._marshallerRender(HTMLWidget.prototype, callback);
        return this;
    };

    BaseMarshaller.prototype.commsError = function (source, error) {
        alert("Comms Error:\n" + source + "\n" + error);
    };

    return BaseMarshaller;
}));
