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

    exists(): boolean {
        return true;
    }

    refreshMeta(): Promise<void> {
        return this._sourceActivity ? this._sourceActivity.refreshMeta() : Promise.resolve();
    }

    updatedBy(): string[] {
        return [];
    }

    inFields(): IField[] {
        return this._sourceActivity ? this._sourceActivity.outFields() : [];
    }

    filterFields(): IField[] {
        return this.inFields();
    }

    outFields(): IField[] {
        return this.inFields();
    }

    exec(opts: IOptimization = {}): Promise<void> {
        return this._sourceActivity ? this._sourceActivity.exec(opts) : Promise.resolve();
    }

    pullData(): any[] {
        return this._sourceActivity ? this._sourceActivity.pullData() : [];
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
