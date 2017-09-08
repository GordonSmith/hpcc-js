// (c) 2008 David Troy

!function(t,n){"function"==typeof define&&define.amd?define(["d3"],n):t.map_Utility=n(t.d3)}(this,function(t){function n(){}n.prototype.constructor=n,n.prototype._class+=" map_Geohash",n.prototype.base32="0123456789bcdefghjkmnpqrstuvwxyz",n.prototype.encode=function(t,n,e){if("undefined"==typeof e){for(var r=1;12>=r;r++){var a=this.encode(t,n,r),o=this.decode(a);if(o.lat===t&&o.lon===n)return a}e=12}if(t=Number(t),n=Number(n),e=Number(e),isNaN(t)||isNaN(n)||isNaN(e))throw new Error("Invalid geohash");for(var i=0,s=0,c=!0,l="",h=-90,u=90,p=-180,f=180;l.length<e;){if(c){var d=(p+f)/2;n>d?(i=2*i+1,p=d):(i=2*i,f=d)}else{var g=(h+u)/2;t>g?(i=2*i+1,h=g):(i=2*i,u=g)}c=!c,5===++s&&(l+=this.base32.charAt(i),s=0,i=0)}return l},n.prototype.decode=function(t){var n=this.bounds(t),e=n.sw.lat,r=n.sw.lon,a=n.ne.lat,o=n.ne.lon,i=(e+a)/2,s=(r+o)/2;return i=i.toFixed(Math.floor(2-Math.log(a-e)/Math.LN10)),s=s.toFixed(Math.floor(2-Math.log(o-r)/Math.LN10)),{lat:Number(i),lon:Number(s)}},n.prototype.bounds=function(t){if(0===t.length)throw new Error("Invalid geohash");t=t.toLowerCase();for(var n=!0,e=-90,r=90,a=-180,o=180,i=0;i<t.length;i++){var s=t.charAt(i),c=this.base32.indexOf(s);if(-1===c)throw new Error("Invalid geohash");for(var l=4;l>=0;l--){var h=c>>l&1;if(n){var u=(a+o)/2;1===h?a=u:o=u}else{var p=(e+r)/2;1===h?e=p:r=p}n=!n}}var f={sw:{lat:e,lon:a},ne:{lat:r,lon:o}};return f},n.prototype.adjacent=function(t,n){if(t=t.toLowerCase(),n=n.toLowerCase(),0===t.length)throw new Error("Invalid geohash");if(-1==="nsew".indexOf(n))throw new Error("Invalid direction");var e={n:["p0r21436x8zb9dcf5h7kjnmqesgutwvy","bc01fg45238967deuvhjyznpkmstqrwx"],s:["14365h7k9dcfesgujnmqp0r2twvyx8zb","238967debc01fg45kmstqrwxuvhjyznp"],e:["bc01fg45238967deuvhjyznpkmstqrwx","p0r21436x8zb9dcf5h7kjnmqesgutwvy"],w:["238967debc01fg45kmstqrwxuvhjyznp","14365h7k9dcfesgujnmqp0r2twvyx8zb"]},r={n:["prxz","bcfguvyz"],s:["028b","0145hjnp"],e:["bcfguvyz","prxz"],w:["0145hjnp","028b"]},a=t.slice(-1),o=t.slice(0,-1),i=t.length%2;return-1!==r[n][i].indexOf(a)&&""!==o&&(o=this.adjacent(o,n)),o+this.base32.charAt(e[n][i].indexOf(a))},n.prototype.neighbours=function(t){return{n:this.adjacent(t,"n"),ne:this.adjacent(this.adjacent(t,"n"),"e"),e:this.adjacent(t,"e"),se:this.adjacent(this.adjacent(t,"s"),"e"),s:this.adjacent(t,"s"),sw:this.adjacent(this.adjacent(t,"s"),"w"),w:this.adjacent(t,"w"),nw:this.adjacent(this.adjacent(t,"n"),"w")}},n.prototype.contained=function(t,n,e,r,a){(isNaN(n)||n>=90)&&(n=89),(isNaN(e)||e>180)&&(e=180),(isNaN(r)||-90>=r)&&(r=-89),(isNaN(t)||-180>t)&&(t=-180),a=a||1;for(var o=this.encode(n,t,a),i=this.encode(n,e,a),s=this.encode(r,e,a),c=o,l=0,h=-1,u=[o,s],p=this.adjacent(o,"e");p!==s;)u.push(p),++l,p===i||h===l?(h=l+1,l=0,p=this.adjacent(c,"s"),c=p):p=this.adjacent(p,"e");return u},n.prototype.calculateWidthDegrees=function(t){var n;n=t%2===0?-1:-.5;var e=180/Math.pow(2,2.5*t+n);return e},n.prototype.width=function(t){var n=t%2;return 180/(2^(5*t+n)/2-1)};var e=function(){function n(){var n=Math.max(Math.log(r)/Math.LN2-8,0),i=Math.round(n+o),s=Math.pow(2,n-i+8),c=[(a[0]-r/2)/s,(a[1]-r/2)/s],l=[],h=t.range(Math.max(0,Math.floor(-c[0])),Math.max(0,Math.ceil(e[0]/s-c[0]))),u=t.range(Math.max(0,Math.floor(-c[1])),Math.max(0,Math.ceil(e[1]/s-c[1])));return u.forEach(function(t){h.forEach(function(n){l.push([n,t,i])})}),l.translate=c,l.scale=s,l}var e=[960,500],r=256,a=[e[0]/2,e[1]/2],o=0;return n.size=function(t){return arguments.length?(e=t,n):e},n.scale=function(t){return arguments.length?(r=t,n):r},n.translate=function(t){return arguments.length?(a=t,n):a},n.zoomDelta=function(t){return arguments.length?(o=+t,n):o},n},r=function(){function n(t){var n=t[0],s=t[1];return e=null,r(n,s),e||(a(n,s),e)||(o(n,s),e)||(i(n,s),e),e}var e,r,a,o,i,s=1e-6,c=t.geo.albers(),l=t.geo.conicEqualArea().rotate([154,0]).center([-2,58.5]).parallels([55,65]),h=t.geo.conicEqualArea().rotate([157,0]).center([-3,19.9]).parallels([8,18]),u=t.geo.conicEqualArea().rotate([66,0]).center([0,18]).parallels([8,18]),p={point:function(t,n){e=[t,n]}};return n.invert=function(t){var n=c.scale(),e=c.translate(),r=(t[0]-e[0])/n,a=(t[1]-e[1])/n;return(a>=.12&&.234>a&&r>=-.425&&-.214>r?l:a>=.166&&.234>a&&r>=-.214&&-.115>r?h:a>=.204&&.234>a&&r>=.32&&.38>r?u:c).invert(t)},n.stream=function(t){var n=c.stream(t),e=l.stream(t),r=h.stream(t),a=u.stream(t);return{point:function(t,o){n.point(t,o),e.point(t,o),r.point(t,o),a.point(t,o)},sphere:function(){n.sphere(),e.sphere(),r.sphere(),a.sphere()},lineStart:function(){n.lineStart(),e.lineStart(),r.lineStart(),a.lineStart()},lineEnd:function(){n.lineEnd(),e.lineEnd(),r.lineEnd(),a.lineEnd()},polygonStart:function(){n.polygonStart(),e.polygonStart(),r.polygonStart(),a.polygonStart()},polygonEnd:function(){n.polygonEnd(),e.polygonEnd(),r.polygonEnd(),a.polygonEnd()}}},n.precision=function(t){return arguments.length?(c.precision(t),l.precision(t),h.precision(t),u.precision(t),n):c.precision()},n.scale=function(t){return arguments.length?(c.scale(t),l.scale(.35*t),h.scale(t),u.scale(t),n.translate(c.translate())):c.scale()},n.translate=function(t){if(!arguments.length)return c.translate();var e=c.scale(),f=+t[0],d=+t[1];return r=c.translate(t).clipExtent([[f-.455*e,d-.238*e],[f+.455*e,d+.238*e]]).stream(p).point,a=l.translate([f-.307*e,d+.201*e]).clipExtent([[f-.425*e+s,d+.12*e+s],[f-.214*e-s,d+.234*e-s]]).stream(p).point,o=h.translate([f-.205*e,d+.212*e]).clipExtent([[f-.214*e+s,d+.166*e+s],[f-.115*e-s,d+.234*e-s]]).stream(p).point,i=u.translate([f+.35*e,d+.224*e]).clipExtent([[f+.32*e,d+.204*e],[f+.38*e,d+.234*e]]).stream(p).point,n},n.scale(1070)};return t.geo.albersUsaPr||(t.geo.albersUsaPr=r),{Geohash:n,Tile:e,albersUsaPr:r}});