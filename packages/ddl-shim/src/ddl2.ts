//  Datasources  ================================================================
export interface IImplementation {
    type: string;
    id: string;
}

export interface IWsWorkunit extends IImplementation {
    url: string;
}

export interface IWUResult extends IWsWorkunit {
    wuid: string;
    resultName: string;
}

export interface ILogicalFile extends IWsWorkunit {
    name: string;
}

export interface IDatabomb extends IImplementation {
    data: [{ [key: string]: any }];
}

export type datasource = IWUResult | ILogicalFile | IDatabomb;

//  DDL  ======================================================================
export interface DDLSchema2 extends IImplementation {
    datasources: datasource[];
}
