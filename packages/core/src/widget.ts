import { Base } from "./base";
import * as d3 from "./d3";

export const DEFAULT_DEBOUNCE_DURATION = 500;

function debounce(duration) {
    return function innerDecorator(target, key, descriptor) {
        return {
            configurable: true,
            enumerable: descriptor.enumerable,
            get: function getter() {
                // Attach this function to the instance (not the class)
                Object.defineProperty(this, key, {
                    configurable: true,
                    enumerable: descriptor.enumerable,
                    value: _debounce(descriptor.value, duration)
                });

                return this[key];
            }
        };
    };
}

export function _debounce(method, duration = DEFAULT_DEBOUNCE_DURATION) {
    let timeoutId;

    function debounceWrapper(...args) {
        debounceWrapper.clear();

        timeoutId = setTimeout(() => {
            timeoutId = null;
            // @ts-ignore
            method.apply(this, args);
        }, duration);
    }

    debounceWrapper.clear = function () {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounceWrapper;
}

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
                this._element.remove();
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

    render(callback?: (w: Widget<T>) => void) {
        d3.select(this._target).selectAll("#" + this._id).data([this])
            .join(
                enter => enter.append(this._tag)
                    .attr("id", this._id)
                    .attr("class", this.classID())
                    .each(function (self: Widget<T>) {
                        self._element = d3.select(this);
                        self.preEnter();
                        self.enter(self._element);
                        self.postEnter();
                    }),
                update => update,
                exit => exit.remove()
            ).each(function (self: Widget<T>) {
                self.preUpdate();
                self.update(self._element);
                self.postUpdate();
            });

        setTimeout(() => {
            if (callback) {
                callback(this);
            }
        }, 0);

        return this;
    }

    @debounce(250)
    lazyRender(callback?: (w: Widget<T>) => void) {
        return this.render(callback);
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
