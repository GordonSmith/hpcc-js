import { PropertyExt } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";

export function schemaRow2IField(row: any): IField {
    return {
        id: row.name,
        label: row.name,
        type: row.type,
        children: (row._children && row._children.length) ? row._children.map(schemaRow2IField) : null
    };
}

export abstract class Activity extends PropertyExt {
    private _sourceActivity: Activity;

    sourceActivity(): Activity;
    sourceActivity(_: Activity): this;
    sourceActivity(_?: Activity): Activity | this {
        if (!arguments.length) return this._sourceActivity;
        this._sourceActivity = _;
        return this;
    }

    hash(more: object = {}): string {
        return hashSum({
            ...more
        });
    }

    refreshMeta(): Promise<void> {
        return this._sourceActivity ? this._sourceActivity.refreshMeta() : Promise.resolve();
    }

    exists(): boolean {
        return true;
    }

    label(): string {
        return this.id();
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

    exec(): Promise<void> {
        return this._sourceActivity ? this._sourceActivity.exec() : Promise.resolve();
    }

    pullData(): any[] {
        return this._sourceActivity ? this._sourceActivity.pullData() : [];
    }
}

export class DatasourceAdapt implements IDatasource {
    _activity: Activity;

    constructor(activity: Activity) {
        this._activity = activity;
    }

    id(): string {
        return this._activity.id();
    }
    hash(): string {
        return this._activity.hash();
    }
    label(): string {
        return this._activity.label();
    }
    outFields(): IField[] {
        return this._activity.outFields();
    }
    total(): number {
        return this._activity.pullData().length;
    }
    fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve(this._activity.pullData().slice(from, from + count));
    }
}
