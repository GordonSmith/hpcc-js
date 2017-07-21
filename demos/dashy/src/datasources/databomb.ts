import { publish } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Datasource } from "./datasource";

export class Databomb extends Datasource {
    @publish([], "array", "Databomb payload")
    payload: { (): any[]; (_: any[]): Databomb };

    constructor() {
        super();
    }

    label(): string {
        return `${super.label()}\nDatabomb`;
    }

    hash(): string {
        return hashSum({ id: this.id() });
    }

    refresh(): Promise<void> {
        return Promise.resolve();
    }

    outFields(): IField[] {
        for (const row0 of this.payload()) {
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
        return [];
    }

    total(): number {
        return this.payload().length;
    }

    protected _fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve(this.payload().slice(from, from + count));
    }
}
Databomb.prototype._class += " Databomb";

export class NullDatasource extends Databomb {
    constructor() {
        super();
    }

    label(): string {
        return "null";
    }
}
