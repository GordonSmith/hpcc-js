"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/SVGWidget", "../common/Palette", "../common/PropertyExt", "../common/Utility", "css!./Cooccurance"], factory);
    } else {
        root.graph_Cooccurance = factory(root.d3, root.common_SVGWidget, root.common_Palette, root.common_PropertyExt, root.common_Utility, root.d3.Cooccurance);
    }
}(this, function (d3, SVGWidget, Palette, PropertyExt, Utility) {
    function Cooccurance(target) {
        SVGWidget.call(this);
        Utility.SimpleSelectionMixin.call(this);

        this._drawStartPos = "origin";
    }
    Cooccurance.prototype = Object.create(SVGWidget.prototype);
    Cooccurance.prototype.constructor = Cooccurance;
    Cooccurance.prototype._class += " graph_Cooccurance";
    Cooccurance.prototype.mixin(Utility.SimpleSelectionMixin);

    Cooccurance.prototype._palette = Palette.ordinal("default");

    Cooccurance.prototype.publish("paletteID", "default", "set", "Palette ID", Cooccurance.prototype._palette.switch());

    Cooccurance.prototype.enter = function (domNode, element) {
        SVGWidget.prototype.enter.apply(this, arguments);
    };

    Cooccurance.prototype.update = function (domNode, element) {
        SVGWidget.prototype.update.apply(this, arguments);
        /*
var margin = {top: 80, right: 0, bottom: 10, left: 90},
    width = 820,
    height = 820;

var x = d3.scale.ordinal().rangeBands([0, width]),
    z = d3.scale.linear().domain([0, 4]).clamp(true),
    c = d3.scale.category10().domain(d3.range(10));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// I used the 100 node set, and then sliced off the first 88.
d3.json("top_100eigen.json", function(json) {

	var sorted = json.nodes.slice();
	sorted.sort(function(a,b) {return d3.descending(a.eigen_cent,b.eigen_cent);});
	
  var matrix = [],
      nodes = sorted.slice(0,88),
      n = nodes.length,
	  linkstotal = 0;
	  
  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
  });

  // Convert links to matrix; count character occurrences.
  json.links.forEach(function(link) {
	if ((link.source < n) && (link.target < n)) {
    matrix[link.source][link.target].z += 1;
    matrix[link.target][link.source].z += 1;
    matrix[link.source][link.source].z += 1;
    matrix[link.target][link.target].z += 1;
	linkstotal += 1;
	}
  });

  // Precompute the orders.
  var orders = {
    degree: d3.range(n).sort(function(a, b) { return nodes[b].degree - nodes[a].degree; }),
    betweenness: d3.range(n).sort(function(a, b) { return nodes[b].betweenness - nodes[a].betweenness; }),
    partition: d3.range(n).sort(function(a, b) { return nodes[b].partition - nodes[a].partition; }),
	eigen: d3.range(n).sort(function(a, b) { return nodes[b].eigen_cent - nodes[a].eigen_cent; })
  };

  // The default sort order.
  x.domain(orders.eigen);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);
	  
  row.append("text")
      .attr("x", -6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].id; });

  var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].id; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand())
        .attr("height", x.rangeBand())
        .style("fill-opacity", function(d) { return z(d.z); })
        .style("fill", function(d) { return nodes[d.x].partition == nodes[d.y].partition ? c(nodes[d.x].partition) : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
  }

  function mouseover(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
  }

  function mouseout() {
    d3.selectAll("text").classed("active", false);
  }

  d3.select("#order").on("change", function() {
    clearTimeout(timeout);
    order(this.value);
  });

  function order(value) {
    x.domain(orders[value]);

    var t = svg.transition().duration(2500);

    t.selectAll(".row")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .selectAll(".cell")
        .delay(function(d) { return x(d.x) * 4; })
        .attr("x", function(d) { return x(d.x); });

    t.selectAll(".column")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
  }

  var timeout = setTimeout(function() {
    order("eigen");
    d3.select("#order").property("selectedIndex", 0).node().focus();
  }, 5000);
  
  var asidetextlengths = ["Nodes: " + nodes.length, "Edges: " + linkstotal];
	 
	d3.select("aside div.infotext").selectAll("p")
	.data(asidetextlengths)
	.enter()
	.append("p")
	.text(function(d) {return d;});
	
});
        
        */
    };

    Cooccurance.prototype.exit = function (domNode, element) {
        SVGWidget.prototype.exit.apply(this, arguments);
    };

    //  Events  ---
    Cooccurance.prototype.click = function (row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + "," + selected);
    };

    return Cooccurance;
}));
