define("css!src/form/Input",[],function(){}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Button",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_Button=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_Button",o.prototype["implements"](n.prototype),o.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments);var o=this;this._inputElement[0]=n.append("button").attr("name",this.name()).on("click",function(t){t.click(t)}).on("blur",function(t){t.blur(t)}).on("change",function(t){o.value([o._inputElement[0].property("value")]),t.change(t)})},o.prototype.update=function(t,n){e.prototype.update.apply(this,arguments),this._inputElement[0].text(this.value())},o}),function(t,e){"function"==typeof define&&define.amd?define("src/form/CheckBox",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_CheckBox=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_CheckBox",o.prototype["implements"](n.prototype),o.prototype.publish("selectOptions",[],"array","Array of options used to fill a dropdown list"),o.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments);var o=this,i=n.append("ul");this.selectOptions().length||this.selectOptions().push(""),this.selectOptions().forEach(function(t,e){o._inputElement[e]=i.append("li").append("input").attr("type","checkbox"),o._inputElement[e].node().insertAdjacentHTML("afterend","<text>"+t+"</text>")}),this._inputElement.forEach(function(t,e){t.attr("name",o.name()),t.on("click",function(t){t.click(t)}),t.on("blur",function(t){t.blur(t)}),t.on("change",function(t){var e=[];o._inputElement.forEach(function(t,n){t.property("checked")&&e.push(t.property("value"))}),o.value(e),t.change(t)})})},o.prototype.update=function(t,n){e.prototype.update.apply(this,arguments);var o=this;this._inputElement.forEach(function(t,e){t.property("value",o.selectOptions()[e]),-1!==o.value().indexOf(o.selectOptions()[e])&&"false"!==o.value()?t.property("checked",!0):t.property("checked",!1)})},o.prototype.insertSelectOptions=function(t){var e="";t.length>0?t.forEach(function(t){var n=t instanceof Array?t[0]:t,o=t instanceof Array?t[1]?t[1]:t[0]:t;e+="<option value='"+n+"'>"+o+"</option>"}):e+="<option>selectOptions not set</option>",this._inputElement[0].html(e)},o}),function(t,e){"function"==typeof define&&define.amd?define("src/form/ColorInput",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_ColorInput=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_ColorInput",o.prototype["implements"](n.prototype),o.prototype.enter=function(n,o){e.prototype.enter.apply(this,arguments);var i=this;this._inputElement[0]=o.append("input").attr("type","text"),this._inputElement[0].classed("color-text",!0),this._inputElement[1]=o.append("input").attr("type","color"),this._inputElement.forEach(function(e,n){e.on("click",function(t){t.click(t)}),e.on("blur",function(t){t.blur(t)}),e.on("change",function(e){0===n?(i._inputElement[1].property("value",t.rgb(i._inputElement[0].property("value")).toString()),i.value(i._inputElement[0].property("value"))):(i._inputElement[0].property("value",i._inputElement[1].property("value")),i.value(t.rgb(i._inputElement[1].property("value")).toString())),e.change(e)})})},o.prototype.update=function(n,o){e.prototype.update.apply(this,arguments);var i=this;this._inputElement.forEach(function(t){t.attr("name",i.name())}),this._inputElement[0].attr("type","text"),this._inputElement[1].attr("type","color"),this._inputElement[0].property("value",this.value()),this._inputElement[1].property("value",t.rgb(this.value()).toString())},o}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Input",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_Input=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_Input",o.prototype["implements"](n.prototype),o.prototype.publish("type","text","set","Input type",["number","button","date","text","textarea","search","email","time","datetime","hidden"]),o.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments);var o=this;switch(this.type()){case"button":this._inputElement[0]=n.append("button");break;case"textarea":this._inputElement[0]=n.append("textarea");break;default:this._inputElement[0]=n.append("input").attr("type",this.type())}this._inputElement.forEach(function(t,e){t.attr("name",o.name()),t.on("click",function(t){t.click(t)}),t.on("blur",function(t){t.blur(t)}),t.on("change",function(e){o.value([t.property("value")]),e.change(e)})})},o.prototype.update=function(t,n){switch(e.prototype.update.apply(this,arguments),this.type()){case"button":this._inputElement[0].text(this.value());break;case"textarea":this._inputElement[0].property("value",this.value());break;default:this._inputElement[0].attr("type",this.type()),this._inputElement[0].property("value",this.value())}},o}),define("css!src/form/Slider",[],function(){}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Slider",["d3","../common/SVGWidget","../api/IInput","../common/Icon","css!./Slider"],e):t.form_Slider=e(t.d3,t.common_SVGWidget,t.api_IInput,t.common_Icon)}(this,function(t,e,n,o){function i(){e.call(this),n.call(this),this.selectionLabel(""),this._playing=!1,this._loop=!1,this.xScale=t.scale.linear().clamp(!0);var i=this;this._playIcon=(new o).faChar(""),this._playIcon.click=function(e){t.event.stopPropagation(),i._playing?i.pause():i.play()},this._loopIcon=(new o).faChar("").image_colorFill(this._loop?null:"#bbb").shape_colorFill(this._loop?null:"white").paddingPercent(33),this._loopIcon.click=function(t){i._loop?i._loop=!1:i._loop=!0,i._loopIcon.image_colorFill(i._loop?null:"#bbb").shape_colorFill(i._loop?null:"white").render()},this.brush=t.svg.brush().x(this.xScale).extent([0,0]).on("brushstart",function(t){i.brushstart(t,this)}).on("brush",function(t){i.brushmove(t,this)}).on("brushend",function(t){i.brushend(t,this)}),this.brush.empty=function(){return!1},this.axis=t.svg.axis().scale(this.xScale).orient("bottom").tickValues(null).tickFormat(function(t){return t}).tickSize(0).tickPadding(12),this._inputElement=[]}return i.prototype=Object.create(e.prototype),i.prototype.constructor=i,i.prototype._class+=" form_Slider",i.prototype["implements"](n.prototype),i.prototype.publish("padding",16,"number","Outer Padding",null,{tags:["Basic"]}),i.prototype.publish("fontSize",null,"number","Font Size",null,{tags:["Basic"]}),i.prototype.publish("fontFamily",null,"string","Font Name",null,{tags:["Basic"]}),i.prototype.publish("fontColor",null,"html-color","Font Color",null,{tags:["Basic"]}),i.prototype.publish("allowRange",!1,"boolean","Allow Range Selection",null,{tags:["Intermediate"]}),i.prototype.publish("low",0,"number","Low",null,{tags:["Intermediate"]}),i.prototype.publish("high",100,"number","High",null,{tags:["Intermediate"]}),i.prototype.publish("step",10,"number","Step",null,{tags:["Intermediate"]}),i.prototype.publish("selectionLabel","","string","Selection Label",null,{tags:["Intermediate"]}),i.prototype.publish("showPlay",!1,"boolean","Show Play Button"),i.prototype.publish("playInterval",1e3,"number","Play Interval"),i.prototype.publishProxy("playDiameter","_playIcon","diameter",32),i.prototype.publish("playGutter",12,"number","Play Gutter"),i.prototype.publishProxy("loopDiameter","_loopIcon","diameter",24),i.prototype.publish("loopGutter",4,"number","Play Gutter"),i.prototype.name=function(t){return i.prototype.columns.apply(this,arguments)},i.prototype.value=function(t){return i.prototype.data.apply(this,arguments)},i.prototype.play=function(){this._playing=!0,this._playIcon.faChar("").render();var t=this.data();(t<this.low()||t>=this.high())&&(t=this.low(),this.data(t).render(),this._click());var e=this;this.intervalHandler=setInterval(function(){t+=e.step(),t>e.high()?e._loop===!0?(t=e.low(),e.data(t).render(),e._click()):e.pause():(e.data(t).render(),e._click())},e.playInterval())},i.prototype.pause=function(){this._playing=!1,this._playIcon.faChar("").render(),clearInterval(this.intervalHandler)},i.prototype.data=function(t){var n=e.prototype.data.apply(this,arguments);return arguments.length&&this.brushg&&this.brushg.call(this.brush.extent(this.allowRange()?this.data():[this.data(),this.data()])),n},i.prototype.enter=function(t,e){this.sliderElement=e.append("g"),this._inputElement.push(this.sliderElement),this.axisElement=this.sliderElement.append("g").attr("class","x axis"),this.brushg=this.sliderElement.append("g").attr("class","brush").call(this.brush),this.brushg.select(".background").attr("y",-9).attr("height",18),this.brushg.select(".extent").attr("y","-10").attr("height","20"),this.brushg.selectAll(".resize").select("rect").attr("x",function(t){return"e"===t?0:-8}).attr("y","-10").attr("width","8").attr("height","20"),this.handle=this.brushg.selectAll(".resize").append("path").attr("class","handle").attr("transform","translate(0,-27)"),this._playIcon.target(this.sliderElement.node()).render(),this._loopIcon.target(this.sliderElement.node()).render()},i.prototype.calcDelta=function(t,e,n,o){var i=e.append("g").attr("class","x axis").attr("transform","translate(0, -64)").call(this.axis);i.selectAll(".tick > text").style("fill",this.fontColor()).style("font-size",this.fontSize()).style("font-family",this.fontFamily());var r=i.node().getBBox(),p={left:r.x-n,right:r.x-n+r.width-o};return i.remove(),p},i.prototype.update=function(e,n){var o=this,i=-this.width()/2+this.padding(),r=this.width()-2*this.padding();this._playIcon.pos({x:r/2-(this.loopDiameter()+this.loopGutter()+this.playDiameter()/2),y:0}).diameter(this.playDiameter()).display(this.showPlay()).render(),this._loopIcon.pos({x:r/2-this.loopDiameter()/2,y:0}).diameter(this.loopDiameter()).display(this.showPlay()).render(),(this.high()-this.low())/this.step()<=10?this.axis.tickValues(t.merge([t.range(this.low(),this.high(),this.step()),[this.high()]])):this.axis.tickValues(null),r-=this.showPlay()?this.loopDiameter()+this.loopGutter()+this.playDiameter()+this.playGutter():0,this.xScale.domain([this.low(),this.high()]).range([i,i+r]);var p=this.calcDelta(e,n,i,r);this.xScale.range([i-p.left,i+r-p.right]),this.axisElement.call(this.axis),this.axisElement.selectAll(".tick > text").style("fill",this.fontColor()).style("font-size",this.fontSize()).style("font-family",this.fontFamily());var a=this.xScale.range();this.brushg.select(".background").attr("x",a[0]).attr("width",a[1]-a[0]),this.handle.attr("d",function(t){return o.handlePath(t)}),0===this.data().length&&(this.allowRange()?this.data([this.low(),this.low()]):this.data(this.low())),this.brushg.call(this.brush.extent(this.allowRange()?this.data():[this.data(),this.data()]));var s=this.sliderElement.node().getBBox();this.sliderElement.attr("transform","translate(0, "+-(s.y+s.height/2)+")")},i.prototype.brushstart=function(e,n){t.event&&t.event.sourceEvent&&t.event.sourceEvent.stopPropagation()},i.prototype.brushmove=function(e,n){if(t.event&&t.event.sourceEvent&&(t.event.sourceEvent.stopPropagation(),!this.allowRange())){var o=this.xScale.invert(t.mouse(n)[0]);t.select(n).call(this.brush.extent([o,o]))}},i.prototype.brushend=function(e,n){if(t.event&&t.event.sourceEvent)if(t.event.sourceEvent.stopPropagation(),this.allowRange()){var o=this.brush.extent();o[0]=this.nearestStep(o[0]),o[1]=this.nearestStep(o[1]),this.data(o),t.select(n).call(this.brush.extent(o)),this.newSelection(o[0],o[1])}else{var i=this.nearestStep(this.xScale.invert(t.mouse(n)[0]));t.select(n).call(this.brush.extent([i,i])),this.data(i),this._click()}},i.prototype.nearestStep=function(t){return this.low()+Math.round((t-this.low())/this.step())*this.step()},i.prototype.handlePath=function(t,e){var n=+("e"===t),o=n?1:-1,i=this.allowRange()?.5:0,r=18,p="M"+i*o+","+r+"A6,6 0 0 "+n+" "+6.5*o+","+(r+6)+"V"+(2*r-6)+"A6,6 0 0 "+n+" "+i*o+","+2*r;return p+=this.allowRange()?"ZM"+2.5*o+","+(r+8)+"V"+(2*r-8)+"M"+4.5*o+","+(r+8)+"V"+(2*r-8):"M"+1*o+","+(r+8)+"V"+(2*r-8)},i.prototype._click=function(){if(this.selectionLabel()){var t={};t[this.selectionLabel()]=this.data(),this.click(t)}else this.click(this.data())},i.prototype.newSelection=function(t,e){console.log("newSelection:  "+t+", "+e)},i}),define("css!src/form/Form",[],function(){}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Form",["d3","../common/HTMLWidget","../common/SVGWidget","../common/WidgetArray","./Input","./Button","./Slider","css!./Form"],e):t.form_Form=e(t.d3,t.common_HTMLWidget,t.common_SVGWidget,t.common_WidgetArray,t.form_Input,t.form_Button,t.form_Slider)}(this,function(t,e,n,o,i,r,p){function a(){e.call(this),this._tag="form"}return a.prototype=Object.create(e.prototype),a.prototype.constructor=a,a.prototype._class+=" form_Form",a.prototype.publish("validate",!0,"boolean","Enable/Disable input validation"),a.prototype.publish("inputs",[],"widgetArray","Array of input widgets"),a.prototype.publish("showSubmit",!0,"boolean","Show Submit/Cancel Controls"),a.prototype.publish("omitBlank",!1,"boolean","Drop Blank Fields From Submit"),a.prototype.publish("allowEmptyRequest",!1,"boolean","Allow Blank Form to be Submitted"),a.prototype.data=function(t){if(!arguments.length){var e=[];return this.inputsForEach(function(t){e.push(t.value())}),e}return this.inputsForEach(function(e,n){t.length>n&&e.value(t[n]).render()}),this},a.prototype.inputsForEach=function(t,e){var n=0;this.inputs().forEach(function(i){var r=i instanceof o?i.content():[i];r.forEach(function(o){e?t.call(e,o,n++):t(o,n++)})})},a.prototype.calcMaxColumns=function(){var t=0;return this.inputs().forEach(function(e){var n=e instanceof o?e.content():[e];n.length>t&&(t=n.length)}),t},a.prototype.values=function(t){if(!arguments.length){var e={};return this.inputsForEach(function(t){var n=t.value();(n||!this.omitBlank())&&(e[t.name()]=t.value())},this),e}return this.inputsForEach(function(e){t[e.name()]?e.value(t[e.name()]):this.omitBlank()&&e.value("")},this),this},a.prototype.submit=function(){var t=!0;this.validate()&&(t=this.checkValidation()),(this.allowEmptyRequest()||this.inputs().some(function(t){return-1!==t._class.indexOf("WidgetArray")?t.content().some(function(t){return t.hasValue()}):t.hasValue()}))&&this.click(t?this.values():null)},a.prototype.clear=function(){this.inputsForEach(function(t){switch(t.classID()){case"form_Slider":t.allowRange()?t.value([t.low(),t.low()]).render():t.value(t.low()).render();break;case"form_CheckBox":t.value(!1).render();break;case"form_Button":break;default:t.value("").render()}})},a.prototype.checkValidation=function(){var t=!0,e=[];return this.inputsForEach(function(t){t.isValid()||e.push("'"+t.label()+"' value is invalid.")}),e.length>0&&(alert(e.join("\n")),t=!1),t},a.prototype.enter=function(n,o){e.prototype.enter.apply(this,arguments),o.on("submit",function(){t.event.preventDefault()}),this._parentElement.style("overflow","auto");var i=o.append("table");this.tbody=i.append("tbody"),this.tfoot=i.append("tfoot"),this.btntd=this.tfoot.append("tr").append("td").attr("colspan",2);var p=this;this._controls=[(new r).value("Submit").on("click",function(){p.submit(p.values())},!0),(new r).value("Clear").on("click",function(){p.clear({})},!0)];var a=p.btntd.append("div").style("float","right");this._controls.forEach(function(t){var e=a.append("span").style("float","left");t.target(e.node()).render()})},a.prototype.update=function(i,r){e.prototype.update.apply(this,arguments),this._maxCols=this.calcMaxColumns();var p=this,a=this.tbody.selectAll("tr").data(this.inputs());a.enter().append("tr").each(function(e,i){var r=t.select(this),a=e instanceof o?e.content():[e];a.forEach(function(t,e){r.append("td").attr("class","prompt").text(t.label()+":");var o=r.append("td").attr("class","input");if(e===a.length-1&&a.length<p._maxCols&&o.attr("colspan",2*(p._maxCols-a.length+1)),t.target(o.node()).render(),t instanceof n){var i=t.element().node().getBBox();o.style("height",i.height+"px"),t.resize().render()}t._inputElement instanceof Array&&t._inputElement.forEach(function(t){t.on("change.form",function(t){setTimeout(function(){p._controls[0].disable(!p.allowEmptyRequest()&&!p.inputs().some(function(t){return-1!==t._class.indexOf("WidgetArray")?t.content().some(function(t){return t.hasValue()}):t.hasValue()}))},100)})})})}),a.exit().remove(),this.tfoot.style("display",this.showSubmit()?"table-footer-group":"none"),this.btntd.attr("colspan",2*this._maxCols),this.allowEmptyRequest()||setTimeout(function(){p._controls[0].disable(!p.allowEmptyRequest()&&!p.inputs().some(function(t){return-1!==t._class.indexOf("WidgetArray")?t.content().some(function(t){return t.hasValue()}):t.hasValue()}))},100)},a.prototype.exit=function(t,n){this.inputs_reset(),this._controls.forEach(function(t){t.target(null)}),e.prototype.exit.apply(this,arguments)},a.prototype.click=function(t){console.log("Clicked Submit: "+JSON.stringify(t))},a}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Radio",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_Radio=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_Radio",o.prototype["implements"](n.prototype),o.prototype.publish("selectOptions",[],"array","Array of options used to fill a dropdown list"),o.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments);var o=this,i=n.append("ul");this.selectOptions().length||this.selectOptions().push(""),this.selectOptions().forEach(function(t,e){o._inputElement[e]=i.append("li").append("input").attr("type","radio"),o._inputElement[e].node().insertAdjacentHTML("afterend","<text>"+t+"</text>")}),this._inputElement.forEach(function(t,e){t.attr("name",o.name()),t.on("click",function(t){t.click(t)}),t.on("blur",function(t){t.blur(t)}),t.on("change",function(e){o.value([t.property("value")]),e.change(e)})})},o.prototype.update=function(t,n){e.prototype.update.apply(this,arguments);var o=this;this._inputElement.forEach(function(t,e){t.property("value",o.selectOptions()[e]),-1!==o.value().indexOf(o.selectOptions()[e])&&"false"!==o.value()?t.property("checked",!0):t.property("checked",!1)})},o}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Range",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_Range=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_Range",o.prototype["implements"](n.prototype),o.prototype.publish("type","text","set","Input type",["html-color","number","checkbox","button","select","textarea","date","text","range","search","email","time","datetime"]),o.prototype.publish("selectOptions",[],"array","Array of options used to fill a dropdown list"),o.prototype.publish("low",null,"number","Minimum value for Range input"),o.prototype.publish("high",null,"number","Maximum value for Range input"),o.prototype.publish("step",null,"number","Step value for Range input"),o.prototype.enter=function(n,o){e.prototype.enter.apply(this,arguments);var i=this;this._inputElement[0]=o.append("input").attr("type","range"),this._inputElement[1]=o.append("input").attr("type","number"),this._inputElement.forEach(function(e,n){e.attr("name",i.name()),e.on("click",function(t){t.click(t)}),e.on("blur",function(t){t.blur(t)}),e.on("change",function(e){0===n?(i._inputElement[1].property("value",t.rgb(i._inputElement[0].property("value")).toString()),i.value(i._inputElement[0].property("value"))):(i._inputElement[0].property("value",i._inputElement[1].property("value")),i.value(t.rgb(i._inputElement[1].property("value")).toString())),e.change(e)})})},o.prototype.update=function(t,n){e.prototype.update.apply(this,arguments),this._inputElement[0].attr("type","range"),this._inputElement[0].property("value",this.value()),this._inputElement[0].attr("min",this.low()),this._inputElement[0].attr("max",this.high()),this._inputElement[0].attr("step",this.step()),this._inputElement[1].attr("type","number"),this._inputElement[1].property("value",this.value()),this._inputElement[1].attr("min",this.low()),this._inputElement[1].attr("max",this.high()),this._inputElement[1].attr("step",this.step())},o.prototype.insertSelectOptions=function(t){var e="";t.length>0?t.forEach(function(t){var n=t instanceof Array?t[0]:t,o=t instanceof Array?t[1]?t[1]:t[0]:t;e+="<option value='"+n+"'>"+o+"</option>"}):e+="<option>selectOptions not set</option>",this._inputElement[0].html(e)},o}),function(t,e){"function"==typeof define&&define.amd?define("src/form/Select",["d3","../common/HTMLWidget","../api/IInput","css!./Input"],e):t.form_Select=e(t.d3,t.common_HTMLWidget,t.api_IInput)}(this,function(t,e,n){function o(){e.call(this),n.call(this),this._tag="div",this._inputElement=[]}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" form_Select",o.prototype["implements"](n.prototype),o.prototype.publish("selectOptions",[],"array","Array of options used to fill a dropdown list"),o.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments);var o=this;this._inputElement[0]=n.append("select").attr("name",this.name()).on("click",function(t){t.click(t)}).on("blur",function(t){t.blur(t)}).on("change",function(t){o.value([o._inputElement[0].property("value")]),t.change(t)})},o.prototype.update=function(t,n){e.prototype.update.apply(this,arguments),this.insertSelectOptions(this.selectOptions()),this._inputElement[0].property("value",this.value())},o.prototype.insertSelectOptions=function(t){var e="";t.length>0?t.forEach(function(t){var n=t instanceof Array?t[0]:t,o=t instanceof Array?t[1]?t[1]:t[0]:t;e+="<option value='"+n+"'>"+o+"</option>"}):e+="<option>selectOptions not set</option>",this._inputElement[0].html(e)},o}),function(t,e){"function"==typeof define&&define.amd?define("src/form/TextArea",["d3","./Input"],e):t.form_TextArea=e(t.d3,t.form_Input)}(this,function(t,e){function n(){e.call(this),this._tag="div",this.type("textarea")}return n.prototype=Object.create(e.prototype),n.prototype.constructor=n,n.prototype._class+=" form_TextArea",n.prototype.publish("rows",null,"number","Rows",null,{optional:!0}),n.prototype.publish("cols",null,"number","Columns",null,{optional:!0}),n.prototype.publish("wrap","off","set","Wrap",["off","on"]),n.prototype.publish("minHeight",null,"number","Minimum Height",null,{optional:!0}),n.prototype.publish("spellcheck",null,"boolean","Input spell checking",{optional:!0}),n.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments)},n.prototype.calcHeight=function(){return Math.max(this.minHeight_exists()?this.minHeight():0,this.height())},n.prototype.update=function(t,n){e.prototype.update.apply(this,arguments),this._inputElement[0].attr("rows",this.rows()).attr("cols",this.cols()).attr("wrap",this.wrap()).attr("spellcheck",this.spellcheck()).style("height",this.calcHeight()+"px")},n}),function(t){var e=document,n="appendChild",o="styleSheet",i=e.createElement("style");i.type="text/css",e.getElementsByTagName("head")[0][n](i),i[o]?i[o].cssText=t:i[n](e.createTextNode(t))}(".form_Input button,.form_Input input,.form_Input select,.form_Input textarea{padding:2px}.form_Input button{cursor:pointer}.form_Input input.color-text{width:120px}.form_Input input.color-text+input{width:57px;position:absolute}.form_Input input[type=textbox],.form_Input textarea{width:100%;box-sizing:border-box;display:block}.form_Input ul{list-style-type:none;float:left;padding:0;margin:0}.form_Input li{float:left;list-style-position:inside}.form_Slider text{color:#000}.form_Slider .axis{-webkit-user-select:none;-moz-user-select:none;user-select:none}.form_Slider .axis .domain{stroke:#d3d3d3;stroke-width:10px;stroke-linecap:round}.form_Slider .axis .halo{fill:none;stroke:#ddd;stroke-width:8px;stroke-linecap:round}.form_Slider .extent{fill:#fff;opacity:.5}.form_Slider .handle{fill:#fff;stroke:#bbb;stroke-opacity:.5;stroke-width:1px;pointer-events:none}.form_Slider .common_Icon .common_Widget .common_Shape{fill:#ccc;stroke:#bbb}.form_Slider .common_Icon:hover{cursor:pointer}.form_Slider .common_Icon:hover .common_Widget .common_Shape{stroke:#aaa}.form_Form{color:#404040}.form_Form tbody td{white-space:nowrap;border:1px solid #e5e5e5}.form_Form td.prompt{padding:5px;vertical-align:top;background-color:#e5e5e5}.form_Form td.input{padding:5px;width:100%;vertical-align:middle}.form_Form tfoot button{margin:5px}.form_Form tbody tr:hover{background-color:#fafafa}"),define("hpcc-viz-form",function(){});