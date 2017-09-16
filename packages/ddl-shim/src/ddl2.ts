export type RowType = { [key: string]: any; };

//  Activities  ================================================================
export type IDatasourceType = "wuresult" | "logicalfile" | "form" | "databomb" | "roxieservice" | "hipieservice";
export interface IDatasource {
    type: IDatasourceType;
    id: string;
}

export interface IESPService extends IDatasource {
    url: string;
}

export interface IWUResult extends IESPService {
    type: "wuresult";
    wuid: string;
    resultName: string;
}

export interface ILogicalFile extends IESPService {
    type: "logicalfile";
    logicalFile: string;
}

export interface IRoxieService extends IESPService {
    type: "roxieservice";
    querySet: string;
    queryID: string;
}

export interface IField {
    id: string;
    type: "boolean" | "number" | "string";
    default: any;
}

export interface IForm extends IDatasource {
    type: "form";
    fields: IField[];
}

export interface IDatabomb extends IDatasource {
    type: "databomb";
    data: RowType[];
}

export interface IHipieService extends IDatasource {
    type: "hipieservice";
}

export type DatasourceType = IWUResult | ILogicalFile | IForm | IDatabomb | IRoxieService | IHipieService;

//  View  ================================================================
export interface IMapping {
    remoteFieldID: string;
    localFieldID: string;
    condition: "==" | "!=" | ">" | ">=" | "<" | "<=" | "contains";
}

export interface IFilter {
    viewID: string;
    nullable: boolean;
    mappings: IMapping[];
}

export interface IScale {
    fieldID: string;
    type: "scale";
    param1: string;
    factor: number;
}

export interface ICalculated {
    fieldID: string;
    type: "=" | "+" | "-" | "*" | "/";
    param1: string;
    param2: string;
}

export type ProjectType = IScale | ICalculated;

export interface IAggregate {
    type: "min" | "max" | "sum" | "mean" | "variance" | "deviation";
    fieldID: string;
}

export interface ICount {
    type: "count";
}

export type AggregateType = IAggregate | ICount;

export interface IGroupBy {
    fields: string[];
    aggregates: AggregateType[];
}

export interface ISort {
    fieldID: string;
    descending: boolean;
}

export interface ILimit {
    limit: number;
}

export type ActivityType = IFilter | ProjectType | IGroupBy | ISort | ILimit;

export interface IView {
    id: string;
    activities: ActivityType[];
    datasourceID: string;
    filters?: IFilter[];
    preProject?: ProjectType[];
    groupBy?: IGroupBy;
    sort?: ISort[];
    limit?: number;
}

//  DDL  ======================================================================
export interface Schema {
    datasources: DatasourceType[];
    views: IView[];
}
