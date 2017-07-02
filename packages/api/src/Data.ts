export interface IField {
    label: string;
    type: "string" | "number" | "boolean" | "array";
    children: IField[] | null;
}

export interface IDatasource {
    fields: () => IField[];
    sample: (samples: number, sampleSize: number) => Promise<{ total: number, data: any[] }>;
    fetch: (from: number, count: number) => Promise<{ total: number, data: any[] }>;
    total: () => number;
}
