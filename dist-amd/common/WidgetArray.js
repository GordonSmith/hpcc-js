!function(t,e){"function"==typeof define&&define.amd?define(["./Widget"],e):t.common_WidgetArray=e(t.common_Widget)}(this,function(t){function e(){t.call(this)}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype._class+=" common_WidgetArray",e.prototype.publish("content",[],"widgetArray","Widget Array"),e.prototype.target=function(t){t||(this.content_reset(),this.exit())},e});