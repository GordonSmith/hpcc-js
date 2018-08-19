import { DDL2 } from "@hpcc-js/ddl-shim";
import { fromJS, List, Map } from "immutable";

export type ImmFields = List<DDL2.IField>;
export function immFields(_: DDL2.IField[] = []): ImmFields {
    return fromJS(_);
}
export type ImmRow = Map<any, any>;
export type ImmData = List<ImmRow>;
export function immData(_: object[] = []): ImmData {
    return fromJS(_);
}
export interface ImmDB {
    fields: ImmFields;
    data: ImmData;
}
export function immDB(fields?: ImmFields | DDL2.IField[], data?: ImmData | object[]): ImmDB {
    return {
        fields: fields instanceof List ? fields as ImmFields : immFields(fields as DDL2.IField[]),
        data: data instanceof List ? data as ImmData : immData(data as object[])
    };
}
