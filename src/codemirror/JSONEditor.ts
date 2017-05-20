import "codemirror/mode/javascript/javascript";
import { Editor } from "./Editor";

export class JSONEditor extends Editor {
    options(): any {
        const retVal = super.options();
        retVal.mode = "application/json";
        return retVal;
    }

    json(): object;
    json(_: object): this;
    json(_?: object): object | this {
        if (!arguments.length) return JSON.parse(this.text());
        this.text(JSON.stringify(_, null, "\t"));
        return this;
    }

}
JSONEditor.prototype._class += " codemirror_JSONEditor";
