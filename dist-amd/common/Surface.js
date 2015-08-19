(function(e,t){typeof define=="function"&&define.amd?define(["d3","./SVGWidget","./Icon","./Shape","./Text","./FAChar","./Menu","css!./Surface"],t):e.common_Surface=t(e.d3,e.common_SVGWidget,e.common_Icon,e.common_Shape,e.common_Text,e.common_FAChar,e.common_Menu)})(this,function(e,t,n,r,i,s,o){function u(){t.call(this),this._menuPadding=2,this._icon=(new n).faChar("").paddingPercent(50),this._container=(new r).class("container").shape("rect"),this._titleRect=(new r).class("title").shape("rect"),this._text=(new i).class("title"),this._menu=(new o).paddingPercent(0);var e=this;this._menu.preShowMenu=function(){e._content&&e._content.hasOverlay()&&e._content.visible(!1)},this._menu.postHideMenu=function(){e._content&&e._content.hasOverlay()&&e._content.visible(!0)},this._showContent=!0,this._content=null,this._surfaceButtons=[]}return u.prototype=Object.create(t.prototype),u.prototype._class+=" common_Surface",u.prototype.publish("showTitle",!0,"boolean","Show Title",null,{tags:["Basic"]}),u.prototype.publish("title","","string","Title",null,{tags:["Basic"]}),u.prototype.publishProxy("titleFontSize","_text","fontSize"),u.prototype.publish("showIcon",!0,"boolean","Show Title",null,{tags:["Advance"]}),u.prototype.publishProxy("icon_faChar","_icon","faChar"),u.prototype.publishProxy("icon_shape","_icon","shape"),u.prototype.publish("content",null,"widget","Content",null,{tags:["Private"]}),u.prototype.publish("buttonAnnotations",[],"array","Button Array",null,{tags:["Intermediate"]}),u.prototype.publish("buttonGutter",25,"number","Space Between Menu and Buttons",null,{tags:["Intermediate"]}),u.prototype.menu=function(e){return arguments.length?(this._menu.data(e),this):this._menu.data()},u.prototype.showContent=function(e){return arguments.length?(this._showContent=e,this._content&&this._content.visible(this._showContent),this):this._showContent},u.prototype.testData=function(){return this.title("Hello and welcome!"),this.menu(["aaa","bbb","ccc"]),this.buttonAnnotations([{id:"button_1",label:"",shape:"square",diameter:14,padding:"0px 5px",font:"FontAwesome"},{id:"button_2",label:"",shape:"square",diameter:14,padding:"0px 5px",font:"FontAwesome"}]),this},u.prototype.enter=function(n,r){t.prototype.enter.apply(this,arguments);var i=r.append("g").attr("class","frame"),s=i.node();this._clipRect=i.append("defs").append("clipPath").attr("id",this.id()+"_clip").append("rect").attr("x",0).attr("y",0).attr("width",this._size.width).attr("height",this._size.height),this._titleRect.target(s).render().display(this.showTitle()&&this.showIcon()),this._icon.target(s).render(),this._menu.target(n),this._text.target(s),this._container.target(s),this.buttonContainer=e.select(this._target).append("div").attr("class","svg-button-container")},u.prototype.update=function(n,r){t.prototype.update.apply(this,arguments);var i=this,s=this.width()-1,o=this.height()-1;this._icon.display(this.showTitle()&&this.showIcon()).shape(this.icon_shape()).render(),this._menu.render(),this._text.text(this.title()).display(this.showTitle()).render();var u=this.buttonContainer.selectAll(".surface-button").data(this.buttonAnnotations());u.enter().append("button").attr("class","surface-button").each(function(t,n){var r=i._surfaceButtons[n]=e.select(this).attr("class","surface-button "+(t.class?t.class:"")).attr("id",t.id).style("padding",t.padding).style("width",t.width).style("height",t.height).style("cursor","pointer").on("click",function(e){i.click(e)});t.font==="FontAwesome"?r.append("i").attr("class","fa").text(function(e){return t.label}):r.text(function(e){return t.label})}),u.exit().each(function(t,n){var r=e.select(this);delete i._surfaceButtons[n],r.remove()});var a=this.showTitle()?Math.max.apply(null,this._surfaceButtons.map(function(e){return e.node().offsetHeight})):0,f=this.showTitle()&&this.showIcon()?this._icon.getBBox(!0):{width:0,height:0},l=this._text.getBBox(!0),c=this._menu.getBBox(!0),h=Math.max(f.height,l.height,c.height,a),p=this.showTitle()?h:0,d=(-o+h)/2,v=this.showTitle()?Math.max(l.height,c.height,a):0,m=p<=v?0:(p-v)/2,g=m;this._titleRect.pos({x:g,y:d}).width(s-g*2).height(v).display(this.showTitle()).render(),this._icon.move({x:-s/2+f.width/2,y:d}),this._menu.move({x:s/2-c.width/2-this._menuPadding,y:d}),this._text.move({x:(f.width/2-c.width/2)/2,y:d});var y=i._titleRect.node().getBoundingClientRect().left+(i._size.width-g*2)-i.buttonGutter()-this.buttonContainer.node().offsetWidth,b=i._titleRect.node().getBoundingClientRect().top+(v-this.buttonContainer.node().offsetHeight)/2;isNaN(y)||this.buttonContainer.style("left",y+"px"),isNaN(b)||this.buttonContainer.style("top",b+"px"),this.showTitle()?this._container.pos({x:g/2,y:p/2-m/2}).width(s-g).height(o-p+m).render():this._container.pos({x:0,y:0}).width(s).height(o).render();if(this._showContent){var w=g,E=p-m,S=r.selectAll(".content").data(this.content()?[this.content()]:[],function(e){return e._id});S.enter().append("g").attr("class","content").attr("clip-path","url(#"+this.id()+"_clip)").each(function(e){e.target(this)}),S.attr("transform","translate("+g/2+", "+(p/2-m/2)+")").each(function(e){var t={left:4,top:4,right:4,bottom:4};e.size({width:s-w-(t.left+t.right),height:o-E-(t.top+t.bottom)})}),this.content()&&this._clipRect.attr("x",-(s-w)/2).attr("y",-(o-E)/2).attr("width",s-w).attr("height",o-E),S.exit().transition().each(function(e){e.target(null)}).remove()}this._menu.element().node().parentNode.appendChild(this._menu.element().node())},u.prototype.exit=function(e,n){this.content()&&this.content().target(null),t.prototype.exit.apply(this,arguments)},u.prototype.render=function(e){this.content()||t.prototype.render.apply(this,arguments),t.prototype.render.call(this);var n=this;return this.content()&&this.content().render(function(t){e&&e(n)}),this},u.prototype.intersection=function(e,t){var n=[],r=this._icon.intersection(e,t,this._pos);r&&n.push({i:r,d:this.distance(r,t)});var i=this._titleRect.intersection(e,t);i&&n.push({i:i,d:this.distance(i,t)});var s=this._container.intersection(e,t);s&&n.push({i:s,d:this.distance(s,t)});var o=null;return n.forEach(function(e){if(o===null||o.d>e.d)o=e}),o&&o.i?o.i:null},u.prototype.click=function(e,t){console.log("Clicked: "+e.id)},u});