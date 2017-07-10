import { publish } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { Datasource } from "./Datasource";

export class Databomb extends Datasource implements IDatasource {
    @publish([], "array", "Databomb payload")
    payload: { (): any[]; (_: any[]): Databomb };

    label(): string {
        return "Databomb";
    }

    hash(): string {
        return hashSum({ label: this.label() });
    }

    refresh(): Promise<void> {
        return Promise.resolve();
    }

    fields(): IField[] {
        if (this.payload().length) {
            const retVal: IField[] = [];
            const row0 = this.payload()[0];
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

    fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve(this.payload().filter((row, idx) => idx >= from && idx < from + count));
    }

    total(): number {
        return this.payload().length;
    }
}
Databomb.prototype._class += " Databomb";

export class NullDatasource extends Databomb {
    label(): string {
        return "null";
    }
}
