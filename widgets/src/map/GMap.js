(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3/d3", "../common/D3Widget", "../common/Surface", "../graph/Graph", "../graph/Vertex", "../graph/Edge", "async!http://maps.google.com/maps/api/js?sensor=false"], factory);
    } else {
        root.GMap = factory(root.d3, root.D3Widget, root.Surface, root.GraphWidget, root.Vertex, root.Edge);
    }
}(this, function (d3, D3Widget, Surface, GraphWidget, Vertex, Edge, HipieDDL) {
    function GMap(target) {
        GraphWidget.call(this);
        this._class = "GMap";
    };
    GMap.prototype = Object.create(GraphWidget.prototype);

    GMap.prototype.enter = function (domNode, element, d) {
        GraphWidget.prototype.enter.call(this, domNode, element, d);

        this._googleMap = new google.maps.Map(d3.select(this._target).node(), {
            zoom: 3,
            center: new google.maps.LatLng(41.850033, -87.6500523),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        this._gmOverlay = new google.maps.OverlayView();

        var context = this;
        this._gmOverlay.onAdd = function () {
            context.layer = d3.select(this.getPanes().overlayLayer).append("div")
                .attr("class", "gmapLayer")
            ;
            context.layer.node().appendChild(context._parentElement.node());

            context._gmOverlay.draw = function () {
                var overlayProjection = context._gmOverlay.getProjection();

                var bounds_ = context._googleMap.getBounds();
                var sw = overlayProjection.fromLatLngToDivPixel(bounds_.getSouthWest());
                var ne = overlayProjection.fromLatLngToDivPixel(bounds_.getNorthEast());

                var div = context.layer.node();
                div.style.left = sw.x + 'px';
                div.style.top = ne.y + 'px';
                div.style.width = (ne.x - sw.x) + 'px';
                div.style.height = (sw.y - ne.y) + 'px';

                if (!context.firstRun) {
                    context.firstRun = true;
                    setTimeout(function () {
                        context.calcLatLong(sw.x, ne.y);
                    }, 100);
                } else {
                    context.calcLatLong(sw.x, ne.y);
                }
            };
            google.maps.event.addListener(context._googleMap, 'center_changed', function () {
                context._gmOverlay.draw();
            });
        };
        this._gmOverlay.setMap(this._googleMap);
    };

    GMap.prototype.calcLatLong = function (dx, dy) {
        var projection = this._gmOverlay.getProjection();

        var context = this;
        this.graphData.nodeValues().forEach(function (item) {
            var pos = new google.maps.LatLng(item._data.geo_lat, item._data.geo_long);
            pos = projection.fromLatLngToDivPixel(pos);
            pos.x -= dx;
            pos.y -= dy;
            item.pos(pos);
        });
        this.graphData.edgeValues().forEach(function (item) {
            item.points([]);
        })
    };

    return GMap;
}));
