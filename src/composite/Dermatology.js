"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["src/layout/Grid", "src/common/Icon", "src/other/Comms", "src/other/Persist", "src/other/PropertyEditor", "css!./Dermatology"], factory);
    }
}(this, function (Grid, Icon, Comms, Persist, PropertyEditor) {
    function Dermatology() {
        Grid.call(this);

        this._propEditor = new PropertyEditor()
            .show_settings(true)
        ;
    }
    Dermatology.prototype = Object.create(Grid.prototype);
    Dermatology.prototype.constructor = Dermatology;
    Dermatology.prototype._class += " composite_Dermatology";

    Dermatology.prototype.publish("showToolbar", true, "boolean", "Show Toolbar");
    Dermatology.prototype.publish("widget", null, "widget", "Widget");

    Dermatology.prototype.toggleProperties = function () {
        this._showProperties = !this._showProperties;
        this._buttonShowProps.element().classed("show", this._showProperties);
        this
            .setContent(0, 2, this._showProperties ? this._propEditor : null)
            .render()
        ;
        var widget = this.widget();
        if (widget && widget.designMode) {
            widget.designMode(this._showProperties);
        }
        return this;
    };

    Dermatology.prototype.enter = function (domNode, element) {
        Grid.prototype.enter.apply(this, arguments);
    };

    Dermatology.prototype.updateToolbar = function (domNode, element) {
        var context = this;
        var toolbar = element.selectAll(".toolbar").data(this.showToolbar() ? ["dummy"] : []);
        var iconDiameter = 24;
        var faCharHeight = 14;
        toolbar.enter().append("div")
            .attr("class", "toolbar")
            .style("height", iconDiameter + 8 + "px")
            .each(function (d) {
                context._buttonShowProps = new Icon()
                    .target(this)
                    .faChar("P")
                    .shape("square")
                    .diameter(iconDiameter)
                    .paddingPercent((1 - faCharHeight / iconDiameter) * 100)
                    .on("click", function () {
                        context.toggleProperties();
                    })
                ;
                context._buttonLast = context._buttonShowProps;
            })
        ;
        toolbar.each(function (d) {
            if (context._buttonShowProps) {
                context._buttonShowProps
                    .x(context.width() - iconDiameter / 2 - 4)
                    .y(iconDiameter / 2 + 4)
                    .render()
                ;
            }
        });
        toolbar.exit()
            .each(function () {
                context._buttonShowProps
                    .target(null)
                    .render()
                ;
                delete context._buttonShowProps;
            })
            .remove()
        ;
    };

    Dermatology.prototype.update = function (domNode, element) {
        Grid.prototype.update.apply(this, arguments);
        this.updateToolbar(domNode, element);
    };

    Dermatology.prototype.render = function (callback) {
        if (this.widget() !== this._prevWidget) {
            this._prevWidget = this.widget();
            this.setContent(0, 0, this.widget(), null, 1, 2);
            this._propEditor
                .widget(this.widget())
            ;

        }
        return Grid.prototype.render.apply(this, arguments);
    };

    return Dermatology;
}));
