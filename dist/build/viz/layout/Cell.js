(function(e,t){typeof define=="function"&&define.amd?define(["./Surface","../chart/Pie","../c3/Column","../c3/Line","css!./Cell"],t):e.layout_Cell=t(e.layout_Surface,e.chart_Pie,e.c3_Column,e.c3_Line)})(this,function(e,t,n,r){function i(){e.call(this),this._class="layout_Cell"}return i.prototype=Object.create(e.prototype),i.prototype.publish("gridRow",0,"number","Grid Row Position"),i.prototype.publish("gridCol",0,"number","Grid Column Position"),i.prototype.publish("gridRowSpan",1,"number","Grid Row Span"),i.prototype.publish("gridColSpan",1,"number","Grid Column Span"),i.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments),n.classed("layout_Surface",!0)},i});