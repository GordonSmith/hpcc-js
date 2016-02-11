(function(e,t){typeof define=="function"&&define.amd?define(["d3","../layout/Tabbed","../layout/Grid","./HipieDDL","../layout/Surface","../layout/Cell"],t):e.marshaller_Tabbed=t(e.d3,e.layout_Tabbed,e.layout_Grid,e.marshaller_HipieDDL,e.layout_Surface,e.layout_Cell)})(this,function(e,t,n,r,i,s){function o(){t.call(this)}function u(e,t){t instanceof Object||t&&(t=JSON.parse(t));var n=null,i={};return e.accept({visit:function(e){e instanceof r.Dashboard?(n={dashboard:e,visualizations:[]},i[e.getQualifiedID()]=n):e instanceof r.DataSource?e.databomb&&t[e.id]&&e.comms.databomb(t[e.id]):e instanceof r.Output?e.dataSource.databomb&&e.dataSource.comms.databombOutput(e.from):e instanceof r.Visualization&&e.widget&&n.visualizations.push(e)}}),i}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.prototype._class+=" marshaller_Tabbed",o.prototype.publish("ddlUrl","","string","DDL URL",null,{tags:["Private"]}),o.prototype.publish("databomb","","string","Data Bomb",null,{tags:["Private"]}),o.prototype.publish("proxyMappings",{},"object","Proxy Mappings",null,{tags:["Private"]}),o.prototype.publish("designMode",!1,"boolean","Design Mode",null,{tags:["Basic"]}),o.prototype.testData2=function(){return this.ddlUrl("http://10.241.100.159:8002/WsEcl/submit/query/roxie/hipie_testrelavator3.ins002_service/json"),this},o.prototype._origDesignMode=o.prototype.designMode,o.prototype.designMode=function(e){var t=o.prototype._origDesignMode.apply(this,arguments);return arguments.length&&this.widgets().forEach(function(t){t.widget().designMode(e)}),t},o.prototype.render=function(i){function a(){var e=u(o.marshaller,o.databomb());if(!s.length){o.marshaller.dashboardTotal<=1&&o.showTabs(!1);for(var r in e){var a=new n;o.addTab(a,e[r].dashboard.title);var f=0,l=0,c=Math.floor(Math.sqrt(e[r].visualizations.length));e[r].visualizations.forEach(function(e,t){t&&t%c===0&&(f++,l=0),e.widget.size({width:0,height:0}),a.setContent(f,l,e.widget,e.title),l++})}}for(var h in e)for(var p in e[h].dashboard.datasources)e[h].dashboard.datasources[p].fetchData({},!0);t.prototype.render.call(o,function(e){i&&i(e)})}if(this.ddlUrl()===""||this.ddlUrl()===this._prev_ddlUrl&&this.databomb()===this._prev_databomb)return t.prototype.render.apply(this,arguments);this._prev_ddlUrl&&this._prev_ddlUrl!==this.ddlUrl()&&this.clearTabs(),this._prev_ddlUrl=this.ddlUrl(),this._prev_databomb=this.databomb();var s=[];this.widgets().forEach(function(e){s=s.concat(e.widget().content())});var o=this;return this.marshaller=(new r.Marshaller).proxyMappings(this.proxyMappings()).widgetMappings(e.map(s.map(function(e){return e.widget()}),function(e){return e.id()})).on("commsError",function(e,t){o.commsError(e,t)}),this.ddlUrl()[0]==="["||this.ddlUrl()[0]==="{"?this.marshaller.parse(this.ddlUrl(),function(){a()}):this.marshaller.url(this.ddlUrl(),function(){a()}),this},o.prototype.commsError=function(e,t){alert("Comms Error:\n"+e+"\n"+t)},o});