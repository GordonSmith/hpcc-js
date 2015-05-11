"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "./CommonND"], factory);
    } else {
        root.google_Line = factory(root.d3, root.google_CommonND);
    }
}(this, function (d3, CommonND) {

    function Line() {
        CommonND.call(this);

        this._chartType = "LineChart";
    };
    Line.prototype = Object.create(CommonND.prototype);
    Line.prototype._class += " google_Line";

    /**
     * Publish Params Common To Other Libraries
     */
    Line.prototype.publish("lineWidth", 2, "number", "Line Width",null,{tags:['Basic']});
    Line.prototype.publish("lineDashStyle", [], "array", "Line Dash Style",null,{tags:['Advanced']});//TODO: Needs example in description

    Line.prototype.publish("axisFontSize", null, "number", "Vertical axis text style (Font Size)",null,{tags:['Basic']});
    Line.prototype.publish("axisFontFamily", null, "string", "Vertical axis text style (Font Name)",null,{tags:['Basic']});
    
    Line.prototype.publish("xAxisFontColor", null, "html-color", "Horizontal axis text style (Color)",null,{tags:['Basic']});
    Line.prototype.publish("yAxisFontColor", null, "html-color", "Vertical axis text style (Color)",null,{tags:['Basic']});
    
    Line.prototype.publish("xAxisBaselineColor", "#000000", "html-color", "Specifies the color of the baseline for the horizontal axis",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisBaselineColor", "#000000", "html-color", "Specifies the color of the baseline for the vertical axis",null,{tags:['Intermediate']});
    
    Line.prototype.publish("xAxisTitle", "", "string", "Specifies a title for the horizontal axis",null,{tags:['Basic']});
    Line.prototype.publish("yAxisTitle", "", "string", "Specifies a title for the vertical axis",null,{tags:['Basic']});

    Line.prototype.publish("xAxisTitleFontColor", null, "html-color", "Horizontal axis title text style (Color)",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisTitleFontColor", null, "html-color", "Vertical axis title text style (Color)",null,{tags:['Intermediate']});

    Line.prototype.publish("xAxisTitleFontSize", null, "number", "Horizontal axis titletext style (Font Size)",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisTitleFontSize", null, "number", "Vertical axis titletext style (Font Size)",null,{tags:['Intermediate']});

    Line.prototype.publish("xAxisTitleFontFamily", null, "string", "Horizontal axis title text style (Font Name)",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisTitleFontFamily", null, "string", "Vertical axis title text style (Font Name)",null,{tags:['Intermediate']});
    
    Line.prototype.publish("xAxisLabelRotation", 0, "number", "The angle of the horizontal axis text",null,{tags:['Intermediate']}); // NEED TO ADD TO OTHER CHARTS and get inside c3 and amcharts?
    
    /**
     * Publish Params Unique To This Widget
     */   
    Line.prototype.publish("orientation", "horizontal", "set", "Line Dash Style", ["horizontal","vertical"],{tags:['Advanced']});
    Line.prototype.publish("smoothLines", false, "boolean", "Causes chart data lines to draw smoothly",null,{tags:['Basic']});
    
    Line.prototype.publish("pointSize", [], "array", "Diameter of displayed points in pixels",null,{tags:['Private']});
    Line.prototype.publish("pointShape", [], "array", "The shape of individual data elements",null,{tags:['Advanced']}); //TODO: Needs example in description
    
    Line.prototype.publish("xAxisBaseline", null, "number", "The baseline for the horizontal axis",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisBaseline", null, "number", "The baseline for the horizontal axis",null,{tags:['Intermediate']});

    Line.prototype.publish("xAxisInversed", false, "boolean", "The direction in which the values along the horizontal axis grow.",null,{tags:['Advanced']});
    Line.prototype.publish("yAxisInversed", false, "boolean", "The direction in which the values along the vertical axis grow.",null,{tags:['Advanced']});
    
    Line.prototype.publish("xAxisFormat", "", "string", "A format string for numeric axis labels", ["","decimal","scientific","currency","percent","short","long"],{tags:['Intermediate']});
    Line.prototype.publish("yAxisFormat", "", "string", "A format string for numeric axis labels", ["","decimal","scientific","currency","percent","short","long"],{tags:['Intermediate']});
    
    Line.prototype.publish("xAxisGridlinesCount", 5, "number", "The number of horizontal gridlines between two regular gridlines",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisGridlinesCount", 5, "number", "The number of vertical gridlines between two regular gridlines",null,{tags:['Intermediate']});
    
    Line.prototype.publish("xAxisGridlinesColor", "#CCC", "html-color", "The color of the horizontal gridlines inside the chart area",null,{tags:['Basic']});
    Line.prototype.publish("yAxisGridlinesColor", "#CCC", "html-color", "The color of the vertical gridlines inside the chart area",null,{tags:['Basic']});
    
    Line.prototype.publish("xAxisMinorGridlinesCount", 0, "number", "The number of horizontal minor gridlines between two regular gridlines",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisMinorGridlinesCount", 0, "number", "The number of vertical minor gridlines between two regular gridlines",null,{tags:['Intermediate']});
    
    Line.prototype.publish("xAxisMinorGridlinesColor", "#FFFFFF", "html-color", "The color of the horizontal minor gridlines inside the chart area",null,{tags:['Intermediate']});
    Line.prototype.publish("yAxisMinorGridlinesColor", "#FFFFFF", "html-color", "The color of the vertical minor gridlines inside the chart area",null,{tags:['Intermediate']});
    
    Line.prototype.publish("xAxisLogScale", false, "boolean", "Makes horizontal axis a log scale",null,{tags:['Advanced']});
    Line.prototype.publish("yAxisLogScale", false, "boolean", "Makes vertical axis a log scale",null,{tags:['Advanced']});
    
    Line.prototype.publish("xAxisTextPosition", "out", "set", "Position of the horizontal axis text, relative to the chart area", ["out","in","none"],{tags:['Advanced']});
    Line.prototype.publish("yAxisTextPosition", "out", "set", "Position of the vertical axis text, relative to the chart area", ["out","in","none"],{tags:['Advanced']});
    
    Line.prototype.publish("xAxisTicks", [], "array", "Replaces the automatically generated X-axis ticks with the specified array",null,{tags:['Private']});
    Line.prototype.publish("yAxisTicks", [], "array", "Replaces the automatically generated Y-axis ticks with the specified array",null,{tags:['Private']});

    Line.prototype.publish("xAxisMaxValue", null, "number", "Moves the max value of the horizontal axis to the specified value",null,{tags:['Advanced']});
    Line.prototype.publish("yAxisMaxValue", null, "number", "Moves the max value of the vertical axis to the specified value",null,{tags:['Advanced']});
    
    Line.prototype.publish("xAxisMinValue", null, "number", "Moves the min value of the horizontal axis to the specified value",null,{tags:['Advanced']});
    Line.prototype.publish("yAxisMinValue", null, "number", "Moves the min value of the vertical axis to the specified value",null,{tags:['Advanced']});
    
    Line.prototype.publish("xAxisViewWindowMode", "pretty", "set", "Specifies how to scale the horizontal axis to render the values within the chart area", ["pretty","maximized","explicit"],{tags:['Advanced']});
    Line.prototype.publish("yAxisViewWindowMode", "pretty", "set", "Specifies how to scale the vertical axis to render the values within the chart area", ["pretty","maximized","explicit"],{tags:['Advanced']});
    
    Line.prototype.publish("xAxisViewWindowMax", null, "number", "The maximum horizontal data value to render",null,{tags:['Advanced']});
    Line.prototype.publish("yAxisViewWindowMax", null, "number", "The maximum vertical data value to render",null,{tags:['Advanced']});
    
    Line.prototype.publish("xAxisViewWindowMin", null, "number", "The minimum horizontal data value to render",null,{tags:['Advanced']});
    Line.prototype.publish("yAxisViewWindowMin", null, "number", "The minimum vertical data value to render",null,{tags:['Advanced']});

    Line.prototype.publish("xAxisMaxTextLines", null, "number", "Maximum number of lines allowed for the text labels",null,{tags:['Advanced']});
    Line.prototype.publish("xAxisMaxAlternation", 2, "number", "Maximum number of levels of horizontal axis text",null,{tags:['Advanced']});
    Line.prototype.publish("xAxisMinTextSpacing", null, "number", "Minimum horizontal spacing, in pixels, allowed between two adjacent text labels",null,{tags:['Advanced']});
    
    Line.prototype.getChartOptions = function () {
        var retVal = CommonND.prototype.getChartOptions.apply(this, arguments);

        retVal.lineWidth = this.lineWidth();
        retVal.lineDashStyle = this.lineDashStyle();
        retVal.orientation = this.orientation();
        retVal.pointShape = this.pointShape();
        retVal.pointSize = this.pointSize();
        
        retVal.hAxis = {};
        retVal.vAxis = {};
        
        // hAxis
        retVal.hAxis.baseline = this.xAxisBaseline();
        retVal.hAxis.baselineColor = this.xAxisBaselineColor();
        retVal.hAxis.direction = this.xAxisInversed() ? -1 : 1;
        retVal.hAxis.gridlines = {
            count: this.xAxisGridlinesCount(),
            color: this.xAxisGridlinesColor()
        }
        retVal.hAxis.minorGridlines = {
            count: this.xAxisMinorGridlinesCount(),
            color: this.xAxisMinorGridlinesColor()
        }        
        retVal.hAxis.logScale = this.xAxisLogScale();
        retVal.hAxis.textPosition = this.xAxisTextPosition();
        retVal.hAxis.title = this.xAxisTitle();
        retVal.hAxis.minValue = this.xAxisMinValue();
        retVal.hAxis.maxValue = this.xAxisMaxValue();
        
        //retVal.hAxis.allowContainerBoundaryTextCutoff = this.xAxisAllowContainerBoundaryTextCutoff();
        retVal.hAxis.slantedText = this.xAxisLabelRotation() !== 0;
        retVal.hAxis.slantedTextAngle = this.xAxisLabelRotation();
        retVal.hAxis.maxAlternation = this.xAxisMaxAlternation();
        retVal.hAxis.maxTextLines = this.xAxisMaxTextLines();
        retVal.hAxis.minTextSpacing = this.xAxisMinTextSpacing();
        
        retVal.hAxis.format = this.xAxisFormat();
        retVal.hAxis.textStyle = {
            color: this.xAxisFontColor() ? this.xAxisFontColor() : this.fontColor(),
            fontName: this.axisFontFamily() ? this.axisFontFamily() : this.fontFamily(),
            fontSize: this.axisFontSize() ? this.axisFontSize() : this.fontSize()
        }
        if (this.xAxisTicks().length > 0) {
            retVal.hAxis.ticks = this.xAxisTicks();
        }
        retVal.hAxis.titleTextStyle = {
            color: this.xAxisTitleFontColor() ? this.xAxisTitleFontColor() : this.fontColor(),
            fontName: this.xAxisTitleFontFamily() ? this.xAxisTitleFontFamily() : this.fontFamily(),
            fontSize: this.xAxisTitleFontSize() ? this.xAxisTitleFontSize() : this.fontSize()
        }
        retVal.hAxis.viewWindowMode = this.xAxisViewWindowMode();
        retVal.hAxis.viewWindow = {
            min: this.xAxisViewWindowMin(),
            max: this.xAxisViewWindowMax()
        }
        
        // vAxis
        retVal.vAxis.baseline = this.yAxisBaseline();
        retVal.vAxis.baselineColor = this.yAxisBaselineColor();
        retVal.vAxis.direction = this.yAxisInversed() ? -1 : 1;
        retVal.vAxis.gridlines = {
            count: this.yAxisGridlinesCount(),
            color: this.yAxisGridlinesColor()
        }
        retVal.vAxis.minorGridlines = {
            count: this.yAxisMinorGridlinesCount(),
            color: this.yAxisMinorGridlinesColor()
        }        
        retVal.vAxis.logScale = this.yAxisLogScale();
        retVal.vAxis.textPosition = this.yAxisTextPosition();
        retVal.vAxis.title = this.yAxisTitle();
        retVal.vAxis.minValue = this.yAxisMinValue();
        retVal.vAxis.maxValue = this.yAxisMaxValue();
        
        retVal.vAxis.format = this.yAxisFormat();
        retVal.vAxis.textStyle = {
            color: this.yAxisFontColor(),
            fontName: this.axisFontFamily() ? this.axisFontFamily() : this.fontFamily(),
            fontSize: this.axisFontSize() ? this.axisFontSize() : this.fontSize()
        }
        if (this.yAxisTicks().length > 0) {
            retVal.vAxis.ticks = this.yAxisTicks();
        }
        retVal.vAxis.titleTextStyle = {
            color: this.yAxisTitleFontColor() ? this.yAxisTitleFontColor() : this.fontColor(),
            fontName: this.yAxisTitleFontFamily() ? this.yAxisTitleFontFamily() : this.fontFamily(),
            fontSize: this.yAxisTitleFontSize() ? this.yAxisTitleFontSize() : this.fontSize()
        }
        retVal.vAxis.viewWindowMode = this.yAxisViewWindowMode();
        retVal.vAxis.viewWindow = {
            min: this.yAxisViewWindowMin(),
            max: this.yAxisViewWindowMax()
        }        
        
        this.lineDashStyle().forEach(function(d,i) {
            if (typeof(retVal.series[i])==="undefined") {
               retVal.series[i] = {}; 
            }
            retVal.series[i].lineDashStyle = d;
        });
        
        this.pointShape().forEach(function(d,i) {
            if (typeof(retVal.series[i])==="undefined") {
               retVal.series[i] = {}; 
            }
            retVal.series[i].pointShape = d;
        });     
        
        this.pointSize().forEach(function(d,i) {
            if (typeof(retVal.series[i])==="undefined") {
               retVal.series[i] = {}; 
            }
            retVal.series[i].pointSize = d;
        });

        if (this.smoothLines()) {
            retVal.curveType = "function";
        }

        return retVal;
    };

    Line.prototype.enter = function (domNode, element) {
        CommonND.prototype.enter.apply(this, arguments);
    };

    Line.prototype.update = function (domNode, element) {
        CommonND.prototype.update.apply(this, arguments);
    };

    return Line;
}));
