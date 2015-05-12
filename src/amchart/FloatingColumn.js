"use strict";
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "./CommonSerial", "amcharts.serial", "../api/INDChart"], factory);
    } else {
        root.amchart_FloatingColumn = factory(root.d3, root.amchart_CommonSerial, root.amcharts, root.api_INDChart);
    }
}(this, function(d3, CommonSerial, AmCharts, INDChart) {
    function FloatingColumn() {
        CommonSerial.call(this);
        this._class = "amchart_FloatingColumn";
        this._tag = "div";
        
        this._gType = "column";
        
        this._openField = [];
        this._closeField = [];
        this._valueField = [];
    };
    FloatingColumn.prototype = Object.create(CommonSerial.prototype);
    FloatingColumn.prototype.implements(INDChart.prototype);

    /**
     * Publish Params Common To Other Libraries
     */
    FloatingColumn.prototype.publish("paletteID", "Dark2", "set", "Palette ID", FloatingColumn.prototype._palette.switch());
    FloatingColumn.prototype.publish("isStacked", true, "boolean", "Stacked",null,{tags:['Basic','TODO2']});
    
    /**
     * Publish Params Unique To This Widget
     */   
    FloatingColumn.prototype.publish("paletteGrouping", "By Column", "set", "Palette Grouping",["By Category","By Column"],{tags:['Intermediate','TODO2']});

    FloatingColumn.prototype.publish("cylinderBars", false, "boolean", "Cylinder Bars",null,{tags:['Basic','TODO2']});
    FloatingColumn.prototype.publish("circleRadius", 1, "number", "Circle Radius",null,{tags:['Basic','TODO2']});
    
    FloatingColumn.prototype.publish("columnWidth", 0.62, "number", "Bar Width",null,{tags:['Basic','TODO2']});
    
    FloatingColumn.prototype.publish("Depth3D", 0, "number", "3D Depth (px)",null,{tags:['Basic','TODO2']});
    FloatingColumn.prototype.publish("Angle3D", 45, "number", "3D Angle (Deg)",null,{tags:['Basic','TODO2']});
    
    FloatingColumn.prototype.publish("stackType", "regular", "set", "Stack Type",["none","regular","100%"],{tags:['Basic','TODO2']});
    FloatingColumn.prototype.publish("tooltipText","[[category]]([[title]]): [[value]]", "string", "Tooltip Text",null,{tags:['Intermediate','TODO2']});
    
    FloatingColumn.prototype.testData = function() {
        this.columns(["Subject", "open", "close"]);
        this.data([
            ["Geography", 15, 35],
            ["English", 25, 45],
            ["Math", 10, 35],
            ["Science", 45, 60]
        ]);
        return this;
    };
    
    FloatingColumn.prototype.columns = function(colArr) {
        if (!arguments.length) return this._columns;
        //var retVal = CommonSerial.prototype.columns.apply(this, arguments);
        var context = this;
        this._categoryField = colArr[0];
        this._openField = [];
        this._closeField = [];
        colArr.slice(1,colArr.length).forEach(function(col,colIdx){
            if(colIdx%2){
                context._closeField.push(col);
                context._valueField.push(col);
            } else {
                context._openField.push(col);
            }
        });
        this._columns = colArr;
    };
    
    FloatingColumn.prototype.enter = function(domNode, element) {
        CommonSerial.prototype.enter.apply(this, arguments);
    };
    
    FloatingColumn.prototype.updateChartOptions = function() {
        CommonSerial.prototype.updateChartOptions.apply(this, arguments);
        
        this._chart.depth3D = this.Depth3D();
        this._chart.angle = this.Angle3D();
        this._chart.categoryAxis.startOnAxis = false; //override due to render issue
        
        this.buildGraphs(this._gType);
    }

    FloatingColumn.prototype.buildGraphs = function(gType) {
        var context = this;
        if (typeof(this._chart.graphs) === 'undefined') { this._chart.graphs = []; }
        var currentGraphCount = this._chart.graphs.length; 
        var buildGraphCount = Math.max(currentGraphCount, this._openField.length);
        
        for(var i = 0; i < buildGraphCount; i++) {
            if ((typeof(this._openField) !== 'undefined' && typeof(this._openField[i]) !== 'undefined')) { //mark
                var gRetVal = CommonSerial.prototype.buildGraphObj.call(this,gType,i);
                var gObj = buildGraphObj(gRetVal);
                
                if (typeof(this._chart.graphs[i]) !== 'undefined') {
                    for (var key in gObj) { this._chart.graphs[i][key] = gObj[key]; }
                } else {
                    this._chart.addGraph(gObj);
                }
            } else {
                this._chart.removeGraph(this._chart.graphs[i]);
            }
        }

        function buildGraphObj(gObj) {
            if (context.columnWidth()) {
                gObj.columnWidth = context.columnWidth();
            }

            if (context.cylinderBars()) {
                 gObj.topRadius = context.circleRadius();
            } else {
                 gObj.topRadius = undefined;
            }

            return gObj;
        }
    }
    
    FloatingColumn.prototype.update = function(domNode, element) {
        CommonSerial.prototype.update.apply(this, arguments);
        this.updateChartOptions();
        
        this._chart.validateNow();
        this._chart.validateData();
    };
    
    return FloatingColumn;
}));