import { PropertyExt, publish } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Datasource } from "./datasource";

export class FormField extends PropertyExt {
    @publish("", "string", "Label")
    label: { (): string; (_?: string): FormField };
    @publish("string", "set", "Type", ["string", "number", "boolean"])
    type: { (): string; (_: string): FormField };
    @publish("", "string", "Default Value", null, { optional: true })
    default: { (): string; (_: string): FormField };
}

export class Form2 extends Datasource {
    @publish([], "propertyArray", "Fields", null, { autoExpand: FormField })
    formFields: { (): FormField[]; (_: FormField[]): Form2 };

    constructor() {
        super();
    }

    label(): string {
        return `${super.label()}\nForm`;
    }

    hash(): string {
        return hashSum({ id: this.id() });
    }

    refresh(): Promise<void> {
        return Promise.resolve();
    }

    outFields(): IField[] {
        return [];
    }

    total(): number {
        return 1;
    }

    protected _fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve([]);
    }
}
Form2.prototype._class += " Form2";

export class Form extends Datasource {
    @publish([], "object", "Form payload")
    payload: { (): object; (_: object): Form };

    constructor() {
        super();
    }

    label(): string {
        return `${super.label()}\nForm`;
    }

    hash(): string {
        return hashSum({ id: this.id() });
    }

    refresh(): Promise<void> {
        return Promise.resolve();
    }

    outFields(): IField[] {
        const row0 = this.payload();
        const retVal: IField[] = [];
        for (const key in row0) {
            retVal.push(
                {
                    id: key,
                    label: key,
                    type: typeof row0[key],
                    children: null
                });
        }
        return retVal;
    }

    total(): number {
        return 1;
    }

    protected _fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve([this.payload()].slice(from, from + count));
    }
}
Form.prototype._class += " Form";
