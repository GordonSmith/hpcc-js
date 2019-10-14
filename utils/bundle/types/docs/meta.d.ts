interface TDReference {
    id: number;
    name: string;
    type: "reference";
}
interface TDSource {
    fileName: string;
    line: number;
    character: number;
}
export interface TDNode {
    id: number;
    name: string;
    kind: number;
    kindString: undefined | "External Module" | "Class";
    flags: {
        isExported?: boolean;
    };
    originalName: string;
    children?: TDNode[];
    extendedTypes?: TDReference[];
    sources?: TDSource[];
}
export declare class TSNode {
    readonly _tdNode: TDNode;
    readonly name: string;
    constructor(_tdNode: TDNode);
}
export declare class TSModule extends TSNode {
    readonly _classes: {
        [id: string]: TSClass;
    };
    constructor(tdNode: TDNode);
}
export declare class TSClass extends TSNode {
    constructor(tdNode: TDNode);
    source(): string;
    extends(): string;
    toJSON(): string;
}
export declare class Meta {
    private useCache;
    readonly modules: {
        [id: string]: TSModule;
    };
    private _classes;
    readonly classes: {
        [id: string]: TSClass;
    };
    constructor(useCache?: boolean);
    load(): Promise<this>;
    loadTypeDocCache(): Promise<TDNode>;
    loadTypeDoc(): Promise<TSNode>;
    loadPackageJson(): Promise<any>;
}
export {};
//# sourceMappingURL=meta.d.ts.map