"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "../common/HTMLWidget", "./Cell", "../common/TextBox", "../common/Utility", "css!./Dashboard"], factory);
    } else {
        root.layout_Dashboard = factory(root.d3, root.common_HTMLWidget, root.layout_Cell, root.common_TextBox, root.common_Utility);
    }
}(this, function (d3, HTMLWidget, Cell, TextBox, Utility) {
    function Dashboard() {
        HTMLWidget.call(this);

        this._tag = "div";
        
        this._colCount = 0;
        this._rowCount = 0;
        this._colSize = 0;
        this._rowSize = 0;
        this._selectionBag = new Utility.Selection();
        
        this.content([]);
    }
    Dashboard.prototype = Object.create(HTMLWidget.prototype);
    Dashboard.prototype.constructor = Dashboard;
    Dashboard.prototype._class += " layout_Dashboard";

    Dashboard.prototype.publish("designMode", false, "boolean", "Design Mode",null,{tags:["Basic"]});
    Dashboard.prototype.publish("designModeOpacity", 1, "number", "Opacity of Cells and drag handles in Design Mode",null,{tags:["Basic"]});
    Dashboard.prototype.publish("hideDragHandles", false, "boolean", "Hide Drag Handles in Design Mode",null,{tags:["Basic"]});
    Dashboard.prototype.publish("hideDesignDashboard", false, "boolean", "Hide Design Mode Dashboard",null,{tags:["Basic"]});
    Dashboard.prototype.publish("disableCellSelection", false, "boolean", "Disable the ability to 'select' cells while in designMode",null,{tags:["Basic"]});
    Dashboard.prototype.publish("restrictDraggingOut", false, "boolean", "Restrict Cell dragging to the bounds of the Dashboard",null,{tags:["Basic"]});
    Dashboard.prototype.publish("gutter", 4, "number", "Gap Between Widgets",null,{tags:["Basic"]});
    Dashboard.prototype.publish("fitTo", "all", "set", "Sizing Strategy", ["all", "width"], { tags: ["Basic"] });
    
    Dashboard.prototype.publish("designDashboardColor", "#dddddd", "html-color", "Color of Dashboard lines in Design Mode",null,{tags:["Private"]});
    Dashboard.prototype.publish("designDashboardColorExtra", "#333333", "html-color", "Color of excess Dashboard lines in Design Mode",null,{tags:["Private"]});

    Dashboard.prototype.publish("surfacePadding", null, "string", "Cell Padding (px)", null, { tags: ["Intermediate"] });
    
    Dashboard.prototype.publish("surfaceBorderWidth", 1, "number", "Width (px) of Cell Border", null, { tags: ["Intermediate"] });
    
    Dashboard.prototype.publish("extraDesignModeWidth", 0, "number", "Number of additional columns added when in Design Mode.",null,{tags:["Private"]});
    Dashboard.prototype.publish("extraDesignModeHeight", 0, "number", "Number of additional rows added when in Design Mode.",null,{tags:["Private"]});
    Dashboard.prototype.publish("cellDensity", 3, "string", "Increase the cell density with this multiplier (Ex: 3 results in 3 cols per col and 3 rows per row)", null, { tags: ["Intermediate"] });

    Dashboard.prototype.publish("content", [], "widgetArray", "widgets",null,{tags:["Basic"]});

    Dashboard.prototype.getDimensions = function () {
        var size = { width: 0, height: 0 };
        this.content().forEach(function (cell) {
            if (size.width < cell.DashboardCol() + cell.DashboardColSpan()) {
                size.width = cell.DashboardCol() + cell.DashboardColSpan();
            }
            if (size.height < cell.DashboardRow() + cell.DashboardRowSpan()) {
                size.height = cell.DashboardRow() + cell.DashboardRowSpan();
            }
        }, this);
        return size;
    };

    Dashboard.prototype.clearContent = function (widget) {
        this.content(this.content().filter(function (contentWidget) {
            if (!widget) {
                contentWidget.target(null);
                return false;
            }
            var w = contentWidget;
            while (w) {
                if (widget === w) {
                    contentWidget.target(null);
                    return false;
                }
                w = w.widget ? w.widget() : null;
            }
            return true;
        }));
    };

    Dashboard.prototype.setContent = function (row, col, widget, title, rowSpan, colSpan) {
        rowSpan = rowSpan || 1;
        colSpan = colSpan || 1;
        title = title || "";
        var mult = this.cellDensity();
        this.content(this.content().filter(function (contentWidget) {
            if (contentWidget.DashboardRow() === row*mult && contentWidget.DashboardCol() === col*mult) {
                contentWidget.target(null);
                return false;
            }
            return true;
        }));
        if (widget) {
            var cell = new Cell()
                .DashboardRow(row*mult)
                .DashboardCol(col*mult)
                .widget(widget)
                .title(title)
                .DashboardRowSpan(rowSpan*mult)
                .DashboardColSpan(colSpan*mult)
            ;
            this.prevDensity = mult;
            this.content().push(cell);
        }
        return this;
    };

    Dashboard.prototype.sortedContent = function () {
        return this.content().sort(function (l, r) {
            if (l.DashboardRow() === r.DashboardRow()) {
                return l.DashboardCol() - r.DashboardCol();
            }
            return l.DashboardRow() - r.DashboardRow();
        });
    };

    Dashboard.prototype.getCell = function (row, col) {
        var retVal = null;
        this.content().some(function (cell) {
            if (row >= cell.DashboardRow() && row < cell.DashboardRow() + cell.DashboardRowSpan() &&
                col >= cell.DashboardCol() && col < cell.DashboardCol() + cell.DashboardColSpan()) {
                retVal = cell;
                return true;
            }
            return false;
        });
        return retVal;
    };

    Dashboard.prototype.getWidgetCell = function (id) {
        var retVal = null;
        this.content().some(function (cell) {
            if (cell.widget()._id === id) {
                retVal = cell;
                return true;
            }
            return false;
        });
        return retVal;
    };

    Dashboard.prototype.getContent = function (id) {
        var retVal = null;
        this.content().some(function (cell) {
            if (cell.widget()._id === id) {
                retVal = cell.widget();
                return true;
            }
            return false;
        });
        return retVal;
    };
    
    Dashboard.prototype.updateCellMultiples = function () {
        var context = this;
        if(this.prevDensity !== this.cellDensity()){
            this.content().forEach(function (cell) {
                if(context.prevDensity && context.cellDensity()){
                    var m1 = context.prevDensity;
                    var m2 = context.cellDensity();
                    cell.DashboardRow(Math.floor(cell.DashboardRow() * m2/m1));
                    cell.DashboardCol(Math.floor(cell.DashboardCol() * m2/m1));
                    cell.DashboardRowSpan(Math.floor(cell.DashboardRowSpan() * m2/m1));
                    cell.DashboardColSpan(Math.floor(cell.DashboardColSpan() * m2/m1));
                }
            });
            this.prevDensity = this.cellDensity();
        }
    };
    
    Dashboard.prototype.childMoved = Dashboard.prototype.debounce(function (domNode, element) {
        this.render();
    }, 250);

    Dashboard.prototype.resizeContent = function () {
        this.content().forEach(function (cell) {
            cell.resize();
        });
        return this;
    };

    Dashboard.prototype.renderContent = function () {
        this.content().forEach(function (cell) {
            cell.render();
        });
        return this;
    };

    Dashboard.prototype.enter = function (domNode, element) {
        HTMLWidget.prototype.enter.apply(this, arguments);
        element.style("position", "relative");
        this.dropDiv = element.append("div");
        this.contentDiv = element.append("div");
        this._scrollBarWidth = this.getScrollbarWidth();
    };

    Dashboard.prototype.findCurrentLocation = function (e) {
        this._currLoc = [
            Math.floor((e.clientX - this._offsetX)/this._colSize),
            Math.floor((e.clientY - this._offsetY)/this._rowSize)
        ];
    };
    
    Dashboard.prototype.overHandle = function (e) {
        var handle = "";
        var handleSize = this._dragCell.handleSize();
        
        //Determines which edge cell (if any) this._currLoc is hovering over
        //An "edge" meaning a dropCell on the exterrior edge of a surface that covers many cells
        var onSouthEdge = this._dragCell.DashboardRowSpan() === this._currLoc[1] - this._dragCell.DashboardRow() + 1;
        var onNorthEdge = this._dragCell.DashboardRow() === this._currLoc[1];
        var onEastEdge = this._dragCell.DashboardColSpan() === this._currLoc[0] - this._dragCell.DashboardCol() + 1;
        var onWestEdge = this._dragCell.DashboardCol() === this._currLoc[0];
        
        var top = this._offsetY + ((this._currLoc[1]) * this._rowSize);
        var left = this._offsetX + ((this._currLoc[0]) * this._colSize);
        var width = this._colSize - this.gutter();
        var height = this._rowSize - this.gutter();
        
        if(Math.ceil(top + height) >= e.clientY && Math.floor(top + height - handleSize) <= e.clientY && onSouthEdge){
            handle = "s";//within SOUTH handle range
        }
        else if(Math.floor(top) <= e.clientY && Math.ceil(top + handleSize) >= e.clientY && onNorthEdge){
            handle = "n";//within NORTH handle range
        }
        if(Math.ceil(left + width) >= e.clientX && Math.floor(left + width - handleSize) <= e.clientX && onEastEdge){
            handle += "e";//within EAST handle range
        }
        else if(Math.floor(left) <= e.clientX && Math.ceil(left + handleSize) >= e.clientX && onWestEdge){
            handle += "w";//within WEST handle range
        }
        return handle;
    };
    
    Dashboard.prototype.createDropTarget = function (loc,handle) {
        var col = loc[0] - this._dragCellOffsetX;
        var row = loc[1] - this._dragCellOffsetY;
        var colSpan = this._dragCell.DashboardColSpan();
        var rowSpan = this._dragCell.DashboardRowSpan();
        
        var dropTarget = document.createElement("div");
        dropTarget.id = "Dashboard-drop-target"+this.id();
        dropTarget.className = "Dashboard-drop-target Dashboard-drag-handle-"+handle;
        
        this._element.node().appendChild(dropTarget);
        this.updateDropTarget(col,row,colSpan,rowSpan);
    };
    
    Dashboard.prototype.setDashboardOffsets = function () {
        this._offsetX = this._element.node().getBoundingClientRect().left + (this.gutter()/2);
        this._offsetY = this._element.node().getBoundingClientRect().top + (this.gutter()/2);
    };
    
    Dashboard.prototype.updateDropTarget = function (col,row,colSpan,rowSpan) {
        if(this.restrictDraggingOut()){
            var beyondTop = row < 0;
            var beyondRight = col+colSpan > this._colCount;
            var beyondBottom = row+rowSpan > this._rowCount;
            var beyondLeft = col < 0;
            if(beyondRight){
                var rDiff = col+colSpan - this._colCount;
                col -= rDiff;
            }
            if(beyondBottom){
                var bDiff = row+rowSpan - this._rowCount;
                row -= bDiff;
            }
            if(beyondLeft){
                col = 0;
            }
            if(beyondTop){
                row = 0;
            }
        }
        var top,left,width,height;
        top = this._offsetY + (row * this._rowSize);
        left = this._offsetX + (col * this._colSize);
        width = colSpan * this._colSize - this.gutter();
        height = rowSpan * this._rowSize - this.gutter();
        
        var dropTarget = document.getElementById("Dashboard-drop-target"+this.id());
        dropTarget.style.top = top + "px";
        dropTarget.style.left = left + "px";
        dropTarget.style.width = width + "px";
        dropTarget.style.height = height + "px";
    };
    
    Dashboard.prototype.moveDropTarget = function (loc) {
        if(this.restrictDraggingOut()){
            loc[0] = loc[0] > this._colCount-1 ? this._colCount-1 : loc[0];
            loc[0] = loc[0] < 0 ? 0 : loc[0];
            loc[1] = loc[1] > this._rowCount-1 ? this._rowCount-1 : loc[1];
            loc[1] = loc[1] < 0 ? 0 : loc[1];
        }
        if(this._handle){
            var pivotCell = [];
            switch(this._handle){
                case "nw":
                    pivotCell = [this._dragCell.DashboardCol()+this._dragCell.DashboardColSpan()-1,this._dragCell.DashboardRow()+this._dragCell.DashboardRowSpan()-1];
                    break;
                case "n":
                case "ne":
                    pivotCell = [this._dragCell.DashboardCol(),this._dragCell.DashboardRow()+this._dragCell.DashboardRowSpan()-1];
                    break;
                case "e":
                case "se":
                case "s":
                    pivotCell = [this._dragCell.DashboardCol(),this._dragCell.DashboardRow()];
                    break;
                case "sw":
                case "w":
                    pivotCell = [this._dragCell.DashboardCol()+this._dragCell.DashboardColSpan()-1,this._dragCell.DashboardRow()];
                    break;
            }
            switch(this._handle){
                case "e":
                case "w":
                    this._locY = pivotCell[1];
                    break;
                default:
                    this._locY = loc[1] <= pivotCell[1] ? loc[1] : pivotCell[1];
                    break;
            }
            switch(this._handle){
                case "n":
                case "s":
                    this._locX = pivotCell[0];
                    break;
                default:
                    this._locX = loc[0] <= pivotCell[0] ? loc[0] : pivotCell[0];
                    break;
            }
            switch(this._handle){
                case "n":
                case "s":
                    this._sizeX = this._dragCell.DashboardColSpan();
                    break;
                default:
                    this._sizeX = Math.abs(loc[0] - pivotCell[0]) + 1;
                    break;
            }
            switch(this._handle){
                case "e":
                case "w":
                    this._sizeY = this._dragCell.DashboardRowSpan();
                    break;
                default:
                    this._sizeY = Math.abs(loc[1] - pivotCell[1]) + 1;
                    break;
            }
        } else if (document.getElementById("Dashboard-drop-target"+this.id()) !== null) {
            var target = this.getCell(loc[1], loc[0]);
            if(target !== null && this._dragCell._id !== target._id){
                document.getElementById("Dashboard-drop-target"+this.id()).className = "Dashboard-drop-target drop-target-over";
                this._locX = target.DashboardCol();
                this._locY = target.DashboardRow();
                this._sizeX = target.DashboardColSpan();
                this._sizeY = target.DashboardRowSpan();
            } else {
                document.getElementById("Dashboard-drop-target"+this.id()).className = "Dashboard-drop-target";
                this._locX = loc[0] - this._dragCellOffsetX;
                this._locY = loc[1] - this._dragCellOffsetY;
                this._sizeX = this._dragCell.DashboardColSpan();
                this._sizeY = this._dragCell.DashboardRowSpan();
            }
        }
        
        this.updateDropTarget(this._locX,this._locY,this._sizeX,this._sizeY);
    };
    
    Dashboard.prototype.updateCells = function (cellWidth, cellHeight) {
        var context = this;
        
        this.updateCellMultiples();
        
        var rows = this.contentDiv.selectAll(".cell_." + this._id).data(this.content(), function (d) { return d._id; });
        rows.enter().append("div")
            .attr("class", "cell_ " + this._id)
            .style("position", "absolute")
            .each(function (d) {
                d
                   .target(this)
                ;
                d.__Dashboard_watch = d.monitor(function (key, newVal, oldVal) {
                    if (context._renderCount && key.indexOf("Dashboard") === 0 && newVal !== oldVal) {
                        context.childMoved();
                    }
                });
            });
        var drag = d3.behavior.drag()
            .on("dragstart", function (d) {
                d3.event.sourceEvent.stopPropagation();
        
                context._dragCell = d;
                
                context.setDashboardOffsets();
                context.findCurrentLocation(d3.event.sourceEvent);
                
                context._startLoc = [context._currLoc[0],context._currLoc[1]];
                
                context._element.selectAll(".dragHandle")
                    .style("visibility", "hidden")
                ;
                
                context._handle = context.overHandle(d3.event.sourceEvent);
                if(context._dragCell._dragHandles.indexOf(context._handle) === -1){
                    context._handle = undefined;
                }
                
                context._dragCellOffsetX = context._currLoc[0] - d.DashboardCol();
                context._dragCellOffsetY = context._currLoc[1] - d.DashboardRow();
                context.createDropTarget(context._currLoc,context._handle);
                setTimeout(function () {
                    context.contentDiv.selectAll(".cell_." + context._id)
                        .classed("dragItem", function (d2) {
                            return d._id === d2._id;
                        }).classed("notDragItem", function (d2) {
                            return d._id !== d2._id;
                        })
                    ;
                }, 0);
                
                context._initSelection = true;
            })
            .on("drag", function (d) {
                context._initSelection = false;
                context._dragCell = d;
                context.findCurrentLocation(d3.event.sourceEvent);
                if(typeof (context._currLocation) === "undefined" || (context._currLocation[0] !== context._currLoc[0] || context._currLocation[1] !== context._currLoc[1])){
                    context._currLocation = context._currLoc;
                    context.moveDropTarget(context._currLoc);
                }
            })
            .on("dragend", function () {
                d3.event.sourceEvent.stopPropagation();
        
                if(context._initSelection || context._startLoc[0] === context._currLoc[0] || context._startLoc[1] === context._currLoc[1]){
                    if(!context.disableCellSelection()){
                        context.selectionBagClick(context.getCell(context._currLoc[1],context._currLoc[0]));
                    }
                }
        
                context._element.selectAll(".dragHandle")
                    .style("visibility", null)
                ;
        
                if (context._handle) {
                    if(context.restrictDraggingOut()){
                        //Contain the dragCell (while 'resizing') within the bounds of the Dashboard
                        var locY = context._locY > 0 ? context._locY : 0;
                        var locX = context._locX > 0 ? context._locX : 0;
                        locY = context._locY+context._sizeY < context._rowCount ? context._locY : context._rowCount-context._sizeY;
                        locX = context._locX+context._sizeX < context._colCount ? context._locX : context._colCount-context._sizeX;
                        
                        context._dragCell.DashboardRow(locY);
                        context._dragCell.DashboardRowSpan(context._sizeY);
                        context._dragCell.DashboardCol(locX);
                        context._dragCell.DashboardColSpan(context._sizeX);
                    } else {
                        context._dragCell.DashboardRow(context._locY);
                        context._dragCell.DashboardRowSpan(context._sizeY);
                        context._dragCell.DashboardCol(context._locX);
                        context._dragCell.DashboardColSpan(context._sizeX);
                    }
                } else {
                    var targetRow = context._currLoc[1];
                    var targetCol = context._currLoc[0];
                    var targetRowSpan = context._dragCell.DashboardRowSpan();
                    var targetColSpan = context._dragCell.DashboardColSpan();
                    var targetCell = context.getCell(context._currLoc[1], context._currLoc[0]);
                    if (targetCell === context._dragCell) {
                        targetRowSpan = targetCell.DashboardRowSpan();
                        targetColSpan = targetCell.DashboardColSpan();
                        targetCell = null;
                    }
                    var newDragCellCol;
                    var newDragCellRow;
                    if (targetCell) {
                        //If dragCell is dropped onto another Cell... swap Cell sizes and positions
                        targetRow = targetCell.DashboardRow();
                        targetCol = targetCell.DashboardCol();
                        targetRowSpan = targetCell.DashboardRowSpan();
                        targetColSpan = targetCell.DashboardColSpan();
                        targetCell
                            .DashboardCol(context._dragCell.DashboardCol())
                            .DashboardColSpan(context._dragCell.DashboardColSpan())
                            .DashboardRow(context._dragCell.DashboardRow())
                            .DashboardRowSpan(context._dragCell.DashboardRowSpan())
                        ;
                        newDragCellCol = targetCol;
                        newDragCellRow = targetRow;
                    } else {
                        newDragCellCol = targetCol - context._dragCellOffsetX;
                        newDragCellRow = targetRow - context._dragCellOffsetY;
                        if(context.restrictDraggingOut()){
                            //Contain the dragCell (while 'moving') within the bounds of the Dashboard
                            targetRowSpan = context._dragCell.DashboardRowSpan();
                            targetColSpan = context._dragCell.DashboardColSpan();
                            var rightExcess = newDragCellCol + targetColSpan - context._colCount;
                            var bottomExcess = newDragCellRow + targetRowSpan - context._rowCount;
                            newDragCellCol -= rightExcess > 0 ? rightExcess : 0;
                            newDragCellRow -= bottomExcess > 0 ? bottomExcess : 0;

                            newDragCellCol = newDragCellCol > 0 ? newDragCellCol : 0;
                            newDragCellRow = newDragCellRow > 0 ? newDragCellRow : 0;
                        }
                    }
                    context._dragCell
                        .DashboardCol(newDragCellCol)
                        .DashboardRow(newDragCellRow)
                        .DashboardColSpan(targetColSpan)
                        .DashboardRowSpan(targetRowSpan)
                    ;
                }
                var DashboardDropTarget = document.getElementById("Dashboard-drop-target"+context.id());
                DashboardDropTarget.parentNode.removeChild(DashboardDropTarget);
                
                setTimeout(function () {
                    context.contentDiv.selectAll(".cell_." + context._id)
                        .classed("dragItem", false)
                        .classed("notDragItem", false)
                    ;
                }, 0);

                context._dragCell = null;
            });
            
        if(this.designMode()){ 
            this.contentDiv.selectAll(".cell_." + this._id).call(drag);
            d3.select(context._target).on("click",function(){
                context._selectionBag.clear();
                context.postSelectionChange();
            });
        } else {
            this.contentDiv.selectAll(".cell_." + this._id).on(".drag", null);
            this._selectionBag.clear();
        }
        
        rows.style("left", function (d) { return d.DashboardCol() * cellWidth + context.gutter() / 2 + "px"; })
            .style("top", function (d) { return d.DashboardRow() * cellHeight + context.gutter() / 2 + "px"; })
            .style("width", function (d) { return d.DashboardColSpan() * cellWidth - context.gutter() + "px"; })
            .style("height", function (d) { return d.DashboardRowSpan() * cellHeight - context.gutter() + "px"; })
            .each(function (d) {
                d._parentElement
                    .attr("draggable", context.designMode())
                    .selectAll(".dragHandle")
                        .attr("draggable", context.designMode())
                ;

                d
                    .surfacePadding(context.surfacePadding())
                    .surfaceBorderWidth(context.surfaceBorderWidth())
                    .resize()
                ;
            });
        rows.exit().each(function (d) {
            d
               .target(null)
            ;
            if (d.__Dashboard_watch) {
                d.__Dashboard_watch.remove();
            }
        }).remove();
    };

    Dashboard.prototype.postSelectionChange = function(){};

    Dashboard.prototype.updateDropCells = function (dimensions, cellWidth, cellHeight) {
        var context = this;
        if(_needsCanvasRedraw()){
            if(this.designMode() && !this.hideDesignDashboard()){
                var c_canvas = document.createElement("canvas");
                c_canvas.width = dimensions.width * cellWidth;
                c_canvas.height = dimensions.height * cellHeight;
                var contentWidth = (dimensions.width - this.extraDesignModeWidth()) * cellWidth;
                var contentHeight = (dimensions.height  - this.extraDesignModeHeight()) * cellHeight;
                var canvasContext = c_canvas.getContext("2d");

                //Draw vertical lines
                var xCount = 0;
                for (var x = 0.5 + cellWidth; x < c_canvas.width; x += cellWidth) {
                    xCount++;
                    if(xCount < dimensions.width - this.extraDesignModeWidth()){
                        _drawLine(_roundHalf(x),_roundHalf(x),0,contentHeight,this.designDashboardColor());
                    } else {
                        _drawLine(_roundHalf(x),_roundHalf(x),0,c_canvas.height,this.designDashboardColorExtra());
                    }
                }
                //Draw horizontal lines
                var yCount = 0;
                for (var y = 0.5 + cellHeight; y < c_canvas.height; y += cellHeight) {
                    yCount++;
                    if(yCount < dimensions.height - this.extraDesignModeHeight()){
                        _drawLine(0,contentWidth,_roundHalf(y),_roundHalf(y),this.designDashboardColor());
                    } else {
                        _drawLine(0,c_canvas.width,_roundHalf(y),_roundHalf(y),this.designDashboardColorExtra());
                    }
                }
                //Draw excess (short) vertical lines
                xCount = 0;
                for (var x2 = 0.5 + cellWidth; x2 < c_canvas.width; x2 += cellWidth) {
                    if(xCount < dimensions.width - this.extraDesignModeWidth()){
                        _drawLine(_roundHalf(x2),_roundHalf(x2),contentHeight,c_canvas.height,this.designDashboardColorExtra());
                    }
                }
                //Draw excess (short) horizontal lines
                yCount = 0;
                for (var y2 = 0.5 + cellHeight; y2 < c_canvas.height; y2 += cellHeight) {
                    if(yCount < dimensions.height - this.extraDesignModeHeight()){
                        _drawLine(contentWidth,c_canvas.width,_roundHalf(y2),_roundHalf(y2),this.designDashboardColorExtra());
                    }
                }

                if(this._target){
                    this._target.style.backgroundImage = "url("+ c_canvas.toDataURL()+")";
                }
                
                this.prevDimensions = {
                    "width":dimensions.width,
                    "height":dimensions.height
                };
                this.prevCellWidth = cellWidth;
                this.prevCellHeight = cellHeight;
            } else {
                this._target.style.backgroundImage = "";
            }
        }
        
        
        function _roundHalf(n){
            return parseInt(n) - 0.5;
        }
        function _drawLine(x1,x2,y1,y2,color){
            canvasContext.beginPath();
            canvasContext.strokeStyle = color;
            canvasContext.moveTo(x1,y1);
            canvasContext.lineTo(x2,y2);
            canvasContext.stroke();
        }
        function _needsCanvasRedraw(){
            var ret = false;
            if(typeof (context.prevDimensions) === "undefined"){
                ret = true;
            } else if (context.prevDimensions.width !== dimensions.width || context.prevDimensions.height !== dimensions.height) {
                ret = true;
            } else if (context.prevCellWidth !== cellWidth || context.prevCellHeight !== cellHeight) {
                ret = true;
            } else if (context._target.style.backgroundImage === "" && context.designMode() && !context.hideDesignDashboard()) {
                ret = true;
            } else if (context._target.style.backgroundImage !== "" && !context.designMode()) {
                ret = true;
            } else if (context._target.style.backgroundImage !== "" && context.hideDesignDashboard()) {
                ret = true;
            }
            return ret;
        }
    };

    Dashboard.prototype.update = function (domNode, element) {
        HTMLWidget.prototype.update.apply(this, arguments);
        
        this._parentElement.style("overflow-x", this.fitTo() === "width" ? "hidden" : null);
        this._parentElement.style("overflow-y", this.fitTo() === "width" ? "scroll" : null);
        var dimensions = this.getDimensions();
        if (this.designMode()) {
            dimensions.width+=this.extraDesignModeWidth();
            dimensions.height+=this.extraDesignModeHeight();
        }
        var cellWidth = (this.width() - (this.fitTo() === "width" ? this._scrollBarWidth : 0)) / dimensions.width;
        var cellHeight = this.fitTo() === "all" ? this.height() / dimensions.height : cellWidth;

        this._colCount = dimensions.width;
        this._rowCount = dimensions.height;
        this._colSize = cellWidth;
        this._rowSize = cellHeight;
        
        element.selectAll("#"+this.id()+" > div > div.cell_ > div[draggable=true]").style({opacity:this.designModeOpacity()});
        element.selectAll("#"+this.id()+" > div > div.cell_ > div[draggable=true] > div > div.dragHandle").style({opacity:this.designModeOpacity()});
        element.selectAll("#"+this.id()+" > div > div.cell_ > div[draggable=false]").style({opacity:1});
        element.selectAll("#"+this.id()+" > div > div.cell_ > div[draggable=false] > div > div.dragHandle").style({opacity:1});
        

        this.updateCells(cellWidth, cellHeight);
        this.updateDropCells(dimensions, cellWidth, cellHeight);
        
        element.classed("hideHandles",this.hideDragHandles());
    };

    Dashboard.prototype.exit = function (domNode, element) {
        HTMLWidget.prototype.exit.apply(this, arguments);
    };
    
    Dashboard.prototype._createSelectionObject = function (d) {
        return {
            _id: d._id,
            element: function () {
                return d._element;
            },
            widget:d
        };
    };
    
    Dashboard.prototype.selection = function (_) {
        if (!arguments.length) return this._selectionBag.get().map(function (d) { return d._id; });
        this._selectionBag.set(_.map(function (row) {
            return this._createSelectionObject(row);
        }, this));
        return this;
    };

    Dashboard.prototype.selectionBagClick = function (d) {
        if(d !== null){
            var selectionObj = this._createSelectionObject(d);
            if(d3.event.sourceEvent.ctrlKey){
                if(this._selectionBag.isSelected(selectionObj)){
                    this._selectionBag.remove(selectionObj);
                    this.postSelectionChange();
                } else {
                    this._selectionBag.append(selectionObj);
                    this.postSelectionChange();
                }
            } else {
                this._selectionBag.set([selectionObj]);
                this.postSelectionChange();
            }
        }
    };

    return Dashboard;
}));
