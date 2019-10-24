import { Base } from "./base";
import * as d3 from "./d3";

export type ElementT<B extends d3.BaseType = d3.BaseType, T = any> = d3.Selection<B, T, d3.BaseType, unknown>;

export type ElementTagNameMap = HTMLElementTagNameMap & Pick<SVGElementTagNameMap, Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>>;

export class Widget<T extends keyof ElementTagNameMap> extends Base {

    protected _element: ElementT<ElementTagNameMap[T], this>;

    constructor(readonly _tag: T) {
        super();
    }

    protected _target: null | HTMLElement | SVGElement;
    target(): null | HTMLElement | SVGElement;
    target(_: null | string | HTMLElement | SVGElement | ElementT): this;
    target(_?: null | string | HTMLElement | SVGElement | ElementT): null | HTMLElement | SVGElement | this {
        if (!arguments.length) return this._target;
        if (_ === null) {
            if (!this._element.empty()) {
                this.preExit();
                this.exit(this._element);
                this.postExit();
                delete this._element;
            }
            delete this._target;
        } else if (_ && this._target) {
            throw new Error("Target can only be assigned once.");
        } else if (typeof _ === "string") {
            this._target = d3.select<HTMLElement | SVGElement, {}>(_).node();
            if (!this._target && _[0] !== "#") {
                this._target = d3.select<HTMLElement | SVGElement, {}>("#" + _).node();
            }
        } else if (_ instanceof Element) {
            this._target = _;
        } else if (_) {
            this._target = _.node() as HTMLElement;
        }
        if (_ && !this._target) {
            throw new Error("Invalid target.");
        }
        return this;
    }

    preEnter() { }
    enter(element: ElementT<ElementTagNameMap[T], this>) { }
    postEnter() { }
    preUpdate() { }
    update(element: ElementT<ElementTagNameMap[T], this>) { }
    postUpdate() { }
    preExit() { }
    exit(element: ElementT<ElementTagNameMap[T], this>) { }
    postExit() { }

    render(callback = (w: this) => { }): this {
        d3.select(this._target).selectAll("#" + this._id).data([this])
            .join(
                enter => enter.append(this._tag)
                    .attr("id", this._id)
                    .attr("class", this.cssClass())
                    .each(function (self: Widget<T>) {
                        self._element = d3.select(this);
                        self.preEnter();
                        self.enter(self._element);
                        self.postEnter();
                    }),
                update => update.each(function (self: Widget<T>) {
                    self.preUpdate();
                    self.update(self._element);
                    self.postUpdate();
                }),
                exit => exit.remove()
            );

        setTimeout(() => {
            callback(this);
        }, 0);

        return this;
    }
}

export class DIVWidget extends Widget<"div"> {

    constructor() {
        super("div");
    }
}

export class SVGGWidget extends Widget<"g"> {

    constructor() {
        super("g");
    }
}
/*
export class Placeholder<T extends Widget> extends Widget {

    constructor(protected readonly _widget: T, tag: string = "div") {
        super(tag);
    }

    widget(): T {
        return this._widget;
    }

    enter(element: SelectionT<this>) {
        super.enter(element);
        this._widget.target(element);
    }

    update(element: SelectionT<this>) {
        super.update(element);
        this._widget.render();
    }

    exit(element: SelectionT<this>) {
        this._widget.target(null);
        super.exit(element);
    }
}
*/
