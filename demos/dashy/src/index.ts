import { DDLEditor, JSONEditor } from "@hpcc-js/codemirror";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel, SplitPanel } from "@hpcc-js/phosphor";
import { CommandPalette, CommandRegistry, ContextMenu } from "@hpcc-js/phosphor-shim";
import { Dashboard } from "./dashboard/dashboard";
import { IActivity, Viz, WUResultViz } from "./dashboard/viz";
import { Databomb } from "./datasources/databomb";
import { Form } from "./datasources/form";
import { LogicalFile } from "./datasources/logicalfile";
import { Workunit } from "./datasources/workunit";
import { WUResult } from "./datasources/wuresult";
import { Model } from "./model";
import { View } from "./views/view";

export class App {
    _dockPanel = new DockPanel();
    _dataSplit = new SplitPanel();
    private _currActivity: IActivity;
    _monitorHandle: { remove: () => void };
    _dashboard: Dashboard = new Dashboard().on("ActiveChanged", (viz: IActivity, w, wa) => {
        console.log("Active Changed:  " + viz.dataProps().id());
        this.activeChanged(viz);
    });
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row: any, col: string, sel: boolean, ext: any) => {
            const obj = row.__lparam[0];
            if (obj instanceof Viz) {
                this.activeChanged(row.__lparam[0]);
            }
        })
        .on("vertex_contextmenu", (row: any, col: string, sel: boolean, ext: any) => {
        })
    ;
    _dataProperties: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(false)
    ;
    _vizProperties: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(false)
    ;
    _stateProperties: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(false)
    ;
    _ddlEditor = new DDLEditor();
    _layoutEditor = new JSONEditor();
    _preview = new DatasourceTable();

    _model = new Model();

    constructor(placeholder: string) {
        // app = this;
        this._dataSplit
            .addWidget(this._dataProperties)
            .addWidget(this._preview)
            ;
        this._dockPanel
            .target(placeholder)
            .addWidget(this._dashboard, "Dashboard")
            .addWidget(this._dataSplit, "Data", "split-right", this._dashboard as any)
            .addWidget(this._vizProperties, "Viz", "tab-after", this._dataSplit)
            .addWidget(this._stateProperties, "State", "tab-after", this._vizProperties)
            .addWidget(this._graph as any, "Model", "tab-after", this._dashboard)
            .addWidget(this._ddlEditor, "DDL", "tab-after", this._graph as any)
            .addWidget(this._layoutEditor, "Layout", "tab-after", this._ddlEditor)
            .lazyRender()
            ;
        //   this.loadSample();
        this.initMenu();
    }

    refreshPreview(datasource: IActivity) {
        datasource.refresh().then(() => {
            this._preview
                .invalidate()
                .lazyRender()
                ;
        });
    }

    async activeChanged(w: IActivity) {
        if (this._currActivity === w) return;
        this._currActivity = w;
        await this._currActivity.refresh();
        if (this._monitorHandle) {
            this._monitorHandle.remove();
        }
        this._preview
            .datasource(this._currActivity.toIDatasource())
            .paging(this._currActivity instanceof View ? false : true)
            .lazyRender()
            ;
        this._dataProperties
            .widget(this._currActivity.dataProps())
            .render(widget => {
                this._monitorHandle = this._currActivity.monitor((id: string, newValue: any, oldValue: any) => {
                    console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                    this._currActivity.refresh().then(() => {
                        this.refreshPreview(this._currActivity);
                        this.loadGraph(true);
                    });
                });
            })
            ;
        this._vizProperties
            .widget(this._currActivity.vizProps())
            .render(widget => {
                this._monitorHandle = this._currActivity.monitor((id: string, newValue: any, oldValue: any) => {
                    console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                });
            })
            ;
        this._stateProperties
            .widget(this._currActivity.stateProps())
            .render(widget => {
                this._monitorHandle = this._currActivity.monitor((id: string, newValue: any, oldValue: any) => {
                    console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                });
            })
            ;

        this.loadDDL(true);
        this.loadLayout(true);
    }

    loadEditor() {
        //        this._editor.ddl(serialize(this._model) as object);
    }

    loadDashboard(refresh: boolean = true) {
        this._dashboard
            ;
        if (refresh) {
            this._dashboard.lazyRender();
        }
    }

    loadGraph(refresh: boolean = false) {
        this._graph
            .layout("Hierarchy")
            // .applyScaleOnLayout(true)
            .data({ ...this._dashboard.createGraph(), merge: false })
            ;
        if (refresh) {
            this._graph.lazyRender();
        }
    }

    loadDDL(refresh: boolean = false) {
        if (refresh) {
            this._ddlEditor
                .ddl(this._dashboard.createDDL())
                .lazyRender()
                ;
        }
    }

    loadLayout(refresh: boolean = false) {
        if (refresh) {
            this._layoutEditor
                .json(this._dashboard.createLayout())
                .lazyRender()
                ;
        }
    }

    initMenu() {
        const commands = new CommandRegistry();

        //  Dashboard  Commands  ---
        commands.addCommand("dash_add", {
            label: "Add Viz",
            execute: () => {
                const viz = new WUResultViz(this._model);
                (viz.view().dataSource().details() as WUResult)
                    .url("http://192.168.3.22:8010")
                    .wuid("W20170424-070701")
                    .resultName("Result 1")
                    ;
                this._dashboard.addVisualization(viz);
                this._model.addVisualization(viz);
                viz.state().monitorProperty("selection", (id, newVal, oldVal) => {
                    for (const filteredViz of this._model.filteredBy(viz)) {
                        filteredViz.refresh().then(() => {
                            if (this._currActivity === filteredViz) {
                                this.refreshPreview(filteredViz);
                            }
                        });
                    }
                });
                this.loadDashboard();
            }
        });

        //  Model Commands  ---
        commands.addCommand("clear", {
            label: "Clear",
            execute: () => {
                this._model.clear();
                this.loadGraph(true);
            }
        });

        commands.addCommand("addWU", {
            label: "Add Workunit",
            execute: () => {
                this._model.addWorkunit(new Workunit());
                this.loadGraph(true);
            }
        });

        commands.addCommand("addWUResult", {
            label: "Add WU Result",
            execute: () => {
                this._model.addDatasource(new WUResult());
                this.loadGraph(true);
            }
        });

        commands.addCommand("addLogicalFile", {
            label: "Add Logical File",
            execute: () => {
                this._model.addDatasource(new LogicalFile());
                this.loadGraph(true);
            }
        });

        commands.addCommand("addDatabomb", {
            label: "Add Databomb",
            execute: () => {
                this._model.addDatasource(new Databomb());
                this.loadGraph(true);
            }
        });

        commands.addCommand("addForm", {
            label: "Add Form",
            execute: () => {
                this._model.addDatasource(new Form());
                this.loadGraph(true);
            }
        });

        commands.addCommand("addView", {
            label: "Add View",
            execute: () => {
                this._model.addView(new View(this._model));
                this.loadGraph(true);
            }
        });

        commands.addCommand("remove", {
            label: "Remove Item",
            execute: () => {
            }
        });

        const palette = new CommandPalette({ commands });
        palette.addItem({ command: "addWUResult", category: "Notebook" });
        palette.addItem({ command: "addView", category: "Notebook" });
        palette.addItem({ command: "remove", category: "Notebook" });
        palette.id = "palette";

        const contextMenu = new ContextMenu({ commands });

        contextMenu.addItem({ command: "dash_add", selector: `#${this._dashboard.id()}` });

        contextMenu.addItem({ command: "clear", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "addWU", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "addWUResult", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "addLogicalFile", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "addDatabomb", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "addForm", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "addView", selector: ".graph_Graph > .zoomBackground" });
        contextMenu.addItem({ command: "remove", selector: ".graph_Vertex" });

        document.addEventListener("contextmenu", (event: MouseEvent) => {
            if (contextMenu.open(event)) {
                event.preventDefault();
            }
        });
    }

    doResize(width: number, height: number) {
        this._dockPanel
            .resize({ width, height })
            .lazyRender();
    }
}
