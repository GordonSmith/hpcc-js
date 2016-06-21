"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "grid-list"], factory);
    }
}(this, function (d3, GridList) {
    var gridSize = 100;
    var gutter = 2;
    var lanes = 10;
    var items = [
        { w: 1, h: 1, x: 0, y: 0 },
        { w: 1, h: 1, x: 0, y: 1 },
        { w: 3, h: 1, x: 0, y: 2 },
        { w: 2, h: 2, x: 0, y: 3 },
        { w: 2, h: 1, x: 1, y: 0 },
        { w: 1, h: 1, x: 1, y: 1 },
        { w: 1, h: 6, x: 3, y: 0 },
        { w: 1, h: 1, x: 4, y: 0 },
        { w: 2, h: 1, x: 4, y: 1 },
        { w: 1, h: 1, x: 4, y: 2 },
        { w: 1, h: 1, x: 4, y: 3 },
        { w: 1, h: 1, x: 5, y: 0 },
        { w: 1, h: 2, x: 5, y: 2 },
        { w: 1, h: 1, x: 6, y: 0 }
    ];
    items.forEach(function (item, idx) { item.id = idx; });

    var surface = d3.select("#surface");
    var gridList = null;
    var dragItem = null;
    var dragItemSize = null;
    var drag = d3.behavior.drag()
        .origin(function (d) { return { x: d.x * gridSize, y: d.y * gridSize }; })
        .on("dragstart", function (d) {
            gridList = new GridList(items, {
                direction: "horizontal",
                lanes: lanes
            });
            dragItem = surface.append("div")
                .attr("class", "dragging")
                .style("transform", function () { return "translate(" + d.x * gridSize + "px, " + d.y * gridSize + "px)"; })
                .style("width", function () { return d.w * gridSize - gutter + "px"; })
                .style("height", function () { return d.h * gridSize - gutter + "px"; })
            ;
        })
        .on("drag", function (d) {
            var pos = [Math.max(0, Math.floor((d3.event.x + gridSize / 2) / gridSize)), Math.max(0, Math.floor((d3.event.y + gridSize / 2) / gridSize))];
            if (pos[0] + d.w > lanes) {
                pos[0] = d.w - lanes;
            }
            if (pos[1] + d.h > lanes) {
                pos[1] = d.h - lanes;
            }
            if (d.x !== pos[0] || d.y !== pos[1]) {
                gridList.moveItemToPosition(d, pos);
                render();
            }
            dragItem
                .style("transform", function () { return "translate(" + d3.event.x + "px, " + d3.event.y + "px)"; })
                .style("width", function () { return d.w * gridSize + "px"; })
                .style("height", function () { return d.h * gridSize + "px"; })
            ;
        })
        .on("dragend", function (d) {
            gridList = null;
            dragItem.remove();
            dragItem = null;
        })
    ;
    var resizeDrag = d3.behavior.drag()
        .origin(function (d) { return { x: (d.x + d.w - 1) * gridSize, y: (d.y + d.h - 1) * gridSize }; })
        .on("dragstart", function (d) {
            d3.event.sourceEvent.stopPropagation()
            gridList = new GridList(items, {
                direction: "horizontal",
                lanes: lanes
            });
            dragItem = surface.append("div")
                .attr("class", "resizing")
                .style("transform", function () { return "translate(" + d.x * gridSize + "px, " + d.y * gridSize + "px)"; })
                .style("width", function () { return d.w * gridSize - gutter + "px"; })
                .style("height", function () { return d.h * gridSize - gutter + "px"; })
            ;
            dragItemSize = {
                x: d.x,
                y: d.y,
                w: d.w,
                h: d.h
            };
        })
        .on("drag", function (d) {
            d3.event.sourceEvent.stopPropagation()
            var pos = [Math.max(0, Math.round(d3.event.x / gridSize)), Math.max(0, Math.round(d3.event.y / gridSize))];
            var size = {
                w: Math.max(1, pos[0] - d.x + 1),
                h: Math.max(1, pos[1] - d.y + 1)
            };
            if (d.w !== size.w || d.h !== size.h) {
                gridList.resizeItem(d, size);
                render();
            }
            dragItem
                .style("width", function () { return (-dragItemSize.x + 1) * gridSize + d3.event.x - gutter + "px"; })
                .style("height", function () { return (-dragItemSize.y + 1) * gridSize + d3.event.y - gutter + "px"; })
            ;
        })
        .on("dragend", function (d) {
            d3.event.sourceEvent.stopPropagation()
            gridList = null;
            dragItem.remove();
            dragItem = null;
        })
    ;
    render();

    function render() {
        var divItems = surface.selectAll(".draggable").data(items, function (d) { return d.id; });
        divItems.enter().append("div")
            .attr("class", "draggable")
            .call(drag)
            .append("div")
                .attr("class", "resizeHandle")
                .call(resizeDrag)
        ;
        divItems.transition().duration(100)
            .style("left", function (d) { return d.x * gridSize + "px"; })
            .style("top", function (d) { return d.y * gridSize + "px"; })
            .style("width", function (d) { return d.w * gridSize - gutter + "px"; })
            .style("height", function (d) { return d.h * gridSize - gutter + "px"; })
        ;
        divItems.exit()
            .remove()
        ;
    }

    return {
    };
}));