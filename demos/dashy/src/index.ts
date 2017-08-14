import { DDLEditor, JSONEditor } from "@hpcc-js/codemirror";
import { PropertyExt, Widget } from "@hpcc-js/common";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel, SplitPanel } from "@hpcc-js/phosphor";
import { CommandPalette, CommandRegistry, ContextMenu } from "@hpcc-js/phosphor-shim";
import { Dashboard } from "./dashboard/dashboard";
import { DDLAdapter } from "./dashboard/ddladapter";
import { GraphAdapter } from "./dashboard/graphadapter";
import { Viz, WUResultViz } from "./dashboard/viz";
import { Model } from "./model";
import { Activity, DatasourceAdapt } from "./views/activities/activity";
import { View } from "./views/view";

export class Mutex {
    private _locking;
    private _locked;

    constructor() {
        this._locking = Promise.resolve();
        this._locked = false;
    }

    isLocked() {
        return this._locked;
    }

    lock() {
        this._locked = true;
        let unlockNext;
        const willLock = new Promise(resolve => unlockNext = resolve);
        willLock.then(() => this._locked = false);
        const willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}

export async function scopedLock(m: Mutex, func: (...params: any[]) => Promise<void>) {
    const unlock = await this._mutex.lock();
    try {
        m.lock();
        return await func();
    } finally {
        unlock();
    }
}

export class App {
    _dockPanel = new DockPanel();
    _dataSplit = new SplitPanel();
    _monitorHandle: { remove: () => void };
    _dashboard: Dashboard = new Dashboard().on("vizActivation", (viz: Viz) => {
        console.log("Active Changed:  " + viz.dataProps().id());
        this.vizChanged(viz);
    });
    _graphAdapter = new GraphAdapter(this._dashboard);
    _ddlAdapter = new DDLAdapter(this._dashboard);
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row: any, col: string, sel: boolean, ext: any) => {
            const obj = row.__lparam[0];
            if (obj.activity) {
                this.activityChanged(obj.activity);
            } else {
                this.vizChanged(obj.viz);
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
            .addWidget(this._vizProperties, "Widget", "tab-after", this._dataSplit)
            .addWidget(this._stateProperties, "State", "tab-after", this._vizProperties)
            .addWidget(this._graph as any, "Pipeline", "tab-after", this._dashboard)
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

    private _currViz: Viz;
    async vizChanged(viz: Viz) {
        if (this._currViz !== viz) {
            this._currViz = viz;
            if (this._monitorHandle) {
                this._monitorHandle.remove();
                delete this._monitorHandle;
            }
            this.loadDataProps(viz ? viz.dataProps() : null);
            this.loadWidgetProps(viz ? viz.vizProps() : null);
            this.loadStateProps(viz ? viz.stateProps() : null);
            this.loadPreview(viz.view().limit());
            this.loadDDL(true);
            this.loadLayout(true);
            if (viz) {
                this._monitorHandle = viz.monitor((id: string, newValue: any, oldValue: any) => {
                    console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                    this._currViz.refresh().then(() => {
                        this.refreshPreview(viz.view().limit());
                        this.loadGraph(true);
                    });
                });
            }
        }
    }

    private _currActivity: Activity;
    async activityChanged(activity: Activity) {
        if (this._currActivity !== activity) {
            this._currActivity = activity;
            this.loadDataProps(activity);
            this.loadPreview(activity);
        }
    }

    loadDataProps(pe: PropertyExt) {
        this._dataProperties
            .widget(pe)
            .render(widget => {
            })
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
            .paging(true)
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
            .data({ ...this._graphAdapter.createGraph(), merge: false })
            ;
        if (refresh && this._dockPanel.isVisible(this._graph as any)) {
            this._graph.lazyRender();
        }
    }

    loadDDL(refresh: boolean = false) {
        this._ddlEditor
            .ddl(this._ddlAdapter.createDDL())
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
                            if (this._currViz === filteredViz) {
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
