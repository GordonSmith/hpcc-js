import { MultiChart } from "@hpcc-js/chart";
import { ChartPanel } from "@hpcc-js/composite";
import { IDashboard, IDatasource, IDDL, IEvent, IEventUpdate, IFilter, IFilterRule, IOutput, ITableVisualization, StringStringDict, VisualizationType } from "@hpcc-js/ddl-shim";
import { Databomb } from "../views/activities/databomb";
import { WUResult } from "../views/activities/wuresult";
import { View } from "../views/view";
import { Dashboard } from "./dashboard";
import { Viz } from "./viz";

export class DDLAdapter {
    private _dashboard: Dashboard;

    constructor(dashboard: Dashboard) {
        this._dashboard = dashboard;
    }

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

    createDDLDatasources(): IDatasource[] {
        const dsDedup: { [key: string]: boolean } = {};
        const retVal: IDatasource[] = [];
        for (const viz of this._dashboard.visualizations()) {
            const ds = viz.view().dataSource();
            if (!dsDedup[ds.hash()]) {
                dsDedup[ds.hash()] = true;
                retVal.push({
                    id: ds.id(),
                    databomb: ds instanceof Databomb,
                    WUID: ds instanceof WUResult,
                    outputs: this.createDDLOutputs(ds)
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

    createDDL(): IDDL {
        return {
            dashboards: [{
                visualizations: this.createDDLVisualizations(),
            }],
            datasources: this.createDDLDatasources()
        };
    }
}
