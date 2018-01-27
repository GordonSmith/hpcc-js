import { JSEditor, JSONEditor } from "@hpcc-js/codemirror";
import { PropertyExt, Widget } from "@hpcc-js/common";
import { Connection, hookSend, IOptions, ResponseType, Result, SendFunc, serializeRequest } from "@hpcc-js/comms";
import { DDL1, ddl2Schema } from "@hpcc-js/ddl-shim";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { Activity, Dashboard, DatasourceAdapt, DDLEditor, Element, ElementContainer, GraphAdapter, JavaScriptAdapter, upgrade } from "@hpcc-js/marshaller";
import { Comms } from "@hpcc-js/other";
import { PropertyEditor } from "@hpcc-js/other";
import { SplitPanel, TabPanel } from "@hpcc-js/phosphor";
import { CommandPalette, CommandRegistry, ContextMenu } from "@hpcc-js/phosphor-shim";
import { scopedLogger } from "@hpcc-js/util";
import { debugUpgrade, upgrade as ddlUpgrade } from "./ddlUpgrade";
import { ddl } from "./sampleddl";

const logger = scopedLogger("index.ts");

export function doHook() {
    const origSend = hookSend((opts: IOptions, action: string, request: any, responseType: ResponseType): Promise<any> => {
        if (opts.baseUrl === "https://webmiscdev.risk.regn.net") {
            return origSend(opts, action, request, responseType);
        }
        let newUrl = "";
        if (opts.baseUrl.split("").reverse()[0] === "/" || action[0] === "/") {
            newUrl = btoa(`${opts.baseUrl}${action}?${serializeRequest(request)}`);
        } else {
            newUrl = btoa(`${opts.baseUrl}/${action}?${serializeRequest(request)}`);
        }
        const connection = new Connection({ baseUrl: "https://webmiscdev.risk.regn.net", type: "get" });
        return connection.send("brundajx/DASH2/demos/dashy/bis_proxy.php", { encoded: newUrl }, responseType).then(response => {
            return response;
        }).catch(e => {
            throw e;
        });
    });
}
if (window.location.origin.indexOf("http") === 0) {
    // doHook();
}

// const test = upgrade("http://10.173.147.1:8010/WsWorkunits/WUResult.json?Wuid=W20170905-105711&ResultName=pro2_Comp_Ins122_DDL", JSON.stringify(ddl));

export class App {
    private _elementContainer: ElementContainer = new ElementContainer();

    private _splitMain = new SplitPanel("horizontal");

    private _tabLHS = new TabPanel();
    private _dashboard: Dashboard = new Dashboard(this._elementContainer)
        .on("vizActivation", (viz: Element) => {
            this.selectionChanged(viz);
        })
        .on("vizStateChanged", (viz: Element) => {
            for (const filteredViz of this._elementContainer.filteredBy(viz)) {
                if (this._currViz === filteredViz) {
                    this.refreshPreview();
                }
            }
        })
        ;
    private _graphAdapter = new GraphAdapter(this._elementContainer);
    private _javaScripAdapter = new JavaScriptAdapter(this._dashboard);
    private _pipeline: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row: any, col: string, sel: boolean, ext: any) => {
            const obj = row.__lparam[0];
            this.selectionChanged(obj.viz, obj.activity);
        })
        .on("vertex_contextmenu", (row: any, col: string, sel: boolean, ext: any) => {
        })
        ;

    private _tabDDL = new TabPanel();
    private _ddlSchema = new JSONEditor().json(ddl2Schema);
    private _ddlEditor = new DDLEditor();
    private _jsEditor = new JSEditor();
    private _layoutEditor = new JSONEditor();
    private _ddlv1 = new JSONEditor();
    private _ddlv2 = new JSONEditor();

    private _tabRHS = new TabPanel();
    private _splitData = new SplitPanel();
    private _dataProperties: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(false)
        ;
    private _preview = new DatasourceTable();
    private _vizProperties: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(false)
        ;
    private _stateProperties: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(false)
        ;
    private _cloneEC: ElementContainer = new ElementContainer();
    private _clone: Dashboard = new Dashboard(this._cloneEC);

    constructor(placeholder: string) {
        // app = this;
        this._splitMain
            .target(placeholder)
            .addWidget(this._tabLHS)
            .addWidget(this._tabRHS)
            ;
        this._tabLHS
            .addWidget(this._dashboard, "Dashboard")
            .addWidget(this._pipeline, "Pipeline")
            .addWidget(this._tabDDL, "DDL")
            .on("childActivation", (w: Widget) => {
                switch (w) {
                    case this._dashboard:
                        this.selectionChanged(this._currViz);
                        break;
                    case this._pipeline:
                        this.loadGraph(true);
                        break;
                    case this._tabDDL:
                        this._tabDDL.childActivation(this._tabDDL.active());
                        break;
                }
            })
            ;
        this._tabDDL
            .addWidget(this._ddlSchema, "Schema")
            .addWidget(this._ddlEditor, "v2")
            .addWidget(this._jsEditor, "TS")
            .addWidget(this._layoutEditor, "Layout")
            .on("childActivation", (w: Widget) => {
                switch (w) {
                    case this._ddlEditor:
                        this.loadDDL(true);
                        break;
                    case this._jsEditor:
                        this.loadJavaScript(true);
                        break;
                    case this._layoutEditor:
                        this.loadLayout(true);
                        break;
                }
            })
            ;
        this._tabRHS
            .addWidget(this._splitData, "Data")
            .addWidget(this._vizProperties, "Widget")
            .addWidget(this._stateProperties, "State")
            .addWidget(this._clone, "Clone")
            .on("childActivation", (w: Widget) => {
                switch (w) {
                    case this._clone:
                        this.loadClone();
                        break;
                }
            })
            ;
        this._splitData
            .addWidget(this._dataProperties)
            .addWidget(this._preview)
            ;
        this._splitMain
            .lazyRender()
            ;
        this.initMenu();
        this._dataProperties.monitor((id: string, newValue: any, oldValue: any, source: PropertyExt) => {
            if (source !== this._dataProperties && this._currViz) {
                this._currViz.refresh().then(() => {
                    this.refreshPreview();
                });
                switch (this._tabLHS.active()) {
                    case this._dashboard:
                        break;
                    case this._pipeline:
                        setTimeout(() => {
                            this.loadGraph(true);
                        }, 500);
                        break;
                    case this._tabDDL:
                        switch (this._tabDDL.active()) {
                            case this._ddlEditor:
                                this.loadDDL(true);
                                break;
                            case this._layoutEditor:
                                this.loadLayout(true);
                                break;
                        }
                    case this._clone:
                        break;
                }
            }
        });
        this.parseUrl();
    }

    parseUrl() {
        const _url = new Comms.ESPUrl().url(document.URL);
        if (_url.param("Wuid")) {
            logger.info(`Wuid Params:  ${_url.params()}`);
            const baseUrl = `${_url.param("Protocol")}://${_url.param("Hostname")}:${_url.param("Port")}`;
            const fullUrl = `${baseUrl}/WsWorkunits/WUResult.json?Wuid=${_url.param("Wuid")}&ResultName=${_url.param("ResultName")}`;
            logger.info(baseUrl);
            const result = new Result({ baseUrl }, _url.param("Wuid"), _url.param("ResultName"));
            result.fetchRows().then(async (response: any[]) => {
                const ddl = JSON.parse(response[0][_url.param("ResultName")]);
                this._ddlv1.json(ddl);
                const ddl2 = ddlUpgrade(ddl, baseUrl, _url.param("Wuid"));
                this._ddlv2.json(ddl2);
                this._tabDDL
                    .addWidget(this._ddlv1, "v1")
                    .addWidget(this._ddlv2, "v1->v2")
                    ;
                this._elementContainer.clear();
                this._dashboard.restore({ ddl: ddl2, widgets: [], layout: {} });
                this._elementContainer.refresh().then(() => {
                    this._dashboard.render();
                });
            });
        } else if (_url.param("QueryID")) {
        } else {
        }
    }

    clear() {
        this._elementContainer.clear();
        this.loadDashboard();
        this._elementContainer.refresh();
    }

    importV1DDL(target: string, ddl: DDL1.DDLSchema, seri?: object) {
        this._elementContainer.importV1DDL(target, ddl, seri);
        this.loadDashboard();
        this._elementContainer.refresh();
    }

    refreshPreview() {
        const ds = this._preview.datasource() as DatasourceAdapt;
        if (ds) {
            ds.exec().then(() => {
                this._preview
                    .invalidate()
                    .lazyRender()
                    ;
            });
        }
    }

    private _currViz: Element | undefined;
    private _currActivity: Activity | undefined;
    selectionChanged(viz?: Element, activity?: Activity) {
        if (activity && (this._currActivity !== activity)) {
            this.loadDataProps(activity);
            if (activity instanceof Activity) {
                this.loadPreview(activity);
            }
        } else if (viz && (this._currViz !== viz || this._currActivity !== activity)) {
            this.loadDataProps(viz.hipiePipeline());
            this.loadWidgetProps(viz.multiChartPanel());
            this.loadStateProps(viz.state());
            this.loadPreview(viz.hipiePipeline()!.mappings()!);
        }
        this._currViz = viz;
        this._currActivity = activity;
    }

    loadDataProps(pe: PropertyExt) {
        this._dataProperties
            .widget(pe)
            .render()
            ;
    }

    loadWidgetProps(w: Widget) {
        this._vizProperties
            .widget(w)
            .render()
            ;
    }

    loadStateProps(pe: PropertyExt) {
        this._stateProperties
            .widget(pe)
            .render()
            ;
    }

    loadPreview(activity: Activity) {
        this._preview
            .datasource(new DatasourceAdapt(activity))
            // .paging(true)
            .lazyRender()
            ;
    }

    loadEditor() {
        //        this._editor.ddl(serialize(this._model) as object);
    }

    loadDashboard(refresh: boolean = true) {
        if (refresh && this._tabLHS.active() === this._dashboard) {
            this._dashboard.lazyRender();
        }
    }

    loadGraph(refresh: boolean = false) {
        this._pipeline
            .data({ ...this._graphAdapter.createGraph(), merge: false })
            ;
        if (refresh && this._tabLHS.active() === this._pipeline) {
            this._pipeline
                .layout("Hierarchy")
                .lazyRender()
                ;
        }
    }

    loadDDL(refresh: boolean = false) {
        this._ddlEditor
            .ddl(this._elementContainer.ddl())
            ;
        if (refresh && this._tabLHS.active() === this._tabDDL && this._tabDDL.active() === this._ddlEditor) {
            this._ddlEditor
                .lazyRender()
                ;
        }
    }

    loadJavaScript(refresh: boolean = false) {
        this._jsEditor
            .javascript(this._dashboard.javascript())
            ;
        if (refresh && this._tabLHS.active() === this._tabDDL && this._tabDDL.active() === this._jsEditor) {
            this._jsEditor
                .lazyRender()
                ;
        }
    }

    loadLayout(refresh: boolean = false) {
        this._layoutEditor
            .json(this._dashboard.layout())
            ;
        if (refresh && this._tabLHS.active() === this._tabDDL && this._tabDDL.active() === this._layoutEditor) {
            this._layoutEditor
                .lazyRender()
                ;
        }
    }

    loadClone() {
        this._cloneEC.clear();
        this._clone.restore(this._dashboard.save());
        this._clone.render(w => {
            this._cloneEC.refresh();
        });
    }

    initMenu() {
        const commands = new CommandRegistry();

        //  Dashboard  Commands  ---
        commands.addCommand("dash_add", {
            label: "Add Element",
            execute: () => {
                const viz = new Element(this._elementContainer);
                this._elementContainer.append(viz);
                this.loadDashboard();
                viz.refresh().then(() => {
                    this.selectionChanged(viz);
                });
            }
        });

        commands.addCommand("dash_add_ddl", {
            label: "Add DDL",
            execute: () => {
                this.importV1DDL("http://10.173.147.1:8010/WsWorkunits/WUResult.json?Wuid=W20170905-105711&ResultName=pro2_Comp_Ins122_DDL", ddl, {});
            }
        });

        commands.addCommand("dash_clear", {
            label: "Clear",
            execute: () => {
                this.clear();
            }
        });

        /*
        commands.addCommand("dash_save", {
            label: "Save",
            execute: () => {
                this._elementContainer.save();
            }
        });

        commands.addCommand("dash_load", {
            label: "Load",
            execute: () => {
                this._elementContainer.load();
            }
        });
        */

        //  Model Commands  ---
        const palette = new CommandPalette({ commands });
        palette.addItem({ command: "addWUResult", category: "Notebook" });
        palette.addItem({ command: "addView", category: "Notebook" });
        palette.addItem({ command: "remove", category: "Notebook" });
        palette.id = "palette";

        const contextMenu = new ContextMenu({ commands });

        contextMenu.addItem({ command: "dash_add", selector: `#${this._dashboard.id()}` });
        contextMenu.addItem({ command: "dash_add_ddl", selector: `#${this._dashboard.id()}` });
        contextMenu.addItem({ command: "dash_clear", selector: `#${this._dashboard.id()}` });

        document.addEventListener("contextmenu", (event: MouseEvent) => {
            if (contextMenu.open(event)) {
                event.preventDefault();
            }
        });
    }

    doResize(width: number, height: number) {
        this._splitMain
            .resize({ width, height })
            .lazyRender();
    }

}
