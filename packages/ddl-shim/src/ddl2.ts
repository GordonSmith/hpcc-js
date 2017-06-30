//  Datasources  ================================================================
export interface IWsWorkunit {
    url: string;
}

export interface IWUResult extends IWsWorkunit {
    wuid: string;
    resultName: string;
}

export interface ILogicalFile extends IWsWorkunit {
    name: string;
}

export interface IDatabomb {
    data: string;
}

export type datasource = IWUResult | ILogicalFile | IDatabomb;

//  DDL  ======================================================================
export type DDLSchema2 = datasource[];
