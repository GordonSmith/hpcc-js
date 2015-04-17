(function(e,t){typeof define=="function"&&define.amd?define(["d3/d3","../common/SVGWidget"],t):e.chart_XYAxis=t(e.d3,e.common_SVGWidget)})(this,function(e,t){function n(n){t.call(this),this._xScale="",this.parseDate=e.time.format("%Y-%m-%d").parse}return n.prototype=Object.create(t.prototype),n.prototype.xScale=function(e){return arguments.length?(this._xScale=e,this):this._xScale},n.prototype.enter=function(t,n){var r=this;this.x=null;switch(this._xScale){case"DATE":this.x=e.time.scale();break;default:this.x=e.scale.ordinal()}this.y=e.scale.linear(),this.xAxis=e.svg.axis().orient("bottom").scale(this.x),this.yAxis=e.svg.axis().orient("left").scale(this.y).tickFormat(e.format(".2s")).ticks(10),this.recenterG=n.append("g"),this.svg=this.recenterG.append("g"),this.svgData=this.svg.append("g"),this.svgXAxis=this.svg.append("g").attr("class","x axis"),this.svgYAxis=this.svg.append("g").attr("class","y axis")},n.prototype.calcMargin=function(e,t){var n=this,r={top:8,right:0,bottom:24,left:40},i=this.width()-r.left-r.right,s=this.height()-r.top-r.bottom,o=t.append("g"),u=o.append("g").attr("class","x axis").attr("transform","translate(0,"+s+")").call(this.xAxis),a=o.append("g").attr("class","y axis").call(this.yAxis),f=u.node().getBBox(),l=a.node().getBBox();return r.bottom=f.height,r.left=l.width,o.remove(),r},n.prototype.update=function(t,n){var r=this;switch(this._xScale){case"DATE":var i=e.min(this._data,function(t){return e.min(t,function(e){return r.parseDate(e[0])})}),s=e.max(this._data,function(t){return e.max(t,function(e){return r.parseDate(e[0])})});this.x.domain([i,s]);break;default:this.x.domain(this._data.map(function(e){return e[0]}))}var i=e.min(this._data,function(t){return e.min(t.filter(function(e,t){return t>0&&r._columns[t]&&r._columns[t].indexOf("__")!==0}),function(e){return e})}),s=e.max(this._data,function(t){return e.max(t.filter(function(e,t){return t>0&&r._columns[t]&&r._columns[t].indexOf("__")!==0}),function(e){return e})}),o=i-(s-i)/10;i>=0&&o<0&&(o=0),this.y.domain([o,s]),this.x.rangeRoundBands?this.x.rangeRoundBands([0,this.width()],.1):this.x.rangeRound&&this.x.range([0,this.width()]),this.y.range([this.height(),0]);var u=this.calcMargin(t,n),a=this.width()-u.left-u.right,f=this.height()-u.top-u.bottom;this.x.rangeRoundBands?this.x.rangeRoundBands([0,a],.1):this.x.rangeRound&&this.x.range([0,a]),this.y.range([f,0]),this.svg.transition().attr("transform","translate("+u.left+","+u.top+")"),this.svgXAxis.transition().attr("transform","translate(0,"+f+")").call(this.xAxis),this.svgYAxis.transition().call(this.yAxis),this.updateChart(t,n,u,a,f),this.recenterG.transition().attr("transform","translate("+ -this.width()/2+","+ -this.height()/2+")")},n.prototype.updateChart=function(e,t,n,r,i){},n});