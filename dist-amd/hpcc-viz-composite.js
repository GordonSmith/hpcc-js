define("css!src/composite/Dermatology",[],function(){}),function(t,e){"function"==typeof define&&define.amd?define("src/composite/Dermatology",["../layout/Border","../layout/Toolbar","../layout/Grid","../form/OnOff","../form/Button","../common/Icon","../other/PropertyEditor","css!./Dermatology"],e):t.composite_Dermatology=e(t.layout_Border,t.layout_Toolbar,t.layout_Grid,t.form_OnOff,t.form_Button,t.common_Icon,t.other_PropertyEditor)}(this,function(t,e,o,i,n,r,a){function s(){t.call(this),this._toolbar=(new e).title("Dermatology"),this._propEditor=(new a).show_settings(!0)}return s.prototype=Object.create(t.prototype),s.prototype.constructor=s,s.prototype._class+=" composite_Dermatology",s.prototype.publish("showToolbar",!0,"boolean","Show Toolbar"),s.prototype.publish("widget",null,"widget","Widget"),s.prototype.showProperties=function(t){if(!arguments.length)return this._showProperties;this._showProperties=t,this.rightPercentage(0).rightSize(this._showProperties?360:0).setContent("right",this._showProperties?this._propEditor:null);var e=this.widget();return e&&e.designMode&&e.designMode(this._showProperties),this},s.prototype.toggleProperties=function(){return this.showProperties(!this.showProperties())},s.prototype.enter=function(e,o){t.prototype.enter.apply(this,arguments),this.topPercentage(0).topSize(0).setContent("top",this._toolbar),this.getCell("top").surfaceShadow(!0);var n=this;this._propsButton=(new i).id(this.id()+"_props").value("Properties").on("click",function(){n.toggleProperties().render()}),this._toolbar.widgets([this._propsButton])},s.prototype.update=function(e,o){t.prototype.update.apply(this,arguments);var i=this.widget();o.style("background-color",i&&i.surfaceShadow?null:"white"),this.topPercentage(0).topSize(this.showToolbar()?32:0)},s.prototype.render=function(e){var o=this.widget();return o!==this._prevWidget&&(o&&o.surfaceShadow&&o.surfaceBackgroundColor_default("white"),this.setContent("center",o),this._propEditor.widget(o),this._prevWidget=o),t.prototype.render.apply(this,arguments)},s}),define("css!src/composite/MegaChart",[],function(){}),function(t,e){"function"==typeof define&&define.amd?define("src/composite/MegaChart",["d3","../layout/Border","../chart/MultiChart","../common/Text","../other/Legend","../layout/Toolbar","../form/Select","../form/Button","../form/Input","../common/Utility","../other/Html","css!./MegaChart"],e):t.composite_MegaChart=e(t.d3,t.layout_Border,t.chart_MultiChart,t.common_Text,t.other_Legend,t.layout_Toolbar,t.form_Select,t.form_Button,t.form_Input,t.common_Utility,t.other_Html)}(this,function(t,e,o,i,n,r,a,s,l,p,h){function c(){e.call(this),this._tag="div",this._chart=new o;var t=this;this._chart.click=function(){t.click.apply(t,arguments)},this._chart.dblclick=function(){t.dblclick.apply(t,arguments)},this._chart.vertex_click=function(){t.vertex_click.apply(t,arguments)},this._chart.vertex_dblclick=function(){t.vertex_dblclick.apply(t,arguments)},this._chart.edge_click=function(){t.edge_click.apply(t,arguments)},this._chart.edge_dblclick=function(){t.edge_dblclick.apply(t,arguments)},this._toolbar=new r,this._valueTitle=new i,this._domainTitle=new i,this._legend=new n}return c.prototype=Object.create(e.prototype),c.prototype.constructor=c,c.prototype._class+=" composite_MegaChart",c.prototype._1DChartTypes=o.prototype._1DChartTypes,c.prototype._2DChartTypes=o.prototype._2DChartTypes,c.prototype._NDChartTypes=o.prototype._NDChartTypes,c.prototype._anyChartTypes=o.prototype._anyChartTypes,c.prototype._allChartTypes=o.prototype._allChartTypes,c.prototype.publishReset(),c.prototype.publish("showToolbar",!0,"boolean","Enable/Disable Toolbar widget",null,{tags:["Basic"]}),c.prototype.publishProxy("title","_toolbar","title"),c.prototype.publish("ddlParamsFormat","","string","DDL Param Format '{fname}, {lname}'",null,{tags:["Advanced"],optional:!0}),c.prototype.publish("titleFontSize",null,"number","Title Font Size (px)",null,{tags:["Advanced"],optional:!0}),c.prototype.publish("titleFontColor",null,"html-color","Title Font Color",null,{tags:["Advanced"],optional:!0}),c.prototype.publish("titleFontFamily",null,"string","Title Font Family",null,{tags:["Advanced"],optional:!0}),c.prototype.publish("titleFontBold",!0,"boolean","Enable Bold Title Font",null,{tags:["Advanced"],optional:!0}),c.prototype.publish("titleBackgroundColor",null,"html-color","Background Color",null,{tags:["Intermediate"],optional:!0}),c.prototype.publish("maximizedBackgroundColor","#FFFFFF","html-color","Background Color while maximized",null,{tags:["Intermediate"],optional:!0}),c.prototype.publish("showChartSelect",!0,"boolean","Show/Hide the chartType dropdown in the toolbar",null,{tags:["Basic"]}),c.prototype.publish("showCSV",!0,"boolean","Show/Hide CSV button",null,{tags:["Basic"]}),c.prototype.publish("showCount",!1,"boolean","Show/Hide Data Count",null,{tags:["Basic"]}),c.prototype.publish("showMaximize",!1,"boolean","Show/Hide Maximize button",null,{tags:["Basic"]}),c.prototype.publish("toolbarShowLegend",!1,"boolean","Show/Hide Legend button",null,{tags:["Basic"]}),c.prototype.publish("showInfoButton",!1,"boolean","Show/Hide Info button in toolbar",null,{tags:["Basic"]}),c.prototype.publish("infoIcon","","string","Help Icon",null,{tags:["Basic"]}),c.prototype.publish("legendPosition","none","set","Position of the Legend widget",["none","top","right","bottom","left"],{tags:["Basic"]}),c.prototype.publishProxy("legendFormat","_legend","rainbowFormat"),c.prototype.publishProxy("legendBins","_legend","rainbowBins"),c.prototype.publishProxy("domainAxisTitle","_domainTitle","text"),c.prototype.publishProxy("valueAxisTitle","_valueTitle","text"),c.prototype.publishProxy("chartType","_chart","chartType"),c.prototype.publishProxy("chart","_chart","chart"),c.prototype.toolbarWidgets=function(t){return arguments.length?(this._toolbar.widgets(t),this):this._toolbar.widgets()},c.prototype.chartTypeDefaults=function(t){return arguments.length?(this._chart.chartTypeDefaults(t),this):this._chart.chartTypeDefaults()},c.prototype.chartTypeProperties=function(t){return arguments.length?(this._chart.chartTypeProperties(t),this):this._chart.chartTypeProperties()},c.prototype.fields=function(t){return arguments.length?(this._chart.fields(t),this):this._chart.fields()},c.prototype.columns=function(t,e){return arguments.length?(this._chart.columns(t,e),this):this._chart.columns()},c.prototype.data=function(t){return arguments.length?(this._chart.data(t),this):this._chart.data()},c.prototype.downloadCSV=function(){return p.downloadBlob("CSV",this._chart["export"]("CSV")),this},c.prototype.enter=function(o,i){e.prototype.enter.apply(this,arguments);var n=this;this.topShrinkWrap(!1).topPercentage(0).topSize(30),this._dataCount=(new h).classed({"composite_MegaChart-dataCount":!0}).id(this.id()+"_dataCount").html('<span class="MegaChart-dataCount-label">Count:</span>&nbsp;<span class="MegaChart-dataCount-value">'+(this.data()?this.data().length:"0")+"</span>").overflowX("visible").overflowY("visible"),this._csvButton=(new s).classed({"composite_MegaChart-CSV":!0}).id(this.id()+"_csv").value("CSV"),this._csvButton.click=function(t){n.downloadCSV()},this._infoButton=(new s).classed({"composite_MegaChart-Info":!0}).id(this.id()+"_info").value(this.infoIcon()),this._maximizeButton=(new s).classed({"composite_MegaChart-Maximize":!0}).id(this.id()+"_maximize").value(""),this._maximizeButton.click=function(e){var o=n.target(),i=o,r=t.select(o).classed("__hpccisMaximized"),a=n.locateAncestor("layout_Grid");i=a?a.element().node():document.body;var s=t.select(n.target());if(r){var l=o.parentElement.getBoundingClientRect(),p=parseInt(getComputedStyle(o,null).getPropertyValue("padding-top").replace("px","")),h=parseInt(getComputedStyle(o,null).getPropertyValue("padding-left").replace("px","")),c=parseInt(getComputedStyle(o,null).getPropertyValue("padding-right").replace("px","")),d=parseInt(getComputedStyle(o,null).getPropertyValue("padding-bottom").replace("px",""));n.contentDiv.style("opacity",0).transition(100),s.transition().style({top:l.top+"px",left:l.left+"px",width:l.width-h-c+"px",height:l.height-p-d+"px"}).each("end",function(){s.style({position:o.__old_position,"z-index":o.__old_zindex,"background-color":o.__old_backgroundColor,"box-shadow":o.__old_boxshadow}),n.resize({width:l.width-h-c,height:l.height-p-d}).render(function(){n.contentDiv.transition().style("opacity",1)}),e.value("").render()})}else{o.__old_position=o.style.position,o.__old_zindex=o.style.zIndex,o.__old_boxshadow=o.style.boxShadow,o.__old_backgroundColor=n.element().style("background-color");var u=t.select(i).datum(),g=u.target(),y=u?g.getBoundingClientRect():i.getBoundingClientRect(),_=parseInt(getComputedStyle(g,null).getPropertyValue("padding-top").replace("px","")),m=parseInt(getComputedStyle(g,null).getPropertyValue("padding-left").replace("px","")),f=parseInt(getComputedStyle(g,null).getPropertyValue("padding-right").replace("px","")),b=parseInt(getComputedStyle(g,null).getPropertyValue("padding-bottom").replace("px",""));n.contentDiv.style("opacity",0).transition(100),s.style({position:"fixed","z-index":999999,"box-shadow":"0 8px 8px 0 rgba(0,0,0,.14),0 12px 4px -8px rgba(0,0,0,.2),0 4px 20px 0 rgba(0,0,0,.12)","background-color":o.__old_backgroundColor}).transition().style({top:y.top+_+"px",left:y.left+m+"px",width:y.width-m-f+"px",height:y.height-_-b+"px"}).each("end",function(){s.style({"background-color":n.maximizedBackgroundColor()}),n.resize({width:y.width-m-f,height:y.height-_-b}).render(function(){n.contentDiv.transition().style("opacity",1)}),e.value("").render()})}t.select(o).classed("__hpccisMaximized",!r)},this._legendButton=(new l).classed({"composite_MegaChart-legend":!0}).id(this.id()+"_legend").type("checkbox").inlineLabel("Legend:  "),this._legendButton.click=function(t){n.render()},this._chartTypeSelect=(new a).classed({"composite_MegaChart-chartType":!0}).id(this.id()+"_chartType").selectOptions(this._allChartTypes.map(function(t){return[t.id,t.display]})).value(this.chartType()),this._chartTypeSelect.change=function(t){n.chartType(t.value()).render()},this.setContent("center",this._chart),this._legend.fixedSize(!0).targetWidget(this._chart).orientation(-1!==["top","bottom"].indexOf(this.legendPosition())?"horizontal":"vertical"),this._prevLegendPosition=this.legendPosition(),this.valueAxisTitle()&&this.setContent("left",this._valueTitle.rotation(-90)).leftShrinkWrap(!0),this.domainAxisTitle()&&this.setContent("bottom",this._domainTitle).bottomShrinkWrap(!0),"none"!==this.legendPosition()&&this.setContent(this.legendPosition(),this._legend)[this.legendPosition()+"ShrinkWrap"](!0)},c.prototype.update=function(t,o){function i(t,e,o){if(o&&-1===t.indexOf(e))t.push(e);else if(!o){var i=t.indexOf(e);i>=0&&t.splice(i,1)}}this._dataCount.html('<span class="MegaChart-dataCount-label">Count:</span>&nbsp;<span class="MegaChart-dataCount-value">'+(this.data()?this.data().length:"0")+"</span>"),this._chartTypeSelect.value(this.chartType());var r=this.toolbarWidgets();i(r,this._csvButton,this.showCSV()),i(r,this._maximizeButton,this.showMaximize()),i(r,this._legendButton,this.toolbarShowLegend()),i(r,this._chartTypeSelect,this.showChartSelect()),i(r,this._infoButton,this.showInfoButton()),i(r,this._dataCount,this.showCount()),this.toolbarWidgets(r),this._prevShowToolbar!==this.showToolbar()&&(this.setContent("top",this.showToolbar()?this._toolbar:null),this._prevShowToolbar=this.showToolbar()),this._toolbar.fontSize(this.titleFontSize()).fontColor(this.titleFontColor()).fontFamily(this.titleFontFamily()).fontBold(this.titleFontBold()).backgroundColor(this.titleBackgroundColor()),this._chart.data(this.data()),this._chart.chartType()!==this.chartType()&&this._chart.chartType(this.chartType());var a=this.legendPosition();this.toolbarShowLegend()&&!this._legendButton.checked()&&(a="none"),this._prevLegendPosition!==a&&("none"!==this._prevLegendPosition&&this.clearContent(this._prevLegendPosition),this._prevLegendPosition=a,"none"!==a&&(this._legend=(new n).fixedSize(!0).targetWidget(this.getContent("center")),this.setContent(a,this._legend),this._legend.orientation(-1!==["top","bottom"].indexOf(a)?"horizontal":"vertical"))),this._contentClasses=this.getContentClasses(),this.valueAxisTitle()&&"common_Text"!==this._contentClasses.left&&"left"!==a&&this.setContent("left",this._valueTitle.rotation(-90)),this.domainAxisTitle()&&"common_Text"!==this._contentClasses.bottom&&"bottom"!==a&&this.setContent("bottom",this._domainTitle).bottomShrinkWrap(!0),this._legend.dataFamily(this._chart.getChartDataFamily()),e.prototype.update.apply(this,arguments)},c.prototype.exit=function(t,o){e.prototype.exit.apply(this,arguments)},c.prototype.getContentClasses=function(){var t={},e=this.getContent("top"),o=this.getContent("right"),i=this.getContent("bottom"),n=this.getContent("left");return t.top=null!==e?e.classID():void 0,t.right=null!==o?o.classID():void 0,t.bottom=null!==i?i.classID():void 0,t.left=null!==n?n.classID():void 0,t},c.prototype.serializeState=function(){var t={title:this.title(),data:this.data()},e=this.chart();return e&&e.serializeState&&(t.chart=e.serializeState(),delete t.chart.data),t},c.prototype.deserializeState=function(t){if(t){this.title(t.title).data(t.data);var e=this.chart();e&&t.chart&&e.serializeState&&e.deserializeState(t.chart)}return this},c.prototype.click=function(t,e,o){console.log("Click:  "+JSON.stringify(t)+", "+e+", "+o)},c.prototype.dblclick=function(t,e,o){console.log("Double click:  "+JSON.stringify(t)+", "+e+", "+o)},c.prototype.vertex_click=function(t,e,o,i){i&&i.vertex&&console.log("Vertex click: "+i.vertex.id())},c.prototype.vertex_dblclick=function(t,e,o,i){i&&i.vertex&&console.log("Vertex double click: "+i.vertex.id())},c.prototype.edge_click=function(t,e,o,i){i&&i.edge&&console.log("Edge click: "+i.edge.id())},c.prototype.edge_dblclick=function(t,e,o,i){i&&i.edge&&console.log("Edge double click: "+i.edge.id())},c}),function(t){var e=document,o="appendChild",i="styleSheet",n=e.createElement("style");n.type="text/css",e.getElementsByTagName("head")[0][o](n),n[i]?n[i].cssText=t:n[o](e.createTextNode(t))}(".composite_Dermatology{background-color:#f8f8ff}.composite_Dermatology .common_Icon{background-color:red;opacity:.75}.composite_Dermatology .common_Icon .common_Shape{fill:#fff;stroke:#a9a9a9;cursor:pointer}.composite_Dermatology .common_Icon.show .common_Shape{fill:#d3d3d3}.composite_Dermatology .common_Icon .common_FAChar .common_Text{fill:#a9a9a9;cursor:pointer}.composite_Dermatology .other_PropertyEditor{font-family:sans-serif;font-size:11px}.composite_Dermatology .other_PropertyEditor input{font-family:sans-serif;font-size:11px;border:0}.composite_Dermatology .other_PropertyEditor .property-label{height:unset}.composite_MegaChart-Info,.composite_MegaChart-Info *,.composite_MegaChart-Maximize,.composite_MegaChart-Maximize *{font-family:FontAwesome}"),define("hpcc-viz-composite",function(){});