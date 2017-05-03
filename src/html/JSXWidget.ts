import { Component, h, render } from "preact";
import { HTMLWidget } from "../common/HTMLWidget";

export class JSXWidget extends HTMLWidget {
    static Component = Component;
    static createElement = h;
    protected rootNode;

    jsxRender(jsx, domNode) {
        this.rootNode = render(jsx, domNode, this.rootNode);
    };
}
