!function(t,o){"function"==typeof define&&define.amd?define(["d3","topojson","./Choropleth","require"],o):t.map_ChoroplethStates=o(t.d3,t.topojson,t.map_Choropleth,t.require)}(this,function(t,o,e,s){function i(){e.call(this),this.projection("albersUsaPr")}var n=null,r=null,a=null;return i.prototype=Object.create(e.prototype),i.prototype.constructor=i,i.prototype._class+=" map_ChoroplethStates",i.prototype.layerEnter=function(o,s,i){e.prototype.layerEnter.apply(this,arguments),this._choroTopology=n.topology,this._choroTopologyObjects=n.topology.objects.states,this._selection.widgetElement(this._choroplethData),this.choroPaths=t.select(null);var r=this;this.tooltipHTML(function(t){var o=a[t[0]].id;return r.tooltipFormat({label:n.stateNames[o].name,value:t[1]})})},i.prototype.layerUpdate=function(t){e.prototype.layerUpdate.apply(this,arguments),this.choroPaths=this._choroplethData.selectAll(".data").data(this.visible()?this.data():[],function(t){return t[0]});var o=this;this.choroPaths.enter().append("path").attr("class","data").call(this._selection.enter.bind(this._selection)).on("click",function(t){o.click(o.rowToObj(t),"weight",o._selection.selected(this))}).on("dblclick",function(t){o.dblclick(o.rowToObj(t),"weight",o._selection.selected(this))}).on("mouseout.tooltip",this.tooltip.hide).on("mousemove.tooltip",this.tooltip.show),this.choroPaths.attr("d",function(o){var e=t._d3GeoPath(a[o[0]]);return e||console.log("Unknown US State:  "+o),e}).style("fill",function(t){var e=o._palette(t[1],o._dataMinWeight,o._dataMaxWeight);return e}),this.choroPaths.exit().remove()},i.prototype.layerPreRender=function(){return this._topoJsonPromise||(this._topoJsonPromise=new Promise(function(t,e){n&&t(),s(["json!src/map/TopoJSON/us-states.json"],function(e){n=e,r=o.feature(n.topology,n.topology.objects.states).features,a={};for(var s in r)r[s].id&&(a[n.stateNames[r[s].id].code]=r[s]);t()})})),this._topoJsonPromise},i});