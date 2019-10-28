import { ElementT, ElementTagNameMap, Widget } from "./widget";

type Size = { width: number, height: number };

export class Surface<T extends keyof ElementTagNameMap> extends Widget<T> {

    // _element can get swapped out by SVGZoomWidget  ---
    protected _surfaceElement: ElementT<ElementTagNameMap[T], this>;

    constructor(readonly _tag: T) {
        super(_tag);
    }

    protected _size: Size;
    size(): Size;
    size(_: Size): this;
    size(_?: Size): Size | this {
        if (_ === void 0) {
            if (!this._size) {
                this.size(this.calcTargetSize());
            }
            return this._size;
        }
        this._size = _;
        this._surfaceElement
            .style("width", _.width + "px")
            .style("height", _.height + "px")
            ;
        return this;
    }

    calcTargetSize(): Size {
        const style = window.getComputedStyle(this._target, null);
        return {
            width: parseFloat(style.getPropertyValue("width")),
            height: parseFloat(style.getPropertyValue("height"))
        };
    }

    resize(size?: Size): this {
        this._size = size;
        return this;
    }

    preEnter() {
        super.preEnter();
        this._surfaceElement = this._element;
        this.resize();
    }
}

export class SVGSurface extends Surface<"svg"> {

    constructor() {
        super("svg");
    }
}

export class DIVSurface extends Surface<"div"> {

    constructor() {
        super("div");
    }
}
