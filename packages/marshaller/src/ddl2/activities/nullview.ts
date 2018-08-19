import { HipiePipeline } from "./hipiepipeline";
import { immFields, ImmFields } from "./immutable";

export class NullView extends HipiePipeline {
    hash(): string {
        return super.hash();
    }

    fieldsFunc(): (inFields: ImmFields) => ImmFields {
        return (inFields: ImmFields) => {
            return immFields();
        };
    }

    _fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve([]);
    }
}
NullView.prototype._class += " NullView";
