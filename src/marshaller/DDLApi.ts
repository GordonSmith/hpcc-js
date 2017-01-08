type StringStringDict = { [key: string]: string; }

//  Datasource  ===============================================================
export interface IOutput {
    id: string;
    from: string;
    filter: string[];
    notify: string[];
}

export interface IDatasource {
    id: string;
    databomb: boolean;
    WUID: boolean;
    URL: string;
    filter: string[];
    outputs: IOutput[];
}

//  Event  ====================================================================
export interface IEventUpdate {
    visualization: string;
    instance: string;
    datasource: string;
    col: string;
    merge: boolean;
    mappings: StringStringDict;
}

export interface IEvent {
    mappings: StringStringDict;
    updates: IEventUpdate[];
}

//  Mappings  =================================================================
export interface IPieMapping {
    label: string;
    weight: string;
};

export interface ILineMapping {
    x: string[];
    y: string[];
}

export interface ITableMapping {
    value: string[];
}

export interface IChoroMapping {
    weight: string | string[];
}

export interface IChoroUSStateMapping extends IChoroMapping {
    state: string;
}

export interface IChoroUSCountyMapping extends IChoroMapping {
    county: string;
}

export interface IChoroGeohashMapping extends IChoroMapping {
    geohash: string;
}

//  TODO  ---
export interface IGraphMapping {
    uid: string;
    label: string;
    weight: string;
    flags: string;
}

export interface IGraphLinkMapping {
    uid: string;
}

//  Source  ===================================================================
export interface ISource {
    id: string;
    output: string;
    sort: string[];
    first: number;
    reverse: boolean;
    properties?: StringStringDict;  //  TODO Needed?
}

export interface IPieSource extends ISource {
    mappings: IPieMapping;
}

export interface ILineSource extends ISource {
    mappings: ILineMapping;
}

export interface ITableSource extends ISource {
    mappings: ITableMapping;
}

export interface IGraphLink {
    mappings: IGraphLinkMapping;
    childfile: string;
}

export interface IGraphSource extends ISource {
    mappings: IGraphMapping;
    link: IGraphLink;
}

export interface IChoroSource extends ISource {
    mappings: IAnyChoroMapping;
}

//  Visualization  ============================================================
export type VisualizationType = "PIE" | "LINE" | "BAR" | "TABLE" | "CHORO" | "GRAPH" | "HEAT_MAP" | "SLIDER" | "FORM" | "2DCHART" | "WORD_CLOUD" | "BUBBLE";
export interface IVisualization {
    type: VisualizationType;
    id: string;
    title: string;
    properties: {
        charttype: string,

        //  TODO Split Known Properties  ---
        [key: string]: string
    };
    events: { [key: string]: IEvent };

    //  TODO Functions / Databomb? ---
    fields?: any[];
}

export interface IPieVisualization extends IVisualization {
    source: IPieSource;
}

export interface ILineVisualization extends IVisualization {
    source: ILineSource;
}

export type ChoroColor = "default" | "YlGn" | "YlGnBu" | "GnBu" | "BuGn" | "PuBuGn" | "PuBu" | "BuPu" | "RdPu" | "PuRd" | "OrRd" | "YlOrRd" | "YlOrBr" | "Purples" | "Blues" | "Greens" | "Oranges" | "Reds" | "Greys" | "PuOr" | "BrBG" | "PRGn" | "PiYG" | "RdBu" | "RdGy" | "RdYlBu" | "Spectral" | "RdYlGn" | "RdWhGr";
export interface IChoroVisualization extends IVisualization {
    source: IChoroSource;

    visualizations?: IChoroVisualization[];
    color: ChoroColor;
}

export interface ITableVisualization extends IVisualization {
    label: string[];
    source: ITableSource;
}

export interface ISliderVisualization extends IVisualization {
    range?: number[];
}

export interface IGraphVisualization extends IVisualization {
    source: IGraphSource;

    label: string[];
    icon: any;      //  TODO
    flag: any[];    //  TODO
}

//  Dashboard  ================================================================
export interface IDashboard {
    id: string;
    title: string;
    visualizations: IAnyVisualization[];
    datasources: IDatasource[];
}

//  Helpers  ==================================================================
export type IAnyChoroMapping = IChoroUSStateMapping | IChoroUSCountyMapping | IChoroGeohashMapping;
export type IAnyMapping = IPieMapping | ILineMapping | IGraphMapping | IAnyChoroMapping | ITableMapping;
export type IAnySource = IPieSource | ILineSource | ITableSource | IChoroSource | IGraphSource;
export type IAnyVisualization = IPieVisualization | ILineVisualization | ITableVisualization | IChoroVisualization | IGraphVisualization;
