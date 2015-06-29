/**
 * @file AmChart Pyramid
 * @author HPCC Systems
 */

"use strict";
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "./CommonFunnel", "amcharts.funnel", "../api/I2DChart"], factory);
    } else {
        root.amchart_Pyramid = factory(root.d3, root.amchart_CommonFunnel, root.amcharts, root.api_I2DChart);
    }
}(this, function(d3, CommonFunnel, AmCharts, I2DChart) {
    /**
     * @class amchart_Pyramid
     * @extends amchart_CommonFunnel
     * @extends api_I2DChart
     * @implements api_I2DChart
     */
    function Pyramid() {
        CommonFunnel.call(this);
        /**
         * Specifies the class name of the container.
         * @member {string} _class
         * @memberof amchart_Pyramid
         * @private
         */
        this._class = "amchart_Pyramid";
        /**
         * Specifies the HTML tag type of the container.
         * @member {string} _tag
         * @memberof amchart_Pyramid
         * @private
         */
        this._tag = "div";
    }

    Pyramid.prototype = Object.create(CommonFunnel.prototype);
    Pyramid.prototype.implements(I2DChart.prototype);

    // Publish Params Common To Other Libraries

    Pyramid.prototype.publish("paletteID", "default", "set", "Palette ID", Pyramid.prototype._palette.switch(), {tags:['Basic','Shared']});

    // Publish Params Unique To This Widget

    Pyramid.prototype.publish("tooltipTemplate","[[category]]([[title]]): [[value]]", "string", "Tooltip Text",null,{tags:['Intermediate']});

    /**
     * Populates Data and Columns with testData.
     * @method testData
     * @memberof amchart_Pyramid
     * @instance
     * @public
     * @returns {Widget}
     */
    Pyramid.prototype.testData = function() {
        this.columns(["Subject", "Year 1"]);
        this.data([
            ["Geography", 75],
            ["English", 23],
            ["Math", 98],
            ["Science", 66]
        ]);
        return this;
    };

    /**
     * The function that is executed on first render.
     * @method enter
     * @private
     * @instance
     * @memberof amchart_Pyramid
     * @param {HTMLElement} domeNode HTML DOMNode of widget container.
     * @param {D3Selection} element d3 selection object of widget.
     * @returns {undefined}
     */
    Pyramid.prototype.enter = function(domNode, element) {
        CommonFunnel.prototype.enter.apply(this, arguments);
    };

    /**
     * Updates underlying AmChart widget object, with options from publish parameters.
     * @method updateChartOptions
     * @memberof amchart_Pyramid
     * @instance
     * @private
     * @returns {Object}
     */
    Pyramid.prototype.updateChartOptions = function() {
        CommonFunnel.prototype.updateChartOptions.apply(this, arguments);
    };

    /**
     * The function that is executed on first render, after enter() and everytime the widget is updated with subsequent render calls.
     * @method update
     * @memberof amchart_Pyramid
     * @instance
     * @param {HTMLElement} domeNode HTML DOMNode of widget container.
     * @param {D3Selection} element d3 selection object of widget.
     * @returns {undefined}
     */
    Pyramid.prototype.update = function(domNode, element) {
        CommonFunnel.prototype.update.apply(this, arguments);
    };

    return Pyramid;
}));
