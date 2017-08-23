import { d3SelectionType, HTMLWidget } from "@hpcc-js/common";
import { JSXWidget } from "./JSXWidget";

import "../src/TitleBar.css";

export interface IClickHandler {
    titleBarClick(src: Item, d, idx: number, groups): void;
}

export class Item extends HTMLWidget {
    protected _owner: IClickHandler;
    protected _element: d3SelectionType;

    constructor(owner: IClickHandler) {
        super();
        this._owner = owner;
        this._tag = "a";
    }
}

export class Button extends Item {
    private _icon: string;

    constructor(owner: IClickHandler, icon: string) {
        super(owner);
        this._icon = icon;
    }

    icon() {
        return this._icon;
    }

    enter(domNode: HTMLElement, element) {
        super.enter(domNode, element);
        element
            .attr("href", "#")
            .on("click", (d, idx, groups) => this._owner.titleBarClick(this, d, idx, groups))
            .append("i")
            .attr("class", `fa ${this._icon} fa-lg fa-fw`)
            ;
    }
}

export class ToggleButton extends Button {

    enter(domNode: HTMLElement, element) {
        element.on("click.sel", (d, idx, groups) => {
            this.selected(!this.selected());
            this.render();
        });
        super.enter(domNode, element);
    }

    update(domNode: HTMLElement, element) {
        super.update(domNode, element);
        this._element.classed("selected", this.selected());
    }
}
export interface ToggleButton {
    selected(): boolean;
    selected(_: boolean): this;
}
ToggleButton.prototype.publish("selected", false, "boolean");

export class Spacer extends Item {

    enter(domNode: HTMLElement, element) {
        super.enter(domNode, element);
        element
            .attr("class", "spacer")
            .attr("href", "#")
            .append("i")
            ;
    }
}

export class TitleBar extends JSXWidget {
    constructor() {
        super();
    }

    update(domNode, element) {
        const jsx = <div class="main">
            <div class="icon-bar"></div>
            <div class="title">{this.title()}</div>
        </div>;
        this.jsxRender(jsx, domNode);
        const icons = element.select("div.icon-bar").selectAll(".icon-bar-item").data(this.buttons());
        icons.enter().append("div")
            .attr("class", "icon-bar-item")
            //            .attr("href", "#")
            .each(function (d: Item) {
                d.target(this);
                // d.enter(this);
            })
            .merge(icons)
            .each(function (d: Item) {
                d.render();
                // d.update(this);
            })
            ;
        icons.exit()
            .each(function (d: Item) {
                d.target(null);
                // d.exit(this);
            })
            .remove();
        icons.order();
    }
}
TitleBar.prototype._class += " html_TitleBar";

export interface TitleBar {
    title(): string;
    title(_: string): this;
    buttons(): Item[];
    buttons(items: Item[]): this;
}
TitleBar.prototype.publish("title", "", "string");
TitleBar.prototype.publish("buttons", [], "widgetArray");
