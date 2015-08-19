(function(e,t){typeof define=="function"&&define.amd?define(["d3","../common/HTMLWidget","goog!visualization,1,packages:[treemap]"],t):e.TreeMap=t(e.d3,e.common_HTMLWidget)})(this,function(e,t){function n(){t.call(this),this._chartType="TreeMapChart",this._data_google=[],this._tag="div",this.columns([]),this.data([])}return n.prototype=Object.create(t.prototype),n.prototype._class+=" google_TreeMap",n.prototype.publish("headerColor",null,"html-color","The color of the header section for each node. Specify an HTML color value.",null,{tags:["Basic"]}),n.prototype.publish("headerHeight",0,"number","The height of the header section for each node, in pixels (can be zero).",null,{tags:["Basic"]}),n.prototype.publish("headerHighlightColor",null,"html-color","The background color for the main area of the chart. Can be either a simple HTML color string, for example: 'red' or '#00cc00', or an object with the following properties.",null,{tags:["Basic"]}),n.prototype.publish("hintOpacity",0,"number","When maxPostDepth is greater than 1, causing nodes below the current depth to be shown, hintOpacity specifies how transparent it should be. It should be between 0 and 1; the higher the value, the fainter the node.",null,{tags:["Intermediate"]}),n.prototype.publish("maxColor",null,"html-color","The color for a rectangle with a column 3 value of maxColorValue. Specify an HTML color value.",null,{tags:["Basic"]}),n.prototype.publish("maxDepth",1,"number","The maximum number of node levels to show in the current view. Levels will be flattened into the current plane. If your tree has more levels than this, you will have to go up or down to see them. You can additionally see maxPostDepth levels below this as shaded rectangles within these nodes.",null,{tags:["Intermediate"]}),n.prototype.publish("maxHighlightColor",null,"html-color","The highlight color to use for the node with the largest value in column 3. Specify an HTML color value or null; If null, this value will be the value of maxColor lightened by 35%",null,{tags:["Basic"]}),n.prototype.publish("maxPostDepth",0,"number","How many levels of nodes beyond maxDepth to show in 'hinted' fashion. Hinted nodes are shown as shaded rectangles within a node that is within the maxDepth limit.",null,{tags:["Advanced"]}),n.prototype.publish("maxColorValue",null,"number","The maximum value allowed in column 3. All values greater than this will be trimmed to this value. If set to null, it will be set to the max value in the column.",null,{tags:["Intermediate"]}),n.prototype.publish("midColor",null,"html-color","The color for a rectangle with a column 3 value midway between maxColorValue and minColorValue. Specify an HTML color value.",null,{tags:["Basic"]}),n.prototype.publish("midHighlightColor",null,"html-color","The highlight color to use for the node with a column 3 value near the median of minColorValue and maxColorValue. Specify an HTML color value or null; if null, this value will be the value of midColor lightened by 35%.",null,{tags:["Basic"]}),n.prototype.publish("minColor",null,"html-color","The color for a rectangle with the column 3 value of minColorValue. Specify an HTML color value.",null,{tags:["Basic"]}),n.prototype.publish("minHighlightColor",null,"html-color","The highlight color to use for the node with a column 3 value nearest to minColorValue. Specify an HTML color value or null; if null, this value will be the value of minColor lightened by 35%",null,{tags:["Basic"]}),n.prototype.publish("minColorValue",null,"number","The minimum value allowed in column 3. All values less than this will be trimmed to this value. If set to null, it will be calculated as the minimum value in the column.",{tags:["Basic"]}),n.prototype.publish("noColor",null,"html-color","The color to use for a rectangle when a node has no value for column 3, and that node is a leaf (or contains only leaves). Specify an HTML color value.",{tags:["Basic"]}),n.prototype.publish("noHighlightColor",null,"html-color","The color to use for a rectangle of 'no' color when highlighted. Specify an HTML color value or null; if null, this will be the value of noColor lightened by 35%.",null,{tags:["Basic"]}),n.prototype.publish("showScale",!0,"boolean","Whether or not to show a color gradient scale from minColor to maxColor along the top of the chart. Specify true to show the scale.",null,{tags:["Intermediate"]}),n.prototype.publish("showTooltips",!0,"boolean","Whether or not to show tooltips.",null,{tags:["Basic"]}),n.prototype.publish("useWeightedAverageForAggregation",!0,"boolean","Whether to use weighted averages for aggregation.",null,{tags:["Basic"]}),n.prototype.getChartOptions=function(){var e=[];e.headerColor=this.headerColor(),e.headerHeight=this.headerHeight(),e.headerHighlightColor=this.headerHighlightColor(),e.hintOpacity=this.hintOpacity(),e.maxColor=this.maxColor(),e.maxDepth=this.maxDepth(),e.maxHighlightColor=this.maxHighlightColor(),e.maxPostDepth=this.maxPostDepth(),e.maxColorValue=this.maxColorValue(),e.midColor=this.midColor(),e.midHighlightColor=this.midHighlightColor(),e.minColor=this.minColor(),e.minHighlightColor=this.minHighlightColor(),e.minColorValue=this.minColorValue(),e.noColor=this.noColor(),e.noHighlightColor=this.noHighlightColor(),e.showScale=this.showScale(),e.showTooltips=this.showTooltips(),e.useWeightedAverageForAggregation=this.useWeightedAverageForAggregation(),e.width=this.width(),e.height=this.height();var t=this;return e.generateTooltip=function(e,r,i){return n.prototype.defaultlTooltip.apply(t,arguments)},e},n.prototype.enter=function(e,n){t.prototype.enter.apply(this,arguments),n.style("overflow","hidden"),this.treemapChart=new google.visualization.TreeMap(n.node())},n.prototype.update=function(e,n){t.prototype.update.apply(this,arguments),this.treemapChart.draw(this._data_google,this.getChartOptions())},n.prototype.data=function(e){var n=t.prototype.data.apply(this,arguments);if(arguments.length){var r=this._columns.concat(this._data);this._data_google=new google.visualization.arrayToDataTable(r)}return n},n.prototype.testData=function(){return this.columns([["Location","Parent","Market trade volume (size)","Market increase/decrease (color)"]]),this.data([["Global",null,0,0],["America","Global",0,0],["Europe","Global",0,0],["Asia","Global",0,0],["Australia","Global",0,0],["Africa","Global",0,0],["Brazil","America",11,10],["USA","America",52,31],["Mexico","America",24,12],["Canada","America",16,-23],["France","Europe",42,-11],["Germany","Europe",31,-2],["Sweden","Europe",22,-13],["Italy","Europe",17,4],["UK","Europe",21,-5],["China","Asia",36,4],["Japan","Asia",20,-12],["India","Asia",40,63],["Laos","Asia",4,34],["Mongolia","Asia",1,-5],["Israel","Asia",12,24],["Iran","Asia",18,13],["Pakistan","Asia",11,-52],["Egypt","Africa",21,0],["S. Africa","Africa",30,43],["Sudan","Africa",12,2],["Congo","Africa",10,12],["Zaire","Africa",8,10]]),this},n.prototype.defaultlTooltip=function(e,t,n){var r=this._data_google;return'<div style="background:#ddd; padding:10px; border-style:solid" >Label: '+r.getValue(e,0)+"<br>"+"Parent: "+r.getValue(e,1)+"<br>"+"Column 3 Label: "+r.getColumnLabel(2)+", Value: "+r.getValue(e,2)+"<br>"+"Column 4 Label: "+r.getColumnLabel(3)+", Value: "+r.getValue(e,3)+"<br>"+"Datatable row #: "+e+"<br>"+r.getColumnLabel(2)+" (total value of this cell and its children): "+t+"<br>"+r.getColumnLabel(3)+": "+n+" </div>"},n});