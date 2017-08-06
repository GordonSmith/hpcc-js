import { PropertyExt } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";

export class Activity extends PropertyExt {
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
}
