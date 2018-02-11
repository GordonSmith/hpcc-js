import { nest as d3Nest } from "d3-collection";
import { csvFormatRows as d3CsvFormatRows, csvParse as d3CsvParse, tsvFormatRows as d3TsvFormatRows, tsvParse as d3TsvParse } from "d3-dsv";

export type IFieldType = "undefined" | "string" | "number" | "boolean" | "object";
export interface IField {
    label: string;
    type: IFieldType;
    fields?: IField[];
}

export interface IDatasource {
    fields(_: IField[]): this;
    fields(): ReadonlyArray<IField>;

    json(_: object[]): this;
    json(): ReadonlyArray<object>;

    length(): number;

    sort(compareFn?: (l: object, r: object) => number): ReadonlyArray<object>;

    //  legacy  (TODO Remove)  ---
    legacyColumns(_: string[], asDefault?: boolean): this;
    legacyColumns(): string[];

    legacyData(_: any, asDefault?: boolean): this;
    legacyData(): any;

    parsedData(): any;
    formattedData(): any;

    csv(): string;
    tsv(): string;
}

export type CellType = undefined | string | number | boolean | CellArrayType;
export interface CellArrayType extends Array<CellType> {
}
export type DataType = CellArrayType[];

export type ColumnType = string | ColumnArrayType;
export interface ColumnArrayType extends Array<ColumnType> {
    __hpcc_label?: string;
}

/*
    //  import/export  ---
    json(_: string): this;
    json(): string;
    jsonObj(_: object[]): this;
    jsonObj(): object[];
    csv(_: string): this;
    csv(): string;
    tsv(_: string): this;
    tsv(): string;
*/

export function toFields(row: object): IField[] {
    if (!row) return [];
    const retVal: IField[] = [];
    for (const key in row) {
        const field: IField = {
            label: key,
            type: typeof row[key] as IFieldType
        };
        if (field.type === "object") {
            field.fields = toFields(row[key]);
        }
        retVal.push(field);
    }
    return retVal;
}

export function columns2Fields(columns: ColumnArrayType): IField[] {
    if (!columns) return [];
    const retVal: IField[] = [];
    for (const column of columns) {
        if (typeof column === "string") {
            retVal.push({
                label: column,
                type: "undefined"
            });
        } else {
            retVal.push({
                label: column.__hpcc_label || "",
                type: "object",
                fields: columns2Fields(column)
            });
        }
    }
    return retVal;
}

export function toColumns(fields: ReadonlyArray<IField>, __hpcc_label?: string): ColumnArrayType {
    if (!fields) return [];
    const retVal: ColumnArrayType = [];
    retVal.__hpcc_label = __hpcc_label;
    for (const field of fields) {
        switch (field.type) {
            case "object":
                retVal.push(toColumns(field.fields, field.label));
                break;
            default:
                retVal.push(field.label);
        }
    }
    return retVal;
}

export function toData(fields: ReadonlyArray<IField>, json: ReadonlyArray<object>): DataType {
    const retVal: DataType = json.map(obj => {
        const row: CellArrayType = [];
        for (const field of fields) {
            switch (field.type) {
                case "object":
                    row.push(toData(field.fields, obj[field.label]));
                    break;
                default:
                    row.push(obj[field.label]);
            }
        }
        return row;
    });
    return retVal;
}

export function toJson(fields: ReadonlyArray<IField>, data: DataType): object[] {
    const retVal: object[] = data.map(cells => {
        const row: object = {};
        for (let i = 0; i < fields.length; ++i) {
            const field = fields[i];
            switch (field.type) {
                case "object":
                    row[field.label] = toJson(field.fields, cells[i] as DataType);
                    break;
                default:
                    row[field.label] = cells[i];
            }
        }
        return row;
    });
    return retVal;
}

export function rollup(ds: IDatasource, fields: ReadonlyArray<IField>, rollupFunc?: (values: any) => any) {
    const rollup = rollupFunc || function (d) { return d; };

    const nest = d3Nest();
    this._columnIndicies.forEach(function (idx) {
        nest.key(function (d) {
            return d[idx];
        });
    });
    this._nest = nest
        .rollup(rollup)
        ;
}

export class Memory implements IDatasource {

    private _fields: IField[] = [];
    private _json: object[] = [];

    constructor() {
    }

    fields(_: IField[]): this;
    fields(): ReadonlyArray<IField>;
    fields(_?: IField[]): this | ReadonlyArray<IField> {
        if (_ === void 0) return this._fields;
        this._fields = _;
        return this;
    }

    json(_: object[]): this;
    json(): ReadonlyArray<object>;
    json(_?: object[]): this | ReadonlyArray<object> {
        if (_ === void 0) return this._json;
        this._json = _;
        return this;
    }

    length(): number {
        return this._json.length;
    }

    sort(compareFn?: (l: object, r: object) => number): ReadonlyArray<object> {
        return this._json.sort(compareFn);
    }

    columns(_: ColumnArrayType): this;
    columns(): ColumnArrayType;
    columns(_?: ColumnArrayType): this | ColumnArrayType {
        if (_ === void 0) return toColumns(this.fields());
        this.fields(columns2Fields(_));
        return this;
    }

    legacyColumns(_: string[]): this;
    legacyColumns(): string[];
    legacyColumns(_?: string[]): this | string[] {
        if (_ === void 0) return this.fields().map(f => f.label);
        this.fields(_.map(col => {
            return {
                label: col,
                type: "undefined"
            } as IField;
        }));
        return this;
    }

    data(_: DataType): this;
    data(): DataType;
    data(_?: DataType): this | DataType {
        if (_ === void 0) return toData(this.fields(), this.json());
        this.json(toJson(this.fields(), _));
        return this;
    }

    legacyData(_: any): this;
    legacyData(): any;
    legacyData(_?: any): this | any {
        if (_ === void 0) return this.data();
        this.data(_);
        return this;
    }

    spreadsheet(): any[] {
        return this.legacyColumns().concat(this.legacyData());
    }

    parsedData() {
        return this.legacyData();
    }

    formattedData() {
        return this.legacyData();
    }

    csv(_: string): this;
    csv(): string;
    csv(_?): this | string {
        if (!arguments.length) return d3CsvFormatRows(this.spreadsheet());
        this.json(d3CsvParse(_));
        return this;
    }

    tsv(_: string): this;
    tsv(): string;
    tsv(_?): this | string {
        if (!arguments.length) return d3TsvFormatRows(this.spreadsheet());
        this.json(d3TsvParse(_));
        return this;
    }

}
