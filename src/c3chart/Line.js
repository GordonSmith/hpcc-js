"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./CommonND"], factory);
    } else {
        root.c3chart_Line = factory(root.c3chart_CommonND);
    }
}(this, function (CommonND) {
    function Line(target) {
        CommonND.call(this);
        this._class = "c3chart_Line";

        this._type = "line";
    };
    Line.prototype = Object.create(CommonND.prototype);

    Line.prototype.publish("lineWidth", 1.0, "number", "LineWidth");
    Line.prototype.publish("dashedLine", [5,5], "array", "Dashed Lines");

    Line.prototype.enter = function (domNode, element) {
        CommonND.prototype.enter.apply(this,arguments);
    }
    
    Line.prototype.update = function (domNode, element) {

        updateStyles.call(this);
      
        CommonND.prototype.update.apply(this, arguments);
    }
    
    var updateStyles = function() {
        this.updateStyle('#'+this.id()+'.'+this._class+' .c3-line','stroke-width',this.lineWidth()+'px');
        this.updateStyle('#'+this.id()+'.'+this._class+' .c3-line','stroke-dasharray',this.dashedLine().toString());
    }

    return Line;
}));
