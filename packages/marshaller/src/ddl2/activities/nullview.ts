import { DDL2 } from "@hpcc-js/ddl-shim";
import { List } from "immutable";
import { HipiePipeline } from "./hipiepipeline";

export class NullView extends HipiePipeline {
    hash(): string {
        return super.hash();
    }

    fieldsFunc(): (inFields: List<DDL2.IField>) => List<DDL2.IField> {
        return (inFields: List<DDL2.IField>) => {
            return List();
        };
    }

    _fetch(from: number, count: number): Promise<any[]> {
        return Promise.resolve([]);
    }
}
NullView.prototype._class += " NullView";
