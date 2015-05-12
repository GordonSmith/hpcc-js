"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./CommonND"], factory);
    } else {
        root.c3chart_Area = factory(root.c3chart_CommonND);
    }
}(this, function (CommonND) {
    function Area(target) {
        CommonND.call(this);

        this._type = "area";
    };
    Area.prototype = Object.create(CommonND.prototype);
    Area.prototype._class += " c3chart_Area";

    /**
     * Publish Params Common To Other Libraries
     */
    Area.prototype.publish("isStacked", false, "boolean", "Show SubChart",null,{tags:['Basic','TODO2']});
    Area.prototype.publish("lineWidth", 1.0, "number", "LineWidth",null,{tags:['Basic','TODO2']});
    Area.prototype.publish("lineDashStyle", [], "array", "Dashed Lines",null,{tags:['Basic','TODO2']});
    Area.prototype.publish("lineOpacity", 1.0, "number", "LineWidth",null,{tags:['Basic','TODO2']});
    Area.prototype.publish("fillOpacity", 0.2, "number", "Opacity of the shape fill color",null,{tags:['Basic','TODO2']}); // NOT WORKING
    
    /**
     * Publish Params Unique To This Library
     */
    
    Area.prototype.enter = function (domNode, element) {
        CommonND.prototype.enter.apply(this,arguments);
    }
    
    Area.prototype.update = function (domNode, element) {
        CommonND.prototype.update.apply(this, arguments);

        if (this.isStacked()) {
            this.c3Chart.groups([this._columns.slice(1,this._columns.length)]);
        } else {
            this.c3Chart.groups([]);
        }
        
        element.selectAll(".c3-line").style({ 
            "stroke-width": this.lineWidth()+"px", 
            "stroke-opacity": this.lineOpacity(), 
            "stroke-dasharray": this.lineDashStyle().toString(), 
        });

        element.selectAll(".c3-area").style({ // NOT WORKING (css gets overwritten?)
            "opacity": this.fillOpacity()
        });
    }
    
    return Area;
}));
