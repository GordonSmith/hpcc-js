import { JSXWidget } from "../html/JSXWidget";
import { VizInstance } from "../html/VizInstance";
import { JSONEditor } from "./JSONEditor";

// import "./DDLEditor.css";

export class DDLEditor extends JSXWidget {
    summary: string = "0 Errors";
    _ddlEditor = new JSONEditor();
    private jsx = <div>
        <p><VizInstance instance={this._ddlEditor} /></p>
        <i>{this.summary}</i>
    </div >;

    ddl(): object;
    ddl(_: object): this;
    ddl(_?: object): object | this {
        if (!arguments.length) return this._ddlEditor.json();
        this._ddlEditor.json(_);
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
    }

    update(domNode, _element) {
        super.update(domNode, _element);
        this.jsxRender(this.jsx, domNode);
    }

    click() {
        alert("woohoo");
    }
}
DDLEditor.prototype._class += " codemirror_DDLEditor";
