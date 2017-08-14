//  Datasources  ================================================================
export interface IImplementation {
    type: string;
    id: string;
}

export interface IESPService extends IImplementation {
    url: string;
}

export interface IWUResult extends IESPService {
    wuid: string;
    resultName: string;
}

export interface ILogicalFile extends IESPService {
    id: string;
}

export interface IQuery extends IESPService {
    set: string;
    id: string;
}

export interface IDatabomb extends IImplementation {
    data: [{ [key: string]: any }];
}

export type datasource = IWUResult | ILogicalFile | IQuery;

//  DDL  ======================================================================
export interface DDLSchema2 extends IImplementation {
    datasources: datasource[];
}
