import { DDLEditor } from "@hpcc-js/codemirror";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Graph } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { Databomb, LogicalFile, WUResult } from "./datasource";
import { Model } from "./model";
import { NestedView, View } from "./view";

export class App {
    _dockPanel = new DockPanel();
    _monitorHandle: { remove: () => void };
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row, col, sel, ext) => {
            // const source: Vertex = ext.vertex;
            const datasource = row.__lparam[0] as any;
            datasource.refresh().then(() => {
                if (this._monitorHandle) {
                    this._monitorHandle.remove();
                }
                this._propertyEditor
                    .widget(datasource)
                    .render()
                    ;
                this._preview
                    .datasource(datasource)
                    .paging(datasource instanceof View ? false : true)
                    .lazyRender()
                    ;
                this._monitorHandle = datasource.monitor((id, newValue, oldValue) => {
                    console.log(id, newValue, oldValue);
                    switch (id) {
                        case "source":
                            this.loadGraph();
                            this._graph.lazyRender();
                            this.refreshPreview(datasource);
                            break;
                        case "groupBy":
                            if (newValue instanceof Array) {
                            } else {
                                this.refreshPreview(datasource);
                            }
                            break;
                        default:
                            this.refreshPreview(datasource);
                    }
                });
            });
        })
    ;
    _propertyEditor: PropertyEditor = new PropertyEditor()
        .show_settings(false)
        .showFields(true)
    ;
    _editor = new DDLEditor();
    _preview = new DatasourceTable();

    _model = new Model();

    constructor(placeholder) {
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

        const nestedResult = new WUResult()
            .url("http://192.168.3.22:8010")
            .wuid("W20170630-090707")
            .resultName("All")
            ;
        this._model.addDatasource(nestedResult);

        const databomb = new Databomb()
            .payload([{ subject: "maths", year1: 67 }, { subject: "english", year1: 55 }])
            ;
        this._model.addDatasource(databomb);

        const logicalFile = new LogicalFile()
            .url("http://192.168.3.22:8010")
            .fileName("progguide::exampledata::keys::accounts.personid.payload")
            ;
        this._model.addDatasource(logicalFile);

        this._model.views.push(new View(this._model).source(wuResult.label()));
        this._model.views.push(new View(this._model).source(wuResult.label()));
        this._model.views.push(new NestedView(this._model).source(wuResult.label()));
        this._model.views.push(new NestedView(this._model).source(wuResult.label()));
        this.loadEditor();
        this.loadGraph();
    }

    refreshPreview(datasource) {
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

    loadGraph() {
        this._graph
            .layout("Hierarchy")
            // .applyScaleOnLayout(true)
            .data({ ...this._model.createGraph(), merge: false })
            ;
    }

    doResize(width, height) {
        this._dockPanel
            .resize({ width, height })
            .lazyRender();
    }
}
