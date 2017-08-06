import { PropertyExt } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";

export abstract class Activity extends PropertyExt implements IDatasource {
    protected _sourceActivity: Activity;

    sourceActivity(): Activity;
    sourceActivity(_: Activity): this;
    sourceActivity(_?: Activity): Activity | this {
        if (!arguments.length) return this._sourceActivity;
        this._sourceActivity = _;
        return this;
    }

    inFields(): IField[] {
        return this._sourceActivity.outFields();
    }

    outFields(): IField[] {
        return this.inFields();
    }

    process(): any[] {
        return this._sourceActivity.process();
    }

    exec(): Promise<void> {
        return this._sourceActivity.exec();
    }

    //  IDatasource  ---
    abstract hash(): string;
    label(): string {
        return this.id();
    }
    total(): number {
        return this.process().length;

    }
    async fetch(from: number, count: number): Promise<any[]> {
        await this.exec();
        return this.process().slice(from, from + count);
    }
}
