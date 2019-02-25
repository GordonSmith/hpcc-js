import { Cache, DateTime, Duration, exists, StateObject } from "@hpcc-js/util";
import { IConnection, IOptions } from "../connection";
import { EclService, IWsEclRequest, IWsEclResponse, IWsEclResult } from "../services/wsEcl";
import { WorkunitsService, WUQueryDetails, WUQueryGetSummaryStats } from "../services/wsWorkunits";

export interface QueryEx extends WUQueryDetails.Response {
}

class QueryCache extends Cache<QueryEx, Query> {
    constructor() {
        super((obj) => {
            return Cache.hash([obj.QueryId, obj.QuerySet]);
        });
    }
}
const _queries = new QueryCache();

export class Query extends StateObject<QueryEx, QueryEx> implements QueryEx {
    protected connection: EclService;
    // protected _topology: Topology;
    protected _wsWorkunits: WorkunitsService;
    // protected _wu: Workunit;
    protected _requestSchema: IWsEclRequest;
    protected _responseSchema: IWsEclResponse;

    get properties(): WUQueryDetails.Response { return this.get(); }
    get Exceptions(): WUQueryDetails.Exceptions { return this.get("Exceptions"); }
    get QueryId(): string { return this.get("QueryId"); }
    get QuerySet(): string { return this.get("QuerySet"); }
    get QueryName(): string { return this.get("QueryName"); }
    get Wuid(): string { return this.get("Wuid"); }
    get Dll(): string { return this.get("Dll"); }
    get Suspended(): boolean { return this.get("Suspended"); }
    get Activated(): boolean { return this.get("Activated"); }
    get SuspendedBy(): string { return this.get("SuspendedBy"); }
    get Clusters(): WUQueryDetails.Clusters { return this.get("Clusters"); }
    get PublishedBy(): string { return this.get("PublishedBy"); }
    get Comment() { return this.get("Comment"); }
    get LogicalFiles(): WUQueryDetails.LogicalFiles { return this.get("LogicalFiles"); }
    get SuperFiles(): WUQueryDetails.SuperFiles { return this.get("SuperFiles"); }
    get IsLibrary(): boolean { return this.get("IsLibrary"); }
    get Priority(): string { return this.get("Priority"); }
    get WUSnapShot(): string { return this.get("WUSnapShot"); }
    get CompileTime(): string { return this.get("CompileTime"); }
    get LibrariesUsed(): WUQueryDetails.LibrariesUsed { return this.get("LibrariesUsed"); }
    get CountGraphs(): number { return this.get("CountGraphs"); }
    get ResourceURLCount(): number { return this.get("ResourceURLCount"); }
    get WsEclAddresses(): WUQueryDetails.WsEclAddresses { return this.get("WsEclAddresses"); }
    get WUGraphs(): WUQueryDetails.WUGraphs { return this.get("WUGraphs"); }
    get WUTimers(): WUQueryDetails.WUTimers { return this.get("WUTimers"); }

    private constructor(optsConnection: IOptions | IConnection | EclService, querySet: string, queryID: string, queryDetails?: WUQueryDetails.Response) {
        super();
        if (optsConnection instanceof EclService) {
            this.connection = optsConnection;
            this._wsWorkunits = new WorkunitsService(this.connection.opts());
            // this._topology = new Topology(this.connection.opts());
        } else {
            this.connection = new EclService(optsConnection);
            this._wsWorkunits = new WorkunitsService(optsConnection);
            // this._topology = new Topology(optsConnection);
        }
        this.set({
            QuerySet: querySet,
            QueryId: queryID,
            ...queryDetails
        } as QueryEx);
    }

    static attach(optsConnection: IOptions | IConnection, querySet: string, queryId: string): Query {
        const retVal: Query = _queries.get({ QuerySet: querySet, QueryId: queryId } as WUQueryDetails.Response, () => {
            return new Query(optsConnection, querySet, queryId);
        });
        return retVal;
    }

    private async fetchRequestSchema(): Promise<void> {
        this._requestSchema = await this.connection.requestJson(this.QuerySet, this.QueryId);
    }

    private async fetchResponseSchema(): Promise<void> {
        this._responseSchema = await this.connection.responseJson(this.QuerySet, this.QueryId);
    }

    private async fetchSchema(): Promise<void> {
        await Promise.all([this.fetchRequestSchema(), this.fetchResponseSchema()]);
    }

    submit(request: object): Promise<Array<{ [key: string]: object[] }>> {
        return this.connection.submit(this.QuerySet, this.QueryId, request).then(results => {
            for (const key in results) {
                results[key] = results[key].Row;
            }
            return results;
        });
    }

    async refresh(): Promise<this> {
        return this.fetchSchema().then(schema => this);
    }

    requestFields(): IWsEclRequest {
        if (!this._requestSchema) return [];
        return this._requestSchema;
    }

    responseFields(): IWsEclResponse {
        if (!this._responseSchema) return {};
        return this._responseSchema;
    }

    resultNames(): string[] {
        const retVal: string[] = [];
        for (const key in this.responseFields()) {
            retVal.push(key);
        }
        return retVal;
    }

    resultFields(resultName: string): IWsEclResult {
        if (!this._responseSchema[resultName]) return [];
        return this._responseSchema[resultName];
    }

    private _fetchSummaryStats(from?: DateTime, to?: DateTime): Promise<WUQueryGetSummaryStats.QuerySummaryStat> {
        return this._wsWorkunits.WUQueryGetSummaryStats({
            Target: this.QuerySet,
            QueryId: this.QueryId,
            FromTime: from ? from.utc() : undefined,
            ToTime: to ? to.utc() : undefined
        }).then(response => {
            if (exists("StatsList.QuerySummaryStats", response)) {
                return response.StatsList.QuerySummaryStats[0];
            }
        });
    }

    fetchSummaryStats(from?: DateTime, to?: DateTime, groupBy: "ALL" | "DAY" | "HOUR" = "ALL"): Promise<WUQueryGetSummaryStats.QuerySummaryStat[]> {
        const promises: Array<Promise<WUQueryGetSummaryStats.QuerySummaryStat>> = [];
        switch (groupBy) {
            case "DAY":
                for (const i = from.clone().clipDay(); i.isLessEqual(to); i.add(Duration.days(1))) {
                    promises.push(this._fetchSummaryStats(i, i.clone().addDay(1)));
                }
                return Promise.all(promises);
            case "HOUR":
                for (const i = from.clone().clipHour(); i.isLessEqual(to); i.add(Duration.hours(1))) {
                    promises.push(this._fetchSummaryStats(i, i.clone().addHour(1)));
                }
                return Promise.all(promises);
            case "ALL":
            default:
                return this._fetchSummaryStats().then(response => [response]);
        }
    }

    /*
    fetchDaySummaryStatsXXX(day: DateTime): Promise<WUQueryGetSummaryStats.QuerySummaryStat> {
        const from = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const to = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        return this._fetchSummaryStats(from, to);
    }
    */
    /*
 
     fetchLastNDaysSummaryStats(startDay: Date, n: number = 1): Promise<WUQueryGetSummaryStats.QuerySummaryStat[]> {
         const promises: Array<Promise<WUQueryGetSummaryStats.QuerySummaryStat>> = [];
         for (let i = 0; i < n; ++i) {
             promises.push(this.fetchDaySummaryStatsXXX(new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() - i)));
         }
         return Promise.all(promises);
     }
     */
    /*
     fetchDaySummaryStats(begin: Date, end: Date): Promise<WUQueryGetSummaryStats.QuerySummaryStat> {
         const promises = [];
         for (const i: Date = begin; i < end; i.setDate(i.getDate() + 1)) {
             const next = new Date(i.toString).setDate(i.getDate() + 1);
             promises.push(this._fetchSummaryStats(i))
         }
     }
     */
    /*
     fetchHourSummaryStats(hour: Date): Promise<WUQueryGetSummaryStats.QuerySummaryStat> {
         const from = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours());
         const to = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours() + 1);
         return this._fetchSummaryStats(from, to);
     }
     */
    /*
     fetch24HourSummaryStats(day: Date): Promise<WUQueryGetSummaryStats.QuerySummaryStat[]> {
         const promises: Array<Promise<WUQueryGetSummaryStats.QuerySummaryStat>> = [];
         for (let i = 0; i < 24; ++i) {
             promises.push(this.fetchHourSummaryStats(new Date(day.getFullYear(), day.getMonth(), day.getDate(), i)));
         }
         return Promise.all(promises);
     }
     */
    /*
     fetchSummaryStates(from: Date, to: Date, groupBy: "ALL" | "DAY" | "HOUR" = "ALL", groupBySize = 1): Promise<WUQueryGetSummaryStats.QuerySummaryStat> {
         switch (groupBy) {
             case "ALL":
                 return this._fetchSummaryStats(from, to);
             case "DAY":
 
         }
     }
     */
    /*
     protected WUQueryDetails(): Promise<WUQueryDetails.Response> {
         const request: WUQueryDetails.Request = {} as WUQueryDetails.Request;
         request.QueryId = this.QueryId;
         request.QuerySet = this.QuerySet;
         request.IncludeSuperFiles = true;
         request.IncludeStateOnClusters = true;
         return this.connection.WUQueryDetails(request).then((response) => {
             this.set(response);
             return response;
         });
     }
     */
}
