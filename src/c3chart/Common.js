"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "c3", "../common/HTMLWidget", "css!c3"], factory);
    } else {
        root.c3chart_Common = factory(root.d3, root.c3, root.common_HTMLWidget);
    }
}(this, function (d3, c3, HTMLWidget) {
    function Common(target) {
        HTMLWidget.call(this);

        this._tag = "div";
        this._type = "unknown";
        var context = this;
        this._config = {
            axis: {
            },
            legend: {
                position: 'bottom',
                show: true
            },
            data: {
                columns: [],
                rows: []
            }
        };
    };

    Common.prototype = Object.create(HTMLWidget.prototype);
    Common.prototype._class += " c3chart_Common";

    /**
     * Publish Params Common To Other Libraries
     */
    Common.prototype.publish("showLegend", true, "boolean", "Show/Hide Legend",null,{tags:['Basic','TODO2']});
    Common.prototype.publish("legendFontColor", "#000", "html-color", "Font Color",null,{tags:['Intermediate','TODO2']});
    Common.prototype.publish("legendFontSize", 11, "number", "Font Size",null,{tags:['Intermediate','TODO2']});
    Common.prototype.publish("legendFontFamily", null, "string", "Legend Font Name",null,{tags:['Private']});
    Common.prototype.publish("legendFontBold", false, "boolean", "Legend Font Bold",null,{tags:['Private']});
    Common.prototype.publish("legendFontItalic", false, "boolean", "Legend Font Italic",null,{tags:['Private']});
    
    /**
     * Publish Params Unique To This Widget
     */   
    Common.prototype.publish("legendPosition", "right", "set", "Legend Position", ["bottom", "right"],{tags:['Intermediate','TODO2']});

    Common.prototype.type = function (_) {
        if (!arguments.length) return this._type;
        this._type = _;
        return this;
    };

    Common.prototype.getC3Series = function() {
        return this._columns.filter(function (d, i) { return i > 0;});
    };

    Common.prototype.getC3Rows = function () {
        var retVal = [this._columns.filter(function (item, idx) { return idx > 0; })].concat(this._data.map(function (row) {
            return row.filter(function (cell, idx) {
                return idx > 0;
            })
        }));
        return retVal;
    };

    Common.prototype.getC3Categories = function () {
        var retVal = this._data.map(function (row, idx) { return row[0]; });
        return retVal;
    };

    Common.prototype.getC3Column = function (colNum) {
        var retVal = [this._columns[colNum]].concat(this._data.map(function (row, idx) { return row[colNum]; }));
        return retVal;
    };

    Common.prototype.getC3Columns = function (total) {
        if (!this._data.length) {
            return [];
        }
        total = total || this._columns.length;
        var retVal = [];
        for (var i = 1; i < total; ++i) {
            retVal.push(this.getC3Column(i));
        }
        return retVal;
    };

    Common.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        element.style("overflow", "hidden");

        this._config.size = {
            width: this.width(),
            height: this.height()
        };
        this._config.data.type = this._type;
        if (this._type !== "gauge") {
            this._config.legend = {
                position: this.legendPosition()
            };
        }
        this._config.bindto = element.append("div").datum(null);
        this.c3Chart = c3.generate(this._config);
    };

    Common.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);

        if (this.showLegend()) {
            this.c3Chart.legend.show();
        } else {
            this.c3Chart.legend.hide();
        }

        this.c3Chart.resize({
            width: this.width(),
            height: this.height()
        });

        this.c3Chart.load(this.getChartOptions());

        element.selectAll(".c3 .c3-legend-item text").style({ 
            "fill": this.legendFontColor(), 
            "font-size": this.legendFontSize()+"px", 
            "font-family": this.legendFontFamily,
            "font-weight": this.legendFontBold ? "bold" : "normal",
            "font-style": this.legendFontItalic ? "italic" : "normal"
        });
    };
    
    Common.prototype.getChartOptions = function() {
        return {};
    }

    return Common;
}));
