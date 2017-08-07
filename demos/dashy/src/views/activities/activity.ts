import { PropertyExt } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { RuleType } from "./filter";

export interface IOptimization {
    filters?: Array<{ fieldid: string, value: any, rule: RuleType }>;
}

export abstract class Activity extends PropertyExt implements IDatasource {
    private _sourceActivity: Activity;

    sourceActivity(): Activity;
    sourceActivity(_: Activity): this;
    sourceActivity(_?: Activity): Activity | this {
        if (!arguments.length) return this._sourceActivity;
        this._sourceActivity = _;
        return this;
    }

    inFields(): IField[] {
        return this._sourceActivity ? this._sourceActivity.outFields() : [];
    }

    outFields(): IField[] {
        return this.inFields();
    }

    pullData(): any[] {
        return this._sourceActivity ? this._sourceActivity.pullData() : [];
    }

    exec(opts: IOptimization = {}): Promise<void> {
        return this._sourceActivity ? this._sourceActivity.exec(opts) : Promise.resolve();
    }

    //  IDatasource  ---
    abstract hash(): string;
    label(): string {
        return this.id();
    }

    total(): number {
        return this.pullData().length;

    }
    async fetch(from: number, count: number): Promise<any[]> {
        await this.exec();
        return this.pullData().slice(from, from + count);
    }
}
