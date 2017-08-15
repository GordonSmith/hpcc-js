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
import { Viz } from "./dashboard/viz";
import { Activity, DatasourceAdapt } from "./views/activities/activity";

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
        console.log("Active Changed:  " + viz.view().id());
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

    private _currViz: Viz;
    vizChanged(viz: Viz) {
        if (this._currViz !== viz) {
            this._currViz = viz;
            this.loadDataProps(viz.view());
            this.loadWidgetProps(viz.widget());
            this.loadStateProps(viz.state());
            this.loadPreview(viz.view().last());
            this.loadDDL(true);
            this.loadLayout(true);
        } else {
            this.loadDataProps(viz.view());
            this.loadPreview(viz.view().last());
        }
    }

    private _currActivity: Activity;
    activityChanged(activity: Activity) {
        if (this._currActivity !== activity) {
            this._currActivity = activity;
            this.loadDataProps(activity);
            this.loadPreview(activity);
        }
    }

    loadDataProps(pe: PropertyExt) {
        if (this._monitorHandle) {
            this._monitorHandle.remove();
            delete this._monitorHandle;
        }
        this._dataProperties
            .widget(pe)
            .render(widget => {
                this._monitorHandle = pe.monitor((id: string, newValue: any, oldValue: any) => {
                    console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                    this._currViz.refresh().then(() => {
                        this.refreshPreview();
                        this.loadGraph(true);
                    });
                });
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
            // .ddl(this._ddlAdapter.createDDL())
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
                const viz = new Viz(this._dashboard);
                this._dashboard.addVisualization(viz);
                // TODO:  Move refresh into dashboard and then dashboard should notfiy index that selection refresh is complete  ---
                viz.state().monitorProperty("selection", (id, newVal, oldVal) => {
                    for (const filteredViz of this._dashboard.filteredBy(viz)) {
                        filteredViz.refresh().then(() => {
                            if (this._currViz === filteredViz) {
                                this.refreshPreview();
                            }
                        });
                    }
                });
                this.loadDashboard();
            }
        });

        //  Model Commands  ---
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
