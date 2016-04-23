"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Common", "../api/I2DChart"], factory);
    } else {
        root.plotly_Common2D = factory(root.plotly_Common, root.api_I2DChart);
    }
}(this, function (Common, I2DChart) {
    function Common2D(target) {
        Common.call(this);
        I2DChart.call(this);
    }
    Common2D.prototype = Object.create(Common.prototype);
    Common2D.prototype.constructor = Common2D;
    Common2D.prototype._class += " plotly_Common2D";
    Common2D.prototype.implements(I2DChart.prototype);

    Common2D.prototype.publish("paletteID", "default", "set", "Palette ID", Common2D.prototype._palette.switch(), {tags:["Basic","Shared"]});
    Common2D.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });

    Common2D.prototype.getChartOptions = function () {
        var retVal = Common.prototype.getChartOptions.apply(this, arguments);
        var data = this.data();
        retVal[0].labels = data.map(function (row) { return row[0]; });
        retVal[0].values = data.map(function (row) { return row[1]; });
        return retVal;
    };

    Common2D.prototype.update = function (domNode, element) {
        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        Common.prototype.update.apply(this, arguments);
    };

    return Common2D;
}));
