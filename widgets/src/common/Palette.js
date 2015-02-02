(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3/d3", "lib/colorbrewer/colorbrewer"], factory);
    } else {
        root.Entity = factory(root.d3);
    }
}(this, function (d3) {
    var sets = [
        "category10", "category20", "category20b", "category20c",
        "Accent", "Dark2", "Paired", "Pastel1", "Pastel2", "Set1", "Set2", "Set3"
    ];
    var d3Ordinal = [
        "category10", "category20", "category20b", "category20c"
    ];
    var brewerOrdinal = [
        "Accent", "Dark2", "Paired", "Pastel1", "Pastel2", "Set1", "Set2", "Set3"
    ];
    var hpccOrdinal = [
        "hpcc10", "hpcc20"
    ];

    var ordinalCache = {};
    var rainbowCache = {};

    function fetchOrdinalItem(id, colors) {
        if (!id) return palette_ordinal();
        var retVal = ordinalCache[id];
        if (!retVal) {
            retVal = palette_ordinal(id, colors);
            ordinalCache[id] = retVal;
        }
        return retVal;
    };

    function palette_ordinal(id, colors) {
        if (!id) return d3Ordinal.concat(brewerOrdinal).concat(hpccOrdinal);
        var id = id;
        var scale = null;
        var colors = colors;

        if (colors) {
            scale = d3.scale.ordinal().range(colors);
        } else {
            if (d3Ordinal.indexOf(id) >= 0) {
                scale = new d3.scale[id]();
            } else if (hpccOrdinal.indexOf(id) >= 0) {
                var newColors = []
                switch (id) {
                    case "hpcc10":
                        var colors = palette_ordinal("default").colors();
                        newColors = colors.filter(function (item, idx) {
                            if (idx % 2) {
                                return true;
                            }
                            return false;
                        });
                        break;
                    case "hpcc20":
                        newColors = palette_ordinal("category10").colors().concat(palette_ordinal("hpcc10").colors());
                        break;
                }
                scale = d3.scale.ordinal().range(newColors);
            } else if (brewerOrdinal.indexOf(id) > 0) {
                var largestPalette = 12;
                while (largestPalette > 0) {
                    if (colorbrewer[id][largestPalette]) {
                        scale = d3.scale.ordinal().range(colorbrewer[id][largestPalette]);
                        break;
                    }
                    --largestPalette;
                }
            }
            if (!scale) {
                //  Default to Category20  ---
                scale = d3.scale.category20();
            }
            colors = scale.range();
        }
        function ordinal(x) {
            return scale(x);
        }
        ordinal.id = function (_) {
            if (!arguments.length) return id;
            id = _;
            return ordinal;
        }
        ordinal.colors = function (_) {
            if (!arguments.length) return colors;
            colors = _;
            return ordinal;
        }
        ordinal.clone = function (newID) {
            ordinalCache[newID] = palette_ordinal(newID, this.color());
        }
        return ordinal;
    };

    brewer = function (palette, from, to) {
        if (!arguments.length) {
            var retVal = [];
            for(var key in colorbrewer) {
                if (sets.indexOf(key) === -1) {
                    retVal.push(key);
                }
            }
            return retVal;
        };
        if (!colorbrewer[palette]) {
            throw "Invalid color palette:  " + palette;
        }
        var largestPalette = 12;
        while (largestPalette > 0) {
            if (colorbrewer[palette][largestPalette]) {
                return custom(colorbrewer[palette][largestPalette], from, to);
            }
            --largestPalette;
        }
        return null;
    };

    custom = function (colorArr, from, to, steps) {
        steps = steps || 32;
        var subPaletteSize = Math.ceil(steps / (colorArr.length - 1));
        var range = [];
        var prevColor = null;
        colorArr.forEach(function(color) {
            if (prevColor) {
                var scale = d3.scale.linear()
                    .domain([0, subPaletteSize])
                    .range([prevColor, color])
                    .interpolate(d3.interpolateLab)
                ;
                for(var i = 0; i < subPaletteSize; ++i) {
                    range.push(scale(i));
                }
            }
            prevColor = color;
        });
        return d3.scale.quantize().domain([from, to]).range(range);
    };
    
    test = function(ordinalDivID, brewerDivID, customDivID, customArr, steps) {
        d3.select(ordinalDivID)
          .selectAll(".palette")
            .data(palette_ordinal(), function (d) { return d; })
          .enter().append("span")
            .attr("class", "palette")
            .attr("title", function(d) { return d; })
            .on("click", function(d) { 
                console.log(d3.values(d.value).map(JSON.stringify).join("\n")); 
            })
          .selectAll(".swatch").data(function (d) { return palette_ordinal(d).colors(); })
          .enter().append("span")
            .attr("class", "swatch")
            .style("background-color", function(d) { return d; });

        d3.select(brewerDivID)
          .selectAll(".palette")
            .data(brewer(), function(d){ return d; })
          .enter().append("span")
            .attr("class", "palette")
            .attr("title", function(d) { return d; })
            .on("click", function(d) { 
                console.log(d3.values(d.value).map(JSON.stringify).join("\n")); 
            })
          .selectAll(".swatch2").data(function(d) { return brewer(d).range(); })
          .enter().append("span")
            .attr("class", "swatch2")
            .style("height", (256 / 32)+"px")
            .style("background-color", function(d) { return d; });
            
        var scale = {id:customArr.join("_") + steps, scale: custom(customArr, 0, 255, steps)};
        d3.select(customDivID)
          .selectAll(".palette")
            .data([scale], function(d) {return d.id;})
          .enter().append("span")
            .attr("class", "palette")
            .attr("title", function(d) { return "aaa";/*d.from + "->" + d.to;*/ })
            .on("click", function(d) { 
                console.log(d3.values(d.value).map(JSON.stringify).join("\n")); 
            })
          .selectAll(".swatch2").data(function(d) {
                var domain = d.scale.domain();
                var retVal = [];
                for (var i = domain[0]; i <= domain[1]; ++i) 
                  retVal.push(d.scale(i));
                return retVal;
          })
          .enter().append("span")
            .attr("class", "swatch2")
            .style("background-color", function(d) { return d; });
    };    

    return {
        ordinal: fetchOrdinalItem,
        brewer: brewer,
        custom: custom,
        test: test
    };
}));
