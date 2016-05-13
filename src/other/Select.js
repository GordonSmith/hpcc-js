"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["src/common/HTMLWidget", "css!./Select"], factory);
    } else {
        root.other_Select = factory(root.common_HTMLWidget);
    }
}(this, function (HTMLWidget) {
    function Select(target) {
        HTMLWidget.call(this);
        this._tag = 'div';
    }
    Select.prototype = Object.create(HTMLWidget.prototype);
    Select.prototype.constructor = Select;
    Select.prototype._class += " other_Select";

    Select.prototype.publish("label", null, "string", "Label for select");
    Select.prototype.publish("valueColumn", null, "set", "Select display value", function(){return this.columns();});
    Select.prototype.publish("textColumn", null, "set", "Select value(s)", function(){return this.columns();});
    Select.prototype.publish("multiple", false, "boolean", "Multiple selection");
    Select.prototype.publish("selectSize", 5, "number", "Size of multiselect box", null, {disabled:function(){return !this.multiple();}});
    
    Select.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        this._span = element.append("span");
        this._label = this._span.append("label")
    		.attr("for", this.id() + "select")
    	;
        this._select = this._span.append("select")
        	.attr("id", this.id()+"select")
        ;
    
    };

    Select.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);

        var context = this;
        
        this._label.text(this.label());
        
        this._select
        	.attr("multiple", this.multiple() ? this.multiple() : null)
        	.attr("size", this.multiple() ? this.selectSize() : null)
        ;
        
        var option = this._select.selectAll(".dataRow").data(this.data());
        option.enter().append("option")
            .attr("class", "dataRow")
            .on("click", function(d) {
            })
        ;
        option 	
        	.attr("value", function(row) {return row[1];})
        	.text(function (row) {return row[0];})
        ;
        option.exit().remove();
        
//        this._span.remove();
    };

    Select.prototype.exit = function (domNode, element) {
        this._span.remove();
        HTMLWidget.prototype.exit.apply(this, arguments);
    };

    return Select;
}));
