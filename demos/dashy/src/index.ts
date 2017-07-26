import { DDLEditor } from "@hpcc-js/codemirror";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { CommandPalette, CommandRegistry, ContextMenu } from "@hpcc-js/phosphor-shim";
import { Dashboard } from "./dashboard/dashboard";
import { Viz } from "./dashboard/viz";
import { Databomb } from "./datasources/databomb";
import { Form } from "./datasources/form";
import { LogicalFile } from "./datasources/logicalfile";
import { Workunit } from "./datasources/workunit";
import { WUResult } from "./datasources/wuresult";
import { Model } from "./model";
import { FlatView } from "./views/flatview";
import { View } from "./views/view";

// let app: App;

export class App {
    _dockPanel = new DockPanel();
    _currActivity;
    _monitorHandle: { remove: () => void };
    _dashboard: Dashboard = new Dashboard();
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row: any, col: string, sel: boolean, ext: any) => {
            if (this._currActivity === row.__lparam[0] as any) return;
            this._currActivity = row.__lparam[0] as any;
            this._currActivity.refresh().then(() => {
                if (this._monitorHandle) {
                    this._monitorHandle.remove();
                }
                this._preview
                    .datasource(this._currActivity)
                    .paging(this._currActivity instanceof View ? false : true)
                    .lazyRender()
                    ;
                this._propertyEditor
                    .widget(this._currActivity)
                    .render(w => {
                        this._monitorHandle = this._currActivity.monitor((id: string, newValue: any, oldValue: any) => {
                            console.log(`monitor(${id}, ${newValue}, ${oldValue})`);
                            this._currActivity.refresh().then(() => {
                                this.loadGraph(true);
                                this.refreshPreview(this._currActivity);
                            });
                        });
                    })
                    ;
            });
        })
        .on("vertex_contextmenu", (row: any, col: string, sel: boolean, ext: any) => {
        })
    ;
    _propertyEditor: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(true)
    ;
    _editor = new DDLEditor();
    _preview = new DatasourceTable()
        .on("click", (row: any, col: string, sel: boolean) => {
            if (this._currActivity && this._currActivity.selection) {
                this._currActivity.selection([row]);
            }
        })
    ;

    _model = new Model();

    constructor(placeholder: string) {
        // app = this;
        this._dockPanel
            .target(placeholder)
            .addWidget(this._dashboard, "Dashboard")
            .addWidget(this._preview, "Preview", "split-bottom", this._dashboard as any)
            .addWidget(this._propertyEditor, "Properties", "split-right", this._dashboard as any)
            .addWidget(this._editor, "Debug", "tab-after", this._propertyEditor)
            .addWidget(this._graph, "Model", "tab-after", this._dashboard)
            .lazyRender()
            ;
        this.loadSample();
        this.initMenu();
    }

    async loadSample() {
        const wu = new Workunit()
            .url("http://192.168.3.22:8010")
            .wuid("W20170424-070701")
            ;
        await wu.refresh();
        //  this._model.addWorkunit(wu);

        const wuResult = new WUResult()
            .url("http://192.168.3.22:8010")
            .wuid("W20170424-070701")
            .resultName("Result 1")
            ;
        this._model.addDatasource(wuResult);

        const databomb = new Databomb()
            .payload([{ subject: "maths", year1: 67 }, { subject: "english", year1: 55 }])
            ;
        this._model.addDatasource(databomb);

        const form = new Form()
            .payload({
                state: "FL",
                someStr: "",
                someNumber: 42,
                someBoolean: false
            })
            ;
        this._model.addDatasource(form);

        const logicalFile = new LogicalFile()
            .url("http://192.168.3.22:8010")
            .filename("progguide::exampledata::keys::accounts.personid.payload")
            ;
        this._model.addDatasource(logicalFile);

        const filter1 = new FlatView(this._model, "Filter 1").source(wuResult.id())
            .appendGroupBys([{ field: "state" }])
            .appendComputedFields([{ label: "weight", type: "count" }])
            ;
        const filter2 = new FlatView(this._model, "Filter 2").source(wuResult.id())
            .appendGroupBys([{ field: "firstname" }])
            .appendComputedFields([{ label: "weight", type: "count" }])
            ;
        const table1 = new FlatView(this._model, "View 2").source(wuResult.id())
            .appendFilter(filter1, [{ filterField: "state", localField: "state" }])
            .appendFilter(filter2, [{ filterField: "firstname", localField: "firstname" }])
            ;
        this._model.addView(filter1);
        this._model.addView(filter2);
        this._model.addView(table1);
        this.loadEditor();
        this.loadGraph();
    }

    refreshPreview(datasource: View) {
        datasource.refresh().then(() => {
            this._preview
                .invalidate()
                .lazyRender()
                ;
        });
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
            .data({ ...this._model.createGraph(), merge: false })
            ;
        if (refresh) {
            this._graph.lazyRender();
        }
    }

    initMenu() {
        const commands = new CommandRegistry();

        //  Dashboard  Commands  ---
        commands.addCommand("dash_add", {
            label: "Add Widget",
            execute: () => {
                this._dashboard.addVisualization(new Viz());
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
                this._model.addView(new FlatView(this._model));
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
