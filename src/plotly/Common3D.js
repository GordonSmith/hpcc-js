"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Common", "../api/I2DChart"], factory);
    } else {
        root.plotly_Common3D = factory(root.plotly_Common, root.api_I2DChart);
    }
}(this, function (Common, I2DChart) {
    function Common3D(target) {
        Common.call(this);
        I2DChart.call(this);
    }
    Common3D.prototype = Object.create(Common.prototype);
    Common3D.prototype.constructor = Common3D;
    Common3D.prototype._class += " plotly_Common3D";
    Common3D.prototype.implements(I2DChart.prototype);

    Common3D.prototype.publish("paletteID", "default", "set", "Palette ID", Common3D.prototype._palette.switch(), {tags:["Basic","Shared"]});
    Common3D.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });

    Common3D.prototype.getChartOptions = function () {
        var retVal = Common.prototype.getChartOptions.apply(this, arguments);
        if (retVal.length === 1) {
            retVal.push({});
        }
        var data = this.data();
        retVal[0].type = 'scatter3d';
        retVal[0].x = data.map(function (row) { return row[0]; });
        retVal[0].y = data.map(function (row) { return row[1]; });
        retVal[0].z = data.map(function (row) { return row[2]; });
        retVal[0].mode = "markers";
        retVal[0].marker = {
            color: 'rgb(23, 190, 207)',
            size: 2
        };

        retVal[1].alphahull = 7;
        retVal[1].opacity = 0.1;
        retVal[1].type = 'mesh3d';
        retVal[1].x = data.map(function (row) { return row[0]; });
        retVal[1].y = data.map(function (row) { return row[1]; });
        retVal[1].z = data.map(function (row) { return row[2]; });
        return retVal;
    };

    Common3D.prototype.update = function (domNode, element) {
        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        Common.prototype.update.apply(this, arguments);
    };

    return Common3D;
}));
