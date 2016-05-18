"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "d3-bullet", "css!./BulletChart"], factory);
    } else {
        root.template_BulletChart = factory(root.common_HTMLWidget);
    }
}(this, function (d3, HTMLWidget, D3Bullet) {
    function BulletChart(target) {
        HTMLWidget.call(this);
        
        this._tag = "div";
    }
    BulletChart.prototype = Object.create(HTMLWidget.prototype);
    BulletChart.prototype.constructor = BulletChart;
    BulletChart.prototype._class += " chart_BulletChart";

    BulletChart.prototype.publish("stringProp", "defaultValue", "string", "Sample Property");
    
    BulletChart.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
    };

    BulletChart.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
                
        var margin = {top: 5, right: 40, bottom: 20, left: 120},
        width = this.width() - margin.left - margin.right,
        height = 50 - margin.top - margin.bottom;

	    var chart = d3.bullet()
	        .width(width)
	        .height(height);
	    
	    var svg = element.selectAll("svg").data(this.data());
	    
	    svg.enter().append("svg")
	    	.attr("class", "bullet").each(function (d) {
	    		var element = d3.select(this);
	    		var bulletBar = element.append("g")
	    			.attr("class", "bulletBar");
	    		
    			var bulletTitle = bulletBar.append("g")
	    			.attr("class", "bulletTitle");
    			
    			bulletTitle.append("text")
    	          .attr("class", "title")
    	          .text(function(d) { return d.title; })
    			
    			bulletTitle.append("text")
    	          .attr("class", "subtitle")
    	          .attr("dy", "1em")
    	          .text(function(d) { return d.subtitle; });
	    	});
	    	
    	;
	    
	    svg
	    	.attr("width", width + margin.left + margin.right)
	    	.attr("height", height + margin.top + margin.bottom)
    	;
	    
	    svg.select(".bulletBar")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.call(chart)
          ;
	    svg.exit().remove();

      var title = svg.select(".bulletTitle")
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + height / 2 + ")");

      title.select(".title")
          .text(function(d) { return d.title; });

      title.select(".subtitle")
          .text(function(d) { return d.subtitle; });

      d3.selectAll("button").on("click", function() {
        svg.datum(randomize).call(chart.duration(1000)); // TODO automatic transition
      });

    function randomize(d) {
      if (!d.randomizer) d.randomizer = randomizer(d);
      d.ranges = d.ranges.map(d.randomizer);
      d.markers = d.markers.map(d.randomizer);
      d.measures = d.measures.map(d.randomizer);
      return d;
    }

    function randomizer(d) {
      var k = d3.max(d.ranges) * .2;
      return function(d) {
        return Math.max(0, d + k * (Math.random() - .5));
      };
    }

    };

    BulletChart.prototype.exit = function (domNode, element) {
        HTMLWidget.prototype.exit.apply(this, arguments);
    };

    return BulletChart;
}));
