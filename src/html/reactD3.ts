import { select as d3Select, SelectionFn } from "d3-selection";

export type ReactFn = (attrs: { [key: string]: string }) => IVirtualDOM;
export type RenderFn = (targetElement: SelectionFn, vdom: IVirtualDOM) => void;
export type RenderChildrenFn = (targetElement: SelectionFn, vdom: IVirtualDOM[]) => void;

export class IVirtualDOM {
    type: string | Function;
    attrs: { [key: string]: string };
    children: Array<string | IVirtualDOM>;
    render?: RenderFn;
    instance?: any;
}

function update(d) {
    const element = d3Select(this);
    for (const key in d.attrs) {
        element.attr(key, d.attrs[key]);
    }
    renderChildren(element, d.children);
}

function render(targetElement): void {
    const elements = targetElement.selectAll(`${targetElement.node().tagName} > ${this.type}`).data([this]);
    elements.enter()
        .append(this.type)
        .merge(elements)
        .each(update)
        ;
    elements.exit().remove();
}

function renderChildren(targetElement, vdom: Array<string | IVirtualDOM | Function>): void {
    const funcs = vdom.filter(d => typeof d === "function");
    const text = vdom.filter(d => typeof d === "string");
    const vdoms = vdom.filter(d => typeof d !== "string");
    if (funcs.length) {
        funcs.forEach((f: Function) => {
            f(targetElement);
        });
    } else if (text.length) {
        targetElement.text(text.join(""));
    } else {
        const elements = targetElement.selectAll(`${targetElement.node().tagName} > *`).data(vdoms);
        elements.enter()
            .append(function (d) {
                if (typeof d === "string") {
                    return document.createTextNode(d);
                }
                return document.createElement(d.type);
            })
            .merge(elements)
            .each(update)
            ;
        elements.exit().remove();
    }
}

export class ReactD3 {
    static createElement(type: string | ReactFn, attrs: { [key: string]: string }, ...children: Array<string | IVirtualDOM>): IVirtualDOM {
        if (typeof type === "function") {
            return type(attrs);
        }
        return { type, attrs, children };
    }

    static render(vdom: IVirtualDOM, targetElement) {
        render.call(vdom, targetElement);
    }
}

