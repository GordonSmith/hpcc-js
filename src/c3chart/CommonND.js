"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./Common", "../api/INDChart"], factory);
    } else {
        root.c3chart_CommonND = factory(root.c3chart_Common, root.api_INDChart);
    }
}(this, function (Common, INDChart) {
    function CommonND(target) {
        Common.call(this);
        INDChart.call(this);

        var context = this;
        this._config.color = {
            pattern: this._palette.colors()
        };

        this._config.data.onclick = function (d, element) {
            context.click(context.rowToObj(context._data[d.index]), d.id);
        };
        this._config.data.color = function (color, d) {
            return context._palette(d.id ? d.id : d);
        };
        this._prevColumns = [];
    };
    CommonND.prototype = Object.create(Common.prototype);
    CommonND.prototype._class += " c3chart_CommonND";
    CommonND.prototype.implements(INDChart.prototype);

    /**
     * Publish Params Common To Other Libraries
     */
    CommonND.prototype.publish("paletteID", "default", "set", "Palette ID", CommonND.prototype._palette.switch());
    
    CommonND.prototype.publish("axisLineWidth", 1, "number", "Axis Line Width",null,{tags:['Intermediate','TODO2']});
    
    CommonND.prototype.publish("xAxisBaselineColor", "#000", "html-color", "X Axis Baseline Color",null,{tags:['Basic','TODO2']});
    CommonND.prototype.publish("yAxisBaselineColor", "#000", "html-color", "Y Axis Baseline Color",null,{tags:['Basic','TODO2']});

    CommonND.prototype.publish("xAxisFontColor", "#000", "html-color", "Font Color",null,{tags:['Basic','TODO2']});
    CommonND.prototype.publish("yAxisFontColor", "#000", "html-color", "Font Color",null,{tags:['Basic','TODO2']});

    CommonND.prototype.publish("axisFontSize", 10, "number", "Font Size",null,{tags:['Basic','TODO2']});
    CommonND.prototype.publish("axisFontFamily", "sans-serif", "string", "Font Name",null,{tags:['Basic','TODO2']});

    CommonND.prototype.publish("xAxisLabelRotation", 0, "number", "Font Size",null,{tags:['Intermediate','TODO2']});

    CommonND.prototype.publish("yAxisTitle", "Axis title", "string", "Y-Axis Title",null,{tags:['Intermediate','TODO2']});
    CommonND.prototype.publish("xAxisTitle", "Axis title", "string", "X-Axis Title",null,{tags:['Intermediate','TODO2']});

    /**
     * NOT ENABLED YET
     * CommonND.prototype.publish("xAxisTitleFontColor", null, "html-color", "Horizontal axis title text style (Color)",null,{tags:['Advanced']});
     * CommonND.prototype.publish("xAxisTitleFontFamily", null, "string", "Horizontal axis title text style (Font Name)",null,{tags:['Advanced']});
     * CommonND.prototype.publish("xAxisTitleFontSize", null, "number", "Horizontal axis titletext style (Font Size)",null,{tags:['Advanced']});
    
     * CommonND.prototype.publish("yAxisTitleFontColor", null, "html-color", "Vertical axis title text style (Color)",null,{tags:['Advanced']});
     * CommonND.prototype.publish("yAxisTitleFontFamily", null, "string", "Vertical axis title text style (Font Name)",null,{tags:['Advanced']});
     * CommonND.prototype.publish("yAxisTitleFontSize", null, "number", "Vertical axis titletext style (Font Size)",null,{tags:['Advanced']});
    */
   
    /**
     * Publish Params Unique To This Library
     */
    CommonND.prototype.publish("xAxisType", "category", "set", "X-Axis Type", ["category", "timeseries", "indexed"],{tags:['Intermediate','TODO2']});
    CommonND.prototype.publish("subchart", false, "boolean", "Show SubChart",null,{tags:['Private','TODO2']});
  
    CommonND.prototype.publish("showXGrid", false, "boolean", "Show X Grid",null,{tags:['Intermediate','TODO2']});
    CommonND.prototype.publish("showYGrid", false, "boolean", "Show Y Grid",null,{tags:['Intermediate','TODO2']});

    CommonND.prototype.getDiffC3Columns = function () {
        return this._prevColumns.filter(function (i) { return this._columns.indexOf(i) < 0; }, this);
    };

    CommonND.prototype.render = function () {
        var retVal = Common.prototype.render.apply(this, arguments);
        this._prevColumns = this._columns;
        return retVal;
    };

    CommonND.prototype.enter = function (domNode, element) {
        if (this.subchart()) {
            this._config.subchart = {
                show: true, size: {
                    height: 20
                }
            };
        }

        this._config.axis.x = {
            type: this.xAxisType(),
            tick: {
                rotate: this.xAxisLabelRotation(), 
                multiline: false 
            },
            label:{ 
                text: this.xAxisTitle(),
                position: 'outer-center'
            }
        };
        this._config.axis.y = {
            label:{ 
                text: this.yAxisTitle(),
                position: 'outer-center'
            }
        }
        this._config.grid = {
            x: {
                show: this.showXGrid(),
            },
            y: {
                show: this.showYGrid(),
            }
        }

        switch (this.xAxisType()) {
        case "category":
            this._config.axis.tick = {
                centered: true,
                multiline: false
            }
            break;
        case "timeseries":
            this._config.data.x = this._columns[0];
            this._config.axis.tick = {
                format: '%d %b %Y'
            }
            break;
        }

        Common.prototype.enter.apply(this, arguments);
    };

    CommonND.prototype.update = function (domNode, element) {
        Common.prototype.update.apply(this, arguments);
        
        this._palette = this._palette.switch(this.paletteID());
        element.selectAll(".c3 svg").style({ "font-size": this.axisFontSize()+"px" });
        element.selectAll(".c3 svg text").style({ "font-family": this.axisFontFamily() });

        element.selectAll(".c3 .c3-axis.c3-axis-x text").style({ "fill": this.xAxisFontColor() });
        element.selectAll(".c3 .c3-axis.c3-axis-y text").style({ "fill": this.yAxisFontColor() });

        element.selectAll(".c3 .c3-axis path").style({ "stroke-width": this.axisLineWidth()+"px" });
        element.selectAll(".c3 .c3-axis-x path, .c3 .c3-axis-x line").style({ "stroke": this.xAxisBaselineColor() });
        element.selectAll(".c3 .c3-axis-y path, .c3 .c3-axis-y line").style({ "stroke": this.yAxisBaselineColor() });

        element.selectAll(".c3-axis-x-label").style({ // NOT FINISHED -> might need to add "text" selector
            //"font-family": this.xAxisTitleFontFamily(),
            //"font-weight": '',
            //"font-size": this.xAxisTitleFontSize(),
            //"color": this.xAxisTitleFontColor()
        });
        element.selectAll(".c3-axis-y-label").style({ // NOT FINISHED -> might need to add "text" selector
            //"font-family": this.yAxisTitleFontFamily(),
            //"font-weight": '',
            //"font-size": this.yAxisTitleFontSize(),
            //"color": this.yAxisTitleFontColor()
        });
    };

    CommonND.prototype.getChartOptions = function() {
        var chartOptions = Common.prototype.getChartOptions.apply(this, arguments);

        switch (this.xAxisType()) {
            case "category":
                chartOptions.categories = this.getC3Categories();
                chartOptions.columns = this.getC3Columns();
                chartOptions.unload = this.getDiffC3Columns()
                break;
            case "indexed":
            case "timeseries":
                chartOptions.columns = this.getC3Columns();
                chartOptions.unload =  this.getDiffC3Columns();
                break;
        }

        return chartOptions;
    }

    return CommonND;
}));
