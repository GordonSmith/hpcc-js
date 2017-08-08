import { HTMLWidget, Platform, PropertyExt } from "@hpcc-js/common";
import { Widget } from "@hpcc-js/common";
import { Grid } from "@hpcc-js/layout";
import { local as d3Local, select as d3Select, selectAll as d3SelectAll } from "d3-selection";
import * as Persist from "./Persist";

import "../src/PropertyEditor.css";

function hasProperties(type) {
    switch (type) {
        case "widget":
        case "widgetArray":
        case "propertyArray":
            return true;
        default:
    }
    return false;
}

export class PropertyEditor extends HTMLWidget {
    _widgetOrig;
    _parentPropertyEditor;
    _show_settings: boolean;
    _selectedItems;
    __meta_sorting;
    _watch;
    _childPE = d3Local<PropertyEditor>();

    constructor() {
        super();
        this._parentPropertyEditor = null;

        this._tag = "div";
        this._show_settings = false;
    }

    parentPropertyEditor(_?: PropertyEditor): PropertyEditor {
        if (!arguments.length) return this._parentPropertyEditor;
        this._parentPropertyEditor = _;
        return this;
    }

    depth(): number {
        let retVal = 0;
        let parent = this.parentPropertyEditor();
        while (parent) {
            ++retVal;
            parent = parent.parentPropertyEditor();
        }
        return retVal;
    }

    show_settings(): boolean;
    show_settings(_: boolean): PropertyEditor;
    show_settings(_?: boolean): boolean | PropertyEditor {
        if (!arguments.length) {
            return this._show_settings;
        }
        this._show_settings = _;
        return this;
    }

    rootWidgets() {
        if (this._selectedItems && this._selectedItems.length) {
            return this._selectedItems;
        }
        return this.show_settings() ? [this] : this.widget() ? [this.widget()] : [];
    }

    update(domNode, element2) {
        super.update(domNode, element2);

        const context = this;

        const rootWidgets = this.rootWidgets().filter(function (w) {
            if (w._owningWidget && w._owningWidget.excludeObjs instanceof Array) {
                if (w._owningWidget.excludeObjs.indexOf(w.classID()) !== -1) {
                    return false;
                }
            }
            return true;
        });

        const table2 = element2.selectAll(`table.property-table.table-${this.depth()}`).data(rootWidgets, function (d) {
            //  We reuse the existing DOM Nodes and this node _might_ have been a regular Input previously  ---
            if (typeof d.id !== "function") {
                return `meta-${d.id}`;
            }
            return d.id();
        });
        table2.enter().append("table")
            .attr("class", `property-table table-${this.depth()}`)
            .each(function () {
                const table = d3Select(this);
                if (context.parentPropertyEditor() === null) {
                    table.append("thead").append("tr").append("th").datum(table)
                        .attr("colspan", "2")
                        .each(function () {
                            const th = d3Select(this);
                            th.append("span");
                            context.thButtons(th);
                        })
                        ;
                }
                table.append("tbody");
            })
            .merge(table2)
            .each(function (d2) {
                const element = d3Select(this);
                element.select("thead > tr > th > span")
                    .text(function (d: any) {
                        let spanText = "";
                        if (context.label()) {
                            spanText += context.label();
                        }
                        if (d && d.classID) {
                            if (spanText) {
                                spanText += " - ";
                            }
                            spanText += d.classID();
                        }
                        return spanText;
                    })
                    ;
                element.selectAll("i")
                    .classed("fa-eye", !context.hideNonWidgets())
                    .classed("fa-eye-slash", context.hideNonWidgets());
                context.renderInputs(element.select("tbody"), d2);
            })
            ;
        table2.exit()
            .each(function () {
                context.renderInputs(element2.select("tbody"), null);
            })
            .remove()
            ;
    }

    exit(domNode, element) {
        super.exit(domNode, element);
        this.watchWidget(null);
    }

    private watchDepth = 0;
    watchWidget(widget) {
        if (this._watch) {
            if ((window as any).__hpcc_debug) {
                --this.watchDepth;
                console.log("watchDepth:  " + this.watchDepth);
            }
            this._watch.remove();
            delete this._watch;
        }
        if (widget) {
            const context = this;
            this._watch = widget.monitor(function (_paramId, newVal, oldVal) {
                if (oldVal !== newVal) {
                    const propEditor = context.parentPropertyEditor() || context;
                    propEditor.lazyRender();
                }
            });
            if ((window as any).__hpcc_debug) {
                ++this.watchDepth;
                console.log("watchDepth:  " + this.watchDepth);
            }
        }
    }

    thButtons(th, expandButton?) {
        const context = this;
        const collapseIcon = (expandButton ? expandButton : th.append("i"))
            .attr("class", "fa fa-minus-square-o")
            .on("click", function (d) {
                const clickTarget = expandButton ? th.select("table") : d;
                clickTarget
                    .classed("property-table-collapsed", !clickTarget.classed("property-table-collapsed"))
                    ;
                collapseIcon
                    .classed("fa-minus-square-o", !clickTarget.classed("property-table-collapsed"))
                    .classed("fa-plus-square-o", clickTarget.classed("property-table-collapsed"))
                    ;
            })
            ;
        if (this.parentPropertyEditor() === null && !expandButton) {
            const sortIcon = th.append("i")
                .attr("class", "fa " + context.__meta_sorting.ext.icons[context.sorting_options().indexOf(context.sorting())])
                .on("click", function () {
                    const sort = context.sorting();
                    const types = context.sorting_options();
                    const icons = context.__meta_sorting.ext.icons;
                    sortIcon
                        .classed(icons[types.indexOf(sort)], false)
                        .classed(icons[(types.indexOf(sort) + 1) % types.length], true)
                        ;
                    context.sorting(types[(types.indexOf(sort) + 1) % types.length]).render();
                })
                ;
            const hideParamsIcon = th.append("i")
                .attr("class", "fa " + (context.hideNonWidgets() ? "fa-eye-slash" : "fa-eye"))
                .on("click", function () {
                    hideParamsIcon
                        .classed("fa-eye", context.hideNonWidgets())
                        .classed("fa-eye-slash", !context.hideNonWidgets())
                        ;
                    context.hideNonWidgets(!context.hideNonWidgets()).render();
                })
                ;
            hideParamsIcon
                .classed("fa-eye", !context.hideNonWidgets())
                .classed("fa-eye-slash", context.hideNonWidgets())
                ;
        }
    }

    gatherDataTree(widget) {
        if (!widget) return null;
        const retVal = {
            label: widget.id() + " (" + widget.classID() + ")",
            children: []
        };
        const arr2 = Persist.discover(widget);
        arr2.forEach(function (prop) {
            const node = {
                label: prop.id,
                children: []
            };
            switch (prop.type) {
                case "widget":
                    node.children.push(this.gatherDataTree(widget[prop.id]()));
                    break;
                case "widgetArray":
                case "propertyArray":
                    const arr = widget[prop.id]();
                    if (arr) {
                        arr.forEach(function (item) {
                            node.children.push(this.gatherDataTree(item));
                        }, this);
                    }
                    break;
                default:
            }
            retVal.children.push(node);
        }, this);
        return retVal;
    }

    getDataTree() {
        return this.gatherDataTree(this.widget());
    }

    _rowSorting(paramArr) {
        if (this.sorting() === "type") {
            const typeOrder = ["boolean", "number", "string", "html-color", "array", "object", "widget", "widgetArray", "propertyArray"];
            paramArr.sort(function (a, b) {
                if (a.type === b.type) {
                    return a.id < b.id ? -1 : 1;
                } else {
                    return typeOrder.indexOf(a.type) < typeOrder.indexOf(b.type) ? -1 : 1;
                }
            });
        } else if (this.sorting() === "A-Z") {
            paramArr.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
        } else if (this.sorting() === "Z-A") {
            paramArr.sort(function (a, b) { return a.id > b.id ? -1 : 1; });
        }
    }

    filterInputs(d) {
        const discArr = Persist.discover(d);
        if ((this.filterTags() || this.excludeTags().length > 0 || this.excludeParams.length > 0) && d instanceof PropertyEditor === false) {
            const context = this;
            return discArr.filter(function (param, _idx) {
                for (const excludeParamItem of context.excludeParams()) {
                    const arr = excludeParamItem.split(".");
                    let widgetName;
                    let obj;
                    let excludeParam;
                    if (arr.length > 2) {
                        widgetName = arr[0];
                        obj = arr[1];
                        excludeParam = arr[2];
                    } else {
                        widgetName = arr[0];
                        excludeParam = arr[1];
                    }
                    if (d.class().indexOf(widgetName) !== -1) {
                        if (param.id === excludeParam) {
                            return false;
                        }
                        return true;
                    }
                }
                if (context.excludeTags().length > 0 && param.ext && param.ext.tags && param.ext.tags.some(function (item) { return (context.excludeTags().indexOf(item) > -1); })) {
                    return false;
                }
                if ((context.filterTags() && param.ext && param.ext.tags && param.ext.tags.indexOf(context.filterTags()) !== -1) || !context.filterTags()) {
                    return true;
                }
                return false;
            });
        }
        return discArr;
    }

    renderInputs(element, d) {
        const context = this;
        let discArr = [];
        const showFields = !this.show_settings() && this.showFields();
        if (d) {
            discArr = this.filterInputs(d).filter(function (prop) { return prop.id !== "fields" ? true : showFields; });
            if (!this.show_settings() && this.showData() && d.data) {
                discArr.push({ id: "data", type: "array" });
            }
            if (this.hideNonWidgets()) {
                discArr = discArr.filter(function (n) {
                    return hasProperties(n.type);
                });
            }
            this._rowSorting(discArr);
        }

        const rows = element.selectAll("tr.prop" + this.id()).data(discArr, function (d2) { return d2.id; });
        rows.enter().append("tr")
            .attr("class", "property-wrapper prop" + this.id())
            .each(function (param) {
                const tr = d3Select(this);
                if (hasProperties(param.type)) {
                    tr.classed("property-widget-wrapper", true);
                    tr.append("td")
                        .attr("colspan", "2")
                        ;
                } else {
                    tr.classed("property-input-wrapper", true);
                    tr.append("td")
                        .classed("property-label", true)
                        .text(param.id)
                        ;
                    const inputCell = tr.append("td")
                        .classed("property-input-cell", true)
                        ;
                    context.enterInputs(d, inputCell, param);
                }
            }).merge(rows)
            .each(function (param) {
                const tr = d3Select(this);
                tr.classed("disabled", d[param.id + "_disabled"] && d[param.id + "_disabled"]());
                tr.attr("title", param.description);
                if (hasProperties(param.type)) {
                    context.updateWidgetRow(d, tr.select("td"), param);
                } else {
                    context.updateInputs(d, param);
                }
            });
        rows.exit().each(function (param) {
            const tr = d3Select(this);
            if (hasProperties(param.type)) {
                context.updateWidgetRow(d, tr.select("td"), null);
            }
        }).remove();
        rows.order();
    }

    updateWidgetRow(widget: PropertyExt, element, param) {
        let tmpWidget = [];
        if (widget && param) {
            tmpWidget = widget[param.id]() || [];
        }
        let widgetArr = tmpWidget instanceof Array ? tmpWidget : [tmpWidget];
        if (param && param.ext && param.ext.autoExpand) {
            //  remove empties and ensure last row is an empty  ---
            let lastModified = true;
            const noEmpties = widgetArr.filter(function (row, idx) {
                lastModified = row.publishedModified();
                row._owner = widget;
                return lastModified || idx === widgetArr.length - 1;
            }, this);
            let changed = !!(widgetArr.length - noEmpties.length);
            if (lastModified) {
                changed = true;
                const autoExpandWidget = new param.ext.autoExpand(widget);
                // autoExpandWidget.monitor((id, newVal, oldVal, source) => {
                // widget.broadcast(param.id, newVal, oldVal, source);
                // });
                noEmpties.push(autoExpandWidget);
            }
            if (changed) {
                widget[param.id](noEmpties);
                widgetArr = noEmpties;
            }
        }

        const context = this;
        element.classed("headerRow", true);
        const peHeader = element.selectAll(`div.headerSpan-${this.id()}`).data(widgetArr, function (d) { return d.id(); });
        peHeader.enter().append("div")
            .attr("class", `headerSpan headerSpan-${this.id()}`)
            .each(function (d) {
                const element2 = d3Select(this).html("");
                element2.append("span")
                    .text(() => `${param.id}`)
                    ;
                const expandButton = element2.append("i");
                context.thButtons(element, expandButton);
            })
            ;
        peHeader.exit().remove();
        const widgetCell = element.selectAll(`div.propEditor-${this.id()}`).data(widgetArr, function (d) { return d.id(); });
        widgetCell.enter().append("div")
            .attr("class", `property-input-cell propEditor-${this.id()}`)
            .each(function (w) {
                context._childPE.set(this, new PropertyEditor().label(param.id).target(this));
            }).merge(widgetCell)
            .each(function (w) {
                context._childPE.get(this)
                    .parentPropertyEditor(context)
                    .showFields(context.showFields())
                    .showData(context.showData())
                    .sorting(context.sorting())
                    .filterTags(context.filterTags())
                    .excludeTags(context.excludeTags())
                    .excludeParams(context.excludeParams())
                    .hideNonWidgets(context.hideNonWidgets() && w._class.indexOf("layout_") >= 0)
                    .widget(w)
                    .render()
                    ;
            })
            ;
        widgetCell.exit()
            .each(function () {
                context._childPE.get(this)
                    .widget(null)
                    .render()
                    .target(null)
                    ;
                context._childPE.remove(this);
            })
            .remove()
            ;
    }

    setProperty(widget, id, value) {
        //  With PropertyExt not all "widgets" have a render, if not use parents render...
        let propEditor: PropertyEditor = this;
        while (propEditor && widget) {
            if (propEditor === this) {
                widget[id](value);
            }

            if (widget._parentElement) {
                const tmpPE = propEditor;
                widget.render(function () {
                    tmpPE.render();
                });
                propEditor = null;
            } else {
                propEditor = propEditor.parentPropertyEditor();
                widget = propEditor ? propEditor.widget() : null;
            }
        }
    }

    enterInputs(widget, cell, param) {
        cell.classed(param.type + "-cell", true);
        const context = this;
        if (typeof (param.ext.editor_input) === "function") {
            param.ext.editor_input(this, widget, cell, param);
        }
        switch (param.type) {
            case "boolean":
                cell.append("input")
                    .attr("id", this.id() + "_" + param.id)
                    .classed("property-input", true)
                    .attr("type", "checkbox")
                    .on("change", function () {
                        context.setProperty(widget, param.id, this.checked);
                    })
                    ;
                break;
            case "set":
                cell.append("select")
                    .attr("id", this.id() + "_" + param.id)
                    .classed("property-input", true)
                    .on("change", function () {
                        context.setProperty(widget, param.id, this.value);
                    })
                    ;
                break;
            case "array":
            case "object":
                cell.append("textarea")
                    .attr("id", this.id() + "_" + param.id)
                    .classed("property-input", true)
                    .on("change", function () {
                        context.setProperty(widget, param.id, JSON.parse(this.value));
                    })
                    ;
                break;
            default:
                cell.append("input")
                    .attr("id", this.id() + "_" + param.id)
                    .classed("property-input", true)
                    .on("change", function () {
                        context.setProperty(widget, param.id, this.value);
                    })
                    ;
                if (param.type === "html-color" && !Platform.isIE) {
                    cell.append("input")
                        .attr("id", this.id() + "_" + param.id + "_2")
                        .classed("property-input", true)
                        .attr("type", "color")
                        .on("change", function () {
                            context.setProperty(widget, param.id, this.value);
                        })
                        ;
                }
                break;
        }
    }

    updateInputs(widget, param) {
        const element = d3SelectAll("#" + this.id() + "_" + param.id + ", #" + this.id() + "_" + param.id + "_2");
        const val = widget ? widget[param.id]() : "";
        element.property("disabled", widget[param.id + "_disabled"] && widget[param.id + "_disabled"]());
        switch (param.type) {
            case "boolean":
                element.property("checked", val);
                break;
            case "set":
                const options = element.selectAll("option").data(widget[param.id + "_options"]() as string[]);
                options.enter().append("option")
                    .merge(options)
                    .attr("value", d => d)
                    .text(d => d)
                    ;
                options.exit().remove();
                element.property("value", val);
                break;
            case "array":
            case "object":
                element.property("value", JSON.stringify(val, function replacer(_key, value) {
                    if (value instanceof Widget) {
                        return Persist.serialize(value);
                    }
                    return value;
                }));
                break;
            default:
                element.property("value", val);
                break;
        }
    }

    showFields: { (): boolean; (_: boolean): PropertyEditor; };
    showData: { (): boolean; (_: boolean): PropertyEditor; };

    sorting: { (): string; (_: string): PropertyEditor; };
    sorting_options: () => string[];

    hideNonWidgets: { (): boolean; (_: boolean): PropertyEditor; };

    label: { (): string; (_: string): PropertyEditor; };
    filterTags: { (): string; (_: string): PropertyEditor; };
    excludeTags: { (): string[]; (_: string[]): PropertyEditor; };
    excludeParams: { (): string[]; (_: string[]): PropertyEditor; };

    widget: { (): PropertyExt; (_: PropertyExt): PropertyEditor };
}
PropertyEditor.prototype._class += " other_PropertyEditor";

PropertyEditor.prototype.publish("showFields", false, "boolean", "If true, widget.fields() will display as if it was a publish parameter.", null, { tags: ["Basic"] });
PropertyEditor.prototype.publish("showData", false, "boolean", "If true, widget.data() will display as if it was a publish parameter.", null, { tags: ["Basic"] });

PropertyEditor.prototype.publish("sorting", "none", "set", "Specify the sorting type", ["none", "A-Z", "Z-A", "type"], { tags: ["Basic"], icons: ["fa-sort", "fa-sort-alpha-asc", "fa-sort-alpha-desc", "fa-sort-amount-asc"] });

PropertyEditor.prototype.publish("hideNonWidgets", false, "boolean", "Hides non-widget params (at this tier only)", null, { tags: ["Basic"] });

PropertyEditor.prototype.publish("label", "", "string", "Label to display in header of property editor table", null, { tags: ["Basic"] });
PropertyEditor.prototype.publish("filterTags", "", "set", "Only show Publish Params of this type", ["Basic", "Intermediate", "Advance", ""], {});
PropertyEditor.prototype.publish("excludeTags", [], "array", "Exclude this array of tags", null, {});
PropertyEditor.prototype.publish("excludeParams", [], "array", "Exclude this array of params (widget.param)", null, {});

PropertyEditor.prototype.publish("widget", null, "widget", "Widget", null, { tags: ["Basic"], render: false });

const _widgetOrig = PropertyEditor.prototype.widget;
(PropertyEditor.prototype as any).widget = function (_?: Widget): Widget | PropertyEditor {
    if (arguments.length && _widgetOrig.call(this) === _) return this;
    const retVal = _widgetOrig.apply(this, arguments);
    if (arguments.length) {
        this.watchWidget(_);
        if (_ instanceof Grid) {
            const context = this;
            _.postSelectionChange = function () {
                context._selectedItems = _._selectionBag.get().map(function (item) { return item.widget; });
                context.lazyRender();
            };
        }
    }
    return retVal;
};
