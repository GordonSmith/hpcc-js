import { DDLEditor } from "@hpcc-js/codemirror";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { CommandPalette, CommandRegistry, ContextMenu } from "@hpcc-js/phosphor-shim";
import { Databomb } from "./datasources/databomb";
import { LogicalFile } from "./datasources/logicalfile";
import { WUResult } from "./datasources/wuresult";
import { Model } from "./model";
import { FlatView } from "./views/flatview";
import { View } from "./views/view";

let app: App;

const commands = new CommandRegistry();

commands.addCommand("addWUResult", {
    label: "Add WU Result",
    execute: () => {
        app._model.addDatasource(new WUResult());
        app.loadGraph(true);
    }
});

commands.addCommand("remove", {
    label: "Remove Item",
    execute: () => {
    }
});

const palette = new CommandPalette({ commands });
palette.addItem({ command: "addWUResult", category: "Notebook" });
palette.addItem({ command: "remove", category: "Notebook" });
palette.id = "palette";

const contextMenu = new ContextMenu({ commands });
contextMenu.addItem({ command: "addWUResult", selector: ".graph_Graph > .zoomBackground" });
contextMenu.addItem({ command: "remove", selector: ".graph_Vertex" });

document.addEventListener("contextmenu", (event: MouseEvent) => {
    if (contextMenu.open(event)) {
        event.preventDefault();
    }
});

export class App {
    _dockPanel = new DockPanel();
    _currActivity;
    _monitorHandle: { remove: () => void };
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row: any, col: string, sel: boolean, ext: any) => {
            this._currActivity = row.__lparam[0] as any;
            this._currActivity.refresh().then(() => {
                if (this._monitorHandle) {
                    this._monitorHandle.remove();
                }
                this._propertyEditor
                    .widget(this._currActivity)
                    .render()
                    ;
                this._preview
                    .datasource(this._currActivity)
                    .paging(this._currActivity instanceof View ? false : true)
                    .lazyRender()
                    ;
                this._monitorHandle = this._currActivity.monitor((id: string, newValue: any, oldValue: any) => {
                    console.log(id, newValue, oldValue);
                    switch (id) {
                        case "filters":
                        case "source":
                            this.loadGraph(true);
                            this.refreshPreview(this._currActivity);
                            break;
                        case "groupBy":
                            if (newValue instanceof Array) {
                            } else {
                                this.refreshPreview(this._currActivity);
                            }
                            break;
                        default:
                            this.refreshPreview(this._currActivity);
                    }
                });
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
        app = this;
        this._dockPanel
            .target(placeholder)
            .addWidget("Model", this._graph)
            .addWidget("Preview", this._preview, "split-bottom", this._graph as any)
            .addWidget("Properties", this._propertyEditor, "split-right", this._graph as any)
            .addWidget("Debug", this._editor, "tab-after", this._propertyEditor)
            .lazyRender()
            ;

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

        const logicalFile = new LogicalFile()
            .url("http://192.168.3.22:8010")
            .fileName("progguide::exampledata::keys::accounts.personid.payload")
            ;
        this._model.addDatasource(logicalFile);

        this._model.addView(new FlatView(this._model, "View 1").source(wuResult.label()));
        this._model.addView(new FlatView(this._model, "View 2").source(wuResult.label()));
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

    doResize(width: number, height: number) {
        this._dockPanel
            .resize({ width, height })
            .lazyRender();
    }
}
