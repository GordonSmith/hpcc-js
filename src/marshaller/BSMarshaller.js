"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "./HipieDDLMixin"], factory);
    } else {
        root.marshaller_BSMarshaller = factory(root.d3, root.layout_HTMLWidget, root.marshaller_HipieDDLMixin);
    }
}(this, function (d3, HTMLWidget, HipieDDLMixin) {
    function BSMarshaller() {
        HTMLWidget.call(this);
        HipieDDLMixin.call(this);
        this._tag = "div";
    }
    BSMarshaller.prototype = Object.create(HTMLWidget.prototype);
    BSMarshaller.prototype.constructor = BSMarshaller;
    BSMarshaller.prototype.mixin(HipieDDLMixin);
    BSMarshaller.prototype._class += " marshaller_BSMarshaller";

    BSMarshaller.prototype.content = function () {
        return [];
    };

    BSMarshaller.prototype.populateContent = function () {
        var d = 0;
    };

    BSMarshaller.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
    };

    BSMarshaller.prototype.render = function (callback) {
        this.marshallerRender(HTMLWidget.prototype, callback);
        return this;
    };

    BSMarshaller.prototype.commsError = function (source, error) {
        alert("Comms Error:\n" + source + "\n" + error);
    };

    return BSMarshaller;
}));
