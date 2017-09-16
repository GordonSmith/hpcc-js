// import { ChartPanel } from "@hpcc-js/composite";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { Databomb, Form } from "../views/activities/databomb";
import { Filters } from "../views/activities/filter";
import { GroupBy } from "../views/activities/groupby";
import { LogicalFile } from "../views/activities/logicalfile";
import { Project } from "../views/activities/project";
import { RoxieService } from "../views/activities/roxie";
import { Sort } from "../views/activities/sort";
import { WUResult } from "../views/activities/wuresult";
// import { View } from "../views/view";
import { Dashboard } from "./dashboard";
// import { Viz } from "./viz";

export { DDL2 };

export class DDLAdapter {
    private _dashboard: Dashboard;
    private _dsDedup: { [key: string]: string };

    constructor(dashboard: Dashboard) {
        this._dashboard = dashboard;
    }

    /*

    createDDLFilters(view: View): IFilter[] {
        const retVal: IFilter[] = [];
        for (const filter of view.filters().validFilters()) {
            for (const mapping of filter.validMappings()) {
                retVal.push({
                    nullable: filter.nullable(),
                    fieldid: mapping.localField(),
                    rule: mapping.condition() as IFilterRule
                });
            }
        }
        return retVal;
    }

    createDDLOutputs(ds: any): IOutput[] {
        const retVal: IOutput[] = [];
        for (const viz of this._dashboard.visualizations()) {
            const view = viz.view();
            const vizDs = viz.view().dataSource();
            if (ds.hash() === vizDs.hash()) {
                retVal.push({
                    id: view.label(),
                    from: ds instanceof WUResult ? ds.resultName() : view.id(),
                    filter: this.createDDLFilters(view)
                });
            }
        }
        return retVal;
    }

    createDDLEvents(viz: Viz): { [key: string]: IEvent } {
        const retVal: { [key: string]: IEvent } = {};
        retVal["click"] = {
            updates: []
        };
        const updates = retVal["click"].updates;
        for (const updatesViz of this._dashboard.visualizations()) {
            for (const filter of updatesViz.view().filters().validFilters()) {
                if (filter.source() === viz.id()) {
                    const eventUpdate: IEventUpdate = {
                        visualization: updatesViz.id(),
                        datasource: updatesViz.view().dataSource().id(),
                        merge: false,
                        mappings: {}
                    };
                    updates.push(eventUpdate);
                    for (const mapping of filter.validMappings()) {
                        eventUpdate.mappings[mapping.remoteField()] = mapping.localField();
                    }
                }
            }
        }
        return retVal;
    }

    createDDLVisualizations(): ITableVisualization[] {
        return this._dashboard.visualizations().map(viz => {
            const widget = viz.widget();
            const view = viz.view();
            const ds = view.dataSource();
            let sourceOutput = "";
            if (ds instanceof WUResult) {
                sourceOutput = (ds as WUResult).resultName();
            }
            return {
                id: viz.id(),
                title: viz.view().label(),
                type: "TABLE" as VisualizationType,
                label: view.outFields().map(field => field.id),
                source: {
                    id: view.dataSource().id(),
                    output: sourceOutput,
                    mappings: {
                        value: view.outFields().map(field => field.id)
                    }
                },
                events: this.createDDLEvents(viz),
                properties: {
                    chartType: widget instanceof ChartPanel ? widget.chartType() : ""
                } as StringStringDict
            } as ITableVisualization;
        });
    }
    */

    writeDDLDatasource(ds): DDL2.DatasourceType {
        const dsDetails = ds.details();
        if (dsDetails instanceof WUResult) {
            const ddl: DDL2.IWUResult = {
                type: "wuresult",
                id: ds.id(),
                url: dsDetails.url(),
                wuid: dsDetails.wuid(),
                resultName: dsDetails.resultName()
            };
            return ddl;
        } else if (dsDetails instanceof LogicalFile) {
            const ddl: DDL2.ILogicalFile = {
                type: "logicalfile",
                id: ds.id(),
                url: dsDetails.url(),
                logicalFile: dsDetails.logicalFile()
            };
            return ddl;
        } else if (dsDetails instanceof Form) {
            const ddl: DDL2.IForm = {
                type: "form",
                id: ds.id(),
                fields: dsDetails.outFields().map((field): DDL2.IField => {
                    return {
                        id: field.id,
                        type: field.type as any,
                        default: ""
                    };
                })
            };
            return ddl;
        } else if (dsDetails instanceof Databomb) {
            const ddl: DDL2.IDatabomb = {
                type: "databomb",
                id: ds.id(),
                data: []
            };
            return ddl;
        } else if (dsDetails instanceof RoxieService) {
            const ddl: DDL2.IRoxieService = {
                type: "roxieservice",
                id: ds.id(),
                url: dsDetails.url(),
                querySet: dsDetails.querySet(),
                queryID: dsDetails.queryId(),
            };
            return ddl;
        }
        return undefined;
    }

    writeDDLDatasources(): DDL2.DatasourceType[] {
        const retVal: DDL2.DatasourceType[] = [];
        for (const viz of this._dashboard.visualizations()) {
            const ds = viz.view().dataSource();
            if (!this._dsDedup[ds.hash()]) {
                this._dsDedup[ds.hash()] = ds.id();
                retVal.push(this.writeDDLDatasource(ds));
            }
        }
        return retVal;
    }

    writeFilters(filters: Filters): DDL2.IFilter[] {
        return filters.validFilters().map(filter => {
            return {
                viewID: filter.source(),
                nullable: filter.nullable(),
                mappings: filter.validMappings().map(mapping => {
                    return {
                        remoteFieldID: mapping.remoteField(),
                        localFieldID: mapping.localField(),
                        condition: mapping.condition()
                    } as DDL2.IMapping;
                })
            } as DDL2.IFilter;
        });
    }

    writePreProject(project: Project): DDL2.ProjectType[] {
        return project.validComputedFields().map(cf => {
            if (cf.type() === "scale") {
                return {
                    fieldID: cf.label(),
                    type: "scale" as any,
                    param1: cf.column1(),
                    factor: cf.constValue()
                };
            } else {
                return {
                    fieldID: cf.label(),
                    type: cf.type() as any,
                    param1: cf.column1(),
                    param2: cf.column2()
                };
            }
        });
    }

    writeGroupBys(gb: GroupBy): DDL2.IGroupBy {
        return {
            fields: gb.validGroupBy().map(col => col.label()),
            aggregates: gb.validComputedFields().map((cf): DDL2.AggregateType => {
                if (cf.aggrType() === "count") {
                    return {
                        type: "count"
                    };
                }
                return {
                    type: cf.aggrType() as any,
                    fieldID: cf.aggrColumn()
                };
            })
        };
    }

    writeSort(sort: Sort): DDL2.ISort[] {
        return sort.validSortBy().map((sortBy): DDL2.ISort => {
            return {
                fieldID: sortBy.fieldID(),
                descending: sortBy.descending()
            };
        });
    }

    writeDDLViews(): DDL2.IView[] {
        return this._dashboard.visualizations().map(viz => {
            const ds = viz.view().dataSource();
            const filters = this.writeFilters(viz.view().filters());
            const preProject = this.writePreProject(viz.view().project());
            const groupBy = this.writeGroupBys(viz.view().groupBy());
            const sort = this.writeSort(viz.view().sort());
            return {
                id: viz.id(),
                datasourceID: this._dsDedup[ds.hash()],
                filters: filters.length ? filters : undefined,
                preProject: preProject.length ? preProject : undefined,
                groupBy: (groupBy.fields.length && groupBy.aggregates.length) ? groupBy : undefined,
                sort: sort.length ? sort : undefined,
                limit: viz.view().limit().rows()
            };
        });
    }

    write(): DDL2.Schema {
        this._dsDedup = {};
        return {
            datasources: this.writeDDLDatasources(),
            views: this.writeDDLViews()
        };
    }
}
