(function(e,t){typeof define=="function"&&define.amd?define(["./Common","../chart/I1DChart"],t):e.c3_Common1D=t(e.c3_Common,e.chart_I1DChart)})(this,function(e,t){function n(n){e.call(this),t.call(this),this._class="c3_Common1D";var r=this;this._config.color={pattern:this._palette.colors()},this._config.data.onclick=function(e,t){r.click(r.rowToObj(r._data[e.i1Dex]),e.id)},this._config.data.color=function(e,t){return r._palette(t.id?t.id:t)}}return n.prototype=Object.create(e.prototype),n.prototype.implements(t.prototype),n.prototype.publish("paletteID","default","set","Palette ID",n.prototype._palette.switch()),n.prototype.update=function(t,n){e.prototype.update.apply(this,arguments),this._palette=this._palette.switch(this._paletteID)},n});