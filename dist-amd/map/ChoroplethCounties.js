!function(t,o){"function"==typeof define&&define.amd?define(["d3","topojson","./Choropleth","require"],o):t.map_ChoroplethCounties=o(t.d3,t.topojson,t.map_Choropleth,t.require)}(this,function(t,o,e,i){function n(){e.call(this),this.projection("albersUsaPr")}var a=null,r=null,s=null,l=t.format("05d");return n.prototype=Object.create(e.prototype),n.prototype.constructor=n,n.prototype._class+=" map_ChoroplethCounties",n.prototype.publish("onClickFormatFIPS",!1,"boolean","format FIPS code as a String on Click"),n.prototype.layerEnter=function(o,i,n){e.prototype.layerEnter.apply(this,arguments),this._choroTopology=a.topology,this._choroTopologyObjects=a.topology.objects.counties,this._selection.widgetElement(this._choroplethData),this.choroPaths=t.select(null);var r=this;this.tooltipHTML(function(t){return r.tooltipFormat({label:a.countyNames[+t[0]],value:r._dataMap[t[0]]?r._dataMap[t[0]][1]:"N/A"})})},n.prototype.layerUpdate=function(t){function o(t){return i.onClickFormatFIPS()?i._dataMap[t[0]].map(function(t,o){return i.onClickFormatFIPS()&&0===o?l(t):t}):i._dataMap[t[0]]}e.prototype.layerUpdate.apply(this,arguments),this.choroPaths=this._choroplethData.selectAll(".data").data(this.visible()?this.data():[],function(t){return t[0]});var i=this;this.choroPaths.enter().append("path").attr("class","data").call(this._selection.enter.bind(this._selection)).on("click",function(t){i._dataMap[t[0]]&&i.click(i.rowToObj(o(t)),"weight",i._selection.selected(this))}).on("dblclick",function(t){i._dataMap[t[0]]&&i.dblclick(i.rowToObj(o(t)),"weight",i._selection.selected(this))}).on("mouseout.tooltip",this.tooltip.hide).on("mousemove.tooltip",this.tooltip.show),this.choroPaths.attr("d",function(o){var e=t._d3GeoPath(s[+o[0]]);return e||console.log("Unknown US County:  "+o[0]),e}).style("fill",function(t){var o=i._palette(t[1],i._dataMinWeight,i._dataMaxWeight);return o}),this.choroPaths.exit().remove()},n.prototype.layerPreRender=function(){return this._topoJsonPromise||(this._topoJsonPromise=new Promise(function(t,e){a&&t(),i(["json!src/map/TopoJSON/us-counties.json"],function(e){a=e,r=o.feature(a.topology,a.topology.objects.counties).features,s={};for(var i in r)r[i].id&&(s[r[i].id]=r[i]);t()})})),this._topoJsonPromise},n});