import * as d3 from "d3";
import { Class } from "./Class";
import { debounce } from "./Utility";
import { PropertyExt } from "./PropertyExt";
import { Grid } from "./Database";

interface IPos {
    x: number,
    y: number
}

interface ISize {
    width: number,
    height: number
}

var widgetID = 0;
export class Widget extends PropertyExt {
    static _class = "common_Widget";
    static _idSeed = "_w";

    protected _id: string = Widget._idSeed + (++widgetID);
    protected _tag: string;

    private _db = new Grid();
    private _pos: IPos = { x: 0, y: 0 };
    private _prevPos: IPos & ISize;
    private _size: ISize = { width: 0, height: 0 };
    private _scale = 1;
    private _visible = true;
    private _display = true;

    private _target = null;
    private _parentElement = null;
    private _parentWidget = null;

    private _element = d3.select();

    private _renderCount = 0;

    private _overlayElement = null;

    constructor() {
        super();

        if ((window as any).__hpcc_debug) {
            if ((window as any).g_all === undefined) {
                (window as any).g_all = {};
            }
            (window as any).g_all[this._id] = this;
        }
        if ((window as any).__hpcc_theme) {
            this.applyTheme((window as any).__hpcc_theme);
        }
    }

    export(_) {
        switch (_) {
            case "TSV":
                return this._db.tsv();
            case "JSON":
                return this._db.json();
        }
        return this._db.csv();
    };

    leakCheck(newNode) {
        var context = this;
        var watchArray = [newNode];
        var destructObserver = new MutationObserver(function (mutations) {
            var leaks = false;
            mutations.forEach(function (mutation) {
                for (var i = 0; i < mutation.removedNodes.length; ++i) {
                    var node = mutation.removedNodes.item(i);
                    if (watchArray.indexOf(node) >= 0 && context._target) {
                        leaks = true;
                        destructObserver.disconnect();
                    }
                }
            });
            if (leaks) {
                console.log("leak:  " + context.id() + " - " + context.classID() + "\t\twidget.target(null); was not called for this widget before it was removed from the page.");
            }
        });
        var pNode = newNode.parentNode;
        while (pNode) {
            destructObserver.observe(pNode, { childList: true });
            watchArray.push(pNode);
            pNode = pNode.parentNode;
        }
    };

    //  Events  ---
    on(eventID, func, stopPropagation) {
        var context = this;
        this.overrideMethod(eventID, function (origFunc, args) {
            var retVal;
            if (stopPropagation) {
                if (d3.event) {
                    d3.event.stopPropagation();
                }
            } else {
                retVal = origFunc.apply(context, args);
            }
            return func.apply(context, args) || retVal;
        });
        return this;
    };

    //  Implementation  ---
    columns(_?) {
        if (!arguments.length) return this._db.legacyColumns();
        this._db.legacyColumns(_);
        return this;
    };

    parsedData() {
        return this._db.parsedData();
    };

    formattedData() {
        return this._db.formattedData();
    };

    data(_?) {
        if (!arguments.length) return this._db.legacyData();
        this._db.legacyData(_);
        return this;
    };

    cloneData() {
        return this.data().map(function (row) { return row.slice(0); });
    };

    flattenData() {
        var retVal = [];
        this.data().forEach(function (row, rowIdx) {
            this.columns().filter(function (col, idx) { return idx > 0; }).forEach(function (col, idx) {
                var val = row[idx + 1];
                if (val) {
                    var newItem = {
                        rowIdx: rowIdx,
                        colIdx: idx + 1,
                        label: row[0],
                        value: val
                    };
                    retVal.push(newItem);
                }
            }, this);
        }, this);
        return retVal;
    };

    rowToObj(row) {
        var retVal: any = {};
        this.fields().forEach(function (field, idx) {
            retVal[field.label_default() || field.label()] = row[idx];
        });
        if (row.length === this.columns().length + 1) {
            retVal.__lparam = row[this.columns().length];
        }
        return retVal;
    };

    pos(_?): IPos | Widget {
        if (!arguments.length) return this._pos;
        this._pos = _;
        if (this._overlayElement) {
            this._overlayElement
                .attr("transform", "translate(" + _.x + "," + _.y + ")scale(" + this._scale + ")")
                ;
        }
        return this;
    };

    x(_?): number | Widget {
        if (!arguments.length) return this._pos.x;
        this.pos({ x: _, y: this._pos.y });
        return this;
    };

    y(_?): number | Widget {
        if (!arguments.length) return this._pos.y;
        this.pos({ x: this._pos.x, y: _ });
        return this;
    };

    size(_?): ISize | Widget {
        if (!arguments.length) return this._size;
        this._size = _;
        if (this._overlayElement) {
            this._overlayElement
                .attr("width", _.width)
                .attr("height", _.height)
                ;
        }
        return this;
    };

    width(_?): number | Widget {
        if (!arguments.length) return this._size.width;
        this.size({ width: _, height: this._size.height });
        return this;
    };

    height(_?): number | Widget {
        if (!arguments.length) return this._size.height;
        this.size({ width: this._size.width, height: _ });
        return this;
    };

    resize(size, delta) {
        delta = delta || { width: 0, height: 0 };
        var width, height;
        if (size && size.width && size.height) {
            width = size.width;
            height = size.height;
        } else {
            var style = window.getComputedStyle(this._target, null);
            width = parseFloat(style.getPropertyValue("width")) - delta.width;
            height = parseFloat(style.getPropertyValue("height")) - delta.height;
        }
        this.size({
            width: width,
            height: height
        });
        return this;
    };

    scale(_?): number | Widget {
        if (!arguments.length) return this._scale;
        this._scale = _;
        if (this._overlayElement) {
            this._overlayElement
                .attr("transform", "translate(" + _.x + "," + _.y + ")scale(" + this._scale + ")")
                ;
        }
        return this;
    };

    visible(_?): boolean | Widget {
        if (!arguments.length) return this._visible;
        this._visible = _;
        if (this._parentElement) {
            this._parentElement.style({
                visibility: this._visible ? null : "hidden",
                opacity: this._visible ? null : 0
            });
        }
        return this;
    };

    display(_?): boolean | Widget {
        if (!arguments.length) return this._display;
        this._display = _;
        if (this._element) {
            this._element.style("display", this._display ? null : "none");
        }
        return this;
    };

    calcSnap(snapSize) {
        function snap(x, gridSize) {
            function snapDelta(x, gridSize) {
                var dx = x % gridSize;
                if (Math.abs(dx) > gridSize - Math.abs(dx)) {
                    dx = (gridSize - Math.abs(dx)) * (dx < 0 ? 1 : -1);
                }
                return dx;
            }
            return x - snapDelta(x, gridSize);
        }
        var l = snap(this._pos.x - this._size.width / 2, snapSize);
        var t = snap(this._pos.y - this._size.height / 2, snapSize);
        var r = snap(this._pos.x + this._size.width / 2, snapSize);
        var b = snap(this._pos.y + this._size.height / 2, snapSize);
        var w = r - l;
        var h = b - t;
        return [{ x: l + w / 2, y: t + h / 2 }, { width: w, height: h }];
    };

    //  DOM/SVG Node Helpers  ---
    toWidget(domNode) {
        if (!domNode) {
            return null;
        }
        var element = d3.select(domNode);
        if (element) {
            var widget = element.datum();
            if (widget && widget instanceof Widget) {
                return widget;
            }
        }
        return null;
    };

    locateParentWidget(domNode) {
        domNode = domNode || (this._target ? this._target.parentNode : null);
        if (domNode) {
            var widget = this.toWidget(domNode);
            if (widget) {
                return widget;
            } else if (domNode.parentNode) {
                return this.locateParentWidget(domNode.parentNode);
            }
        }
        return null;
    };

    locateSVGNode(domNode) {
        if (!domNode) {
            return null;
        }
        if (domNode.tagName === "svg") {
            return domNode;
        }
        return this.locateSVGNode(domNode.parentNode);
    };

    locateOverlayNode() {
        var widget = this.locateParentWidget(this._target);
        while (widget) {
            if (widget._parentOverlay) {
                return widget._parentOverlay;
            }
            widget = this.locateParentWidget(widget._target.parentNode);
        }
        return null;
    };

    getAbsolutePos(domNode, w, h) {
        var root = this.locateSVGNode(domNode);
        if (!root) {
            return null;
        }
        var pos = root.createSVGPoint();
        var ctm = domNode.getCTM();
        pos = pos.matrixTransform(ctm);
        var retVal: any = {
            x: pos.x,
            y: pos.y
        };
        if (w !== undefined && h !== undefined) {
            var size = root.createSVGPoint();
            size.x = w;
            size.y = h;
            size = size.matrixTransform(ctm);
            retVal.width = size.x - pos.x;
            retVal.height = size.y - pos.y;
        }
        return retVal;
    };

    hasOverlay() {
        return this._overlayElement;
    };

    syncOverlay() {
        if (this._size.width && this._size.height) {
            var newPos = this.getAbsolutePos(this._overlayElement.node(), this._size.width, this._size.height);
            if (newPos && (!this._prevPos || newPos.x !== this._prevPos.x || newPos.y !== this._prevPos.y || newPos.width !== this._prevPos.width || newPos.height !== this._prevPos.height)) {
                var xScale = newPos.width / this._size.width;
                var yScale = newPos.height / this._size.height;
                this._parentElement
                    .style({
                        left: newPos.x - (newPos.width / xScale) / 2 + "px",
                        top: newPos.y - (newPos.height / yScale) / 2 + "px",
                        width: newPos.width / xScale + "px",
                        height: newPos.height / yScale + "px"
                    })
                    ;
                var transform = "scale(" + xScale + "," + yScale + ")";
                this._parentElement
                    .style("transform", transform)
                    .style("-moz-transform", transform)
                    .style("-ms-transform", transform)
                    .style("-webkit-transform", transform)
                    .style("-o-transform", transform)
                    ;
            }
            this._prevPos = newPos;
        }
    };

    element() {
        return this._element;
    };

    node() {
        return this._element.node();
    };

    //  Render  ---
    private _prevNow = 0;
    render(callback) {
        if ((window as any).__hpcc_debug) {
            var now = Date.now();
            if (now - this._prevNow < 500) {
                console.log("Double Render:  " + (now - this._prevNow) + " - " + this.id() + " - " + this.classID());
            }
            this._prevNow = now;
        }

        callback = callback || function () { };
        if (!this._parentElement || !this.visible()) {
            callback(this);
            return this;
        }
        if (this._parentElement) {
            if (!this._tag)
                throw "No DOM tag specified";

            var elements = this._parentElement.selectAll("#" + this._id).data([this], function (d) { return d._id; });
            elements.enter().append(this._tag)
                .attr("class", this.class())
                .attr("id", this._id)
                //.attr("opacity", 0.50)  //  Uncomment to debug position offsets  ---
                .each(function (context) {
                    context._element = d3.select(this);
                    context.enter(this, context._element);
                    if ((window as any).__hpcc_debug) {
                        context.leakCheck(this);
                    }
                })
                ;
            elements
                .classed(this.classed())
                .each(function (context) {
                    context.preUpdate(this, context._element);
                    context.update(this, context._element);
                    context.postUpdate(this, context._element);
                })
                ;
            elements.exit()
                .each(function (context) {
                    d3.select(this).datum(null);
                    context.exit(this, context._element);
                })
                .remove()
                ;
            this._renderCount++;
        }

        //  ASync Render Contained Widgets  ---
        var widgets = [];
        this.publishedProperties(true).forEach(function (meta) {
            if (!meta.ext || meta.ext.render !== false) {
                switch (meta.type) {
                    case "widget":
                        var widget = this[meta.id]();
                        if (widget) {
                            widgets.push(this[meta.id]());
                        }
                        break;
                    case "widgetArray":
                        widgets = widgets.concat(this[meta.id]());
                        break;
                }
            }
        }, this);

        var context = this;
        switch (widgets.length) {
            case 0:
                callback(this);
                break;
            case 1:
                widgets[0].render(function () {
                    callback(context);
                });
                break;
            default:
                var renderCount = widgets.length;
                widgets.forEach(function (widget, idx) {
                    setTimeout(function () {
                        widget.render(function () {
                            if (--renderCount === 0) {
                                callback(context);
                            }
                        });
                    }, 0);
                });
                break;
        }
        return this;
    };

    lazyRender = debounce(function () {
        this.render();
    }, 100);

    enter(domNode, element) { };
    preUpdate(domNode, element) { };
    update(domNode, element) { };
    postUpdate(domNode, element) { };
    exit(domNode, element) { };

    fields(_?): any | Widget { throw "unimplemented"; };
    classed(_?): any | Widget { throw "unimplemented"; };
}
Widget.prototype.publishProxy("fields", "_db", "fields");
Widget.prototype.publish("classed", {}, "object", "HTML Classes", null, { tags: ["Private"] });

