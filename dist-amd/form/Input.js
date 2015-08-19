(function(e,t){typeof define=="function"&&define.amd?define(["d3","../common/HTMLWidget","../api/IInput","css!./Input"],t):e.form_Form=t(e.d3,e.common_HTMLWidget,e.api_IInput)})(this,function(e,t,n){function r(){t.call(this),n.call(this),this._tag="div"}return r.prototype=Object.create(t.prototype),r.prototype._class+=" form_Input",r.prototype.implements(n.prototype),r.prototype.testData=function(){return this},r.prototype.publish("type","text","set","Input type",["textbox","number","checkbox","button","select","textarea","date"]),r.prototype.publish("selectOptions",[],"array","Array of options used to fill a dropdown list"),r.prototype.testData=function(){return this},r.prototype.enter=function(e,n){t.prototype.enter.apply(this,arguments),this.createInput(n)},r.prototype.update=function(e,n){t.prototype.update.apply(this,arguments),this._inputElement.attr("name",this.name());switch(this.type()){case"select":this.checkNodeName("SELECT",n),this._inputElement.property("value",this.value()),this.insertSelectOptions(this.selectOptions());break;case"textarea":this.checkNodeName("TEXTAREA",n),this._inputElement.property("value",this.value());break;case"button":this.checkNodeName("BUTTON",n),this._inputElement.text(this.value());break;case"checkbox":this.checkNodeName("INPUT",n),this._inputElement.property("checked",this.value());break;default:this.checkNodeName("INPUT",n),this._inputElement.attr("type",this.type()),this._inputElement.property("value",this.value())}},r.prototype.createInput=function(e){switch(this.type()){case"select":this._inputElement=e.append("select");break;case"textarea":this._inputElement=e.append("textarea");break;case"button":this._inputElement=e.append("button");break;default:this._inputElement=e.append("input").attr("type",this.type())}this._inputElement.on("click",function(e){e.click(e)}),this._inputElement.on("blur",function(e){e.blur(e)});var t=this;this._inputElement.on("change",function(e){switch(t.type()){case"checkbox":t.value(t._inputElement.property("checked"));break;default:t.value(t._inputElement.property("value"))}e.change(e)})},r.prototype.insertSelectOptions=function(e){var t="";e.length>0?e.forEach(function(e){t+="<option value='"+e+"'>"+e+"</option>"}):t+="<option>selectOptions not set</option>",this._inputElement.html(t)},r.prototype.checkNodeName=function(e,t){var n=this._inputElement.node();n.nodeName!==e&&(n.remove(),this.createInput(t))},r.prototype.resetValue=function(e){e.type()==="checkbox"?e.value(e._inputElement.node().checked):e.value(e._inputElement.node().value)},r});