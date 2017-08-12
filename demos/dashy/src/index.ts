import { DDLEditor, JSONEditor } from "@hpcc-js/codemirror";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel, SplitPanel } from "@hpcc-js/phosphor";
import { CommandPalette, CommandRegistry, ContextMenu } from "@hpcc-js/phosphor-shim";
import { Dashboard } from "./dashboard/dashboard";
import { Viz, WUResultViz } from "./dashboard/viz";
import { Databomb } from "./datasources/databomb";
import { Form } from "./datasources/form";
import { LogicalFile } from "./datasources/logicalfile";
import { Workunit } from "./datasources/workunit";
import { WUResult } from "./datasources/wuresult";
import { Model } from "./model";
import { Activity } from "./views/activities/activity";
import { View } from "./views/view";

export class App {
    _dockPanel = new DockPanel();
    _dataSplit = new SplitPanel();
    private _currActivity: Viz;
    _monitorHandle: { remove: () => void };
    _dashboard: Dashboard = new Dashboard().on("ActiveChanged", (viz: Viz, w, wa) => {
        console.log("Active Changed:  " + viz.dataProps().id());
        this.vizChanged(viz);
    });
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row: any, col: string, sel: boolean, ext: any) => {
            const obj = row.__lparam[0];
            this.vizChanged(obj.viz, obj.activity);
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

    refreshPreview(datasource: Activity) {
        datasource.exec().then(() => {
            this._preview
                .invalidate()
                .lazyRender()
                ;
        });
    }

    async vizChanged(activity: Viz, subActivity?: Activity) {
        if (this._currActivity === activity) {
            if (subActivity) {
                this.loadProperties(subActivity);
                this.loadPreview(subActivity);
            }
            return;
        }
        if (activity) {
            await activity.refresh();
        }
        this._currActivity = activity;
        this.loadProperties(subActivity);
        this.loadPreview(subActivity);
        this.loadDDL(true);
        this.loadLayout(true);
    }

    loadProperties(subActivity?: Activity) {
        if (this._monitorHandle) {
            this._monitorHandle.remove();
            delete this._monitorHandle;
        }
        const dataProps = subActivity || (this._currActivity ? this._currActivity.dataProps() : null);
        const vizProps = this._currActivity ? this._currActivity.vizProps() : null;
        const stateProps = this._currActivity ? this._currActivity.stateProps() : null;
        this._dataProperties
            .widget(dataProps)
            .render(widget => {
                if (this._currActivity) {
                    this._monitorHandle = this._currActivity.monitor((id: string, newValue: any, oldValue: any) => {
                        console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                        this._currActivity.refresh().then(() => {
                            this.refreshPreview(this._currActivity.view().limit());
                            this.loadGraph(true);
                        });
                    });
                }
            })
            ;
        this._vizProperties
            .widget(vizProps)
            .render()
            ;
        this._stateProperties
            .widget(stateProps)
            .render()
            ;
    }

    loadPreview(subActivity?: Activity) {
        this._preview
            .datasource(subActivity || this._currActivity.toIDatasource())
            .paging(this._currActivity instanceof View ? false : true)
            .lazyRender()
            ;
    }

    loadEditor() {
        //        this._editor.ddl(serialize(this._model) as object);
    }

    loadDashboard(refresh: boolean = true) {
        if (refresh && this._dockPanel.isVisible(this._dashboard as any)) {
            this._dashboard.lazyRender();
        }
    }

    loadGraph(refresh: boolean = false) {
        this._graph
            .layout("Hierarchy")
            .data({ ...this._dashboard.createGraph(), merge: false })
            ;
        if (refresh && this._dockPanel.isVisible(this._graph as any)) {
            this._graph.lazyRender();
        }
    }

    loadDDL(refresh: boolean = false) {
        this._ddlEditor
            .ddl(this._dashboard.createDDL())
            ;
        if (refresh && this._dockPanel.isVisible(this._ddlEditor as any)) {
            this._ddlEditor
                .lazyRender()
                ;
        }
    }

    loadLayout(refresh: boolean = false) {
        this._layoutEditor
            .json(this._dashboard.createLayout())
            ;
        if (refresh && this._dockPanel.isVisible(this._layoutEditor as any)) {
            this._layoutEditor
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
                this._dashboard.addVisualization(viz);
                this._model.addVisualization(viz);
                viz.state().monitorProperty("selection", (id, newVal, oldVal) => {
                    for (const filteredViz of this._model.filteredBy(viz)) {
                        filteredViz.refresh().then(() => {
                            if (this._currActivity === filteredViz) {
                                this.refreshPreview(filteredViz.view().limit());
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
