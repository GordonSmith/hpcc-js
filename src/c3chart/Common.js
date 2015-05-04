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
    Common.prototype.publish("lineWidth", 1.0, "number", "LineWidth");
     Common.prototype.publish("dashLine", [], "array", "Dashed Lines");

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
        initStyle.call(this);
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
        
        updateStyles.call(this);

        this.c3Chart.resize({
            width: this.width(),
            height: this.height()
        });
    };


    var initStyle = function() {
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        style.type = 'text/css';
        style.setAttribute("id","c3-stylesheet");

        head.appendChild(style);
    }

    var updateStyles = function() {
        this.updateStyle('.c3chart_Area .c3-line','stroke-width',this.lineWidth()+'px');
        this.updateStyle('.c3chart_Area .c3-line','stroke-dasharray',this.dashLine().toString());
    }

    Common.prototype.updateStyle = function(selector,property,value) {
        var index = 0;
        for (var i = 0; i < document.styleSheets.length; i++) {
            var styleSheet = document.styleSheets[i];
            if (styleSheet.ownerNode.id === "c3-stylesheet") {
                index = i;
                break;
            }
        }

        var theRules = document.styleSheets[index].cssRules;
        console.log(document.styleSheets[index]);
        var found = 0;
        for (var n in theRules) {
            if (theRules[n].selectorText === selector)   {
                theRules[n].style[property] = value;
                found = 1;
            }
        }

        if (!found) {
            var style = document.getElementById("c3-stylesheet");
            var css = selector+'{'+property+':'+value+';'+'}';
            style.appendChild(document.createTextNode(css));
        }
    }

    return Common;
}));
