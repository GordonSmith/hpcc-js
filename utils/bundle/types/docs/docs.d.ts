import { Meta } from "./meta";
export declare class MDFile {
    readonly filePath: string;
    readonly name: string;
    private _meta;
    private _content;
    constructor(filePath: string, meta: Meta);
    clearPlaceholder(tag: string): number;
    updateMeta(): void;
}
export declare class Docs {
    readonly files: {
        [id: string]: MDFile;
    };
    constructor(meta: Meta);
}
//# sourceMappingURL=docs.d.ts.map