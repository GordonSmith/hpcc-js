"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "c3", "../common/HTMLWidget", "css!c3"], factory);
    } else {
        root.c3chart_Common = factory(root.d3, root.c3, root.common_HTMLWidget);
    }
}(this, function (d3, c3, HTMLWidget) {
    function Common(target) {
        HTMLWidget.call(this);

        this._tag = "div";
        this._class = "c3chart_Common";
        this._type = "unknown";
        var context = this;
        this._config = {
            axis: {
            },
            legend: {
                position: 'bottom',
                show: true
            },
            data: {
                columns: [],
                rows: []
            }
        };
    };
    Common.prototype = Object.create(HTMLWidget.prototype);

    Common.prototype.publish("legendPosition", "right", "set", "Legend Position", ["bottom", "right"]);

    Common.prototype.type = function (_) {
        if (!arguments.length) return this._type;
        this._type = _;
        return this;
    };

    Common.prototype.getC3Series = function() {
        return this._columns.filter(function (d, i) { return i > 0;});
    };

    Common.prototype.getC3Rows = function () {
        var retVal = [this._columns.filter(function (item, idx) { return idx > 0; })].concat(this._data.map(function (row) {
            return row.filter(function (cell, idx) {
                return idx > 0;
            })
        }));
        return retVal;
    };

    Common.prototype.getC3Categories = function () {
        var retVal = this._data.map(function (row, idx) { return row[0]; });
        return retVal;
    };

    Common.prototype.getC3Column = function (colNum) {
        var retVal = [this._columns[colNum]].concat(this._data.map(function (row, idx) { return row[colNum]; }));
        return retVal;
    };

    Common.prototype.getC3Columns = function (total) {
        if (!this._data.length) {
            return [];
        }
        total = total || this._columns.length;
        var retVal = [];
        for (var i = 1; i < total; ++i) {
            retVal.push(this.getC3Column(i));
        }
        return retVal;
    };

    Common.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        element.style("overflow", "hidden");
        this._config.size = {
            width: this.width(),
            height: this.height()
        };
        this._config.data.type = this._type;
        this._config.legend = {
            position: this.legendPosition()
        };
        this._config.bindto = element.append("div").datum(null);
        this.c3Chart = c3.generate(this._config);
    };

    Common.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        
        updateStyle.call(this);

        this.c3Chart.resize({
            width: this.width(),
            height: this.height()
        });
    };

    function updateStyle() {

        //http://stackoverflow.com/questions/20189148/regex-used-in-javascript-array-indexof
        //http://stackoverflow.com/questions/730048/how-to-change-remove-css-classes-definitions-at-runtime
        //http://davidwalsh.name/add-rules-stylesheets
        //http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
        var index = 0;
        for (var i = 0; i < document.styleSheets.length; i++) {
            var styleSheet = document.styleSheets[i];
            console.log(styleSheet);
            
            if (styleSheet.href) {
                if (styleSheet.href.match(/hpcc-c3/)) {
                    console.log(styleSheet);
                    this.styleSheet = styleSheet; // do this on .enter that way we dont need to loop through each time
                    console.log("<ss>");
                    console.log(styleSheet);
                    console.log("</ss>");
                    index = i;
                }
            }
            
        }
        console.log(index);
        
        var theRules = document.styleSheets[index].cssRules;
        console.log(document.styleSheets[index]);
           for (var n in theRules) {
            console.log(theRules[n].selectorText);
                if (theRules[n].selectorText === ".c3chart_Area .c3-line")   {
                    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbb');
                    console.log(theRules[n].style);
                    theRules[n].style['stroke-width'] = '5px';
                }
            }
        //document.styleSheets[20].addRule(".c3-line", "stroke-width: 5px");
    }

    return Common;
}));
