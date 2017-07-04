import { DDLEditor } from "@hpcc-js/codemirror";
import { DatasourceTable } from "@hpcc-js/dgrid";
import { Edge, Graph, Vertex } from "@hpcc-js/graph";
import { PropertyEditor } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { Databomb, LogicalFile, WUResult } from "./datasource";
import { Model } from "./model";
import { View } from "./view";

export class App {
    _dockPanel = new DockPanel();
    _graph: Graph = new Graph()
        .allowDragging(false)
        .applyScaleOnLayout(true)
        .on("vertex_click", (row, col, sel) => {
            row.__lparam[0].refresh().then(() => {
                this._propertyEditor
                    .widget(row.__lparam[0])
                    .render()
                    ;
                this._preview
                    .datasource(row.__lparam[0])
                    // .paging(row.__lparam[0] instanceof View ? false : true)
                    .render()
                    ;
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
            .render()
            ;

        const wuResult = new WUResult()
            .url("http://192.168.3.22:8010")
            .wuid("W20170424-070701")
            .resultName("Result 1")
            ;
        this._model.datasources.push(wuResult);

        const nestedResult = new WUResult()
            .url("http://192.168.3.22:8010")
            .wuid("W20170630-090707")
            .resultName("All")
            ;
        this._model.datasources.push(nestedResult);

        const databomb = new Databomb()
            .payload([{ subject: "maths", year1: 67 }, { subject: "english", year1: 55 }])
            ;
        this._model.datasources.push(databomb);

        const logicalFile = new LogicalFile()
            .url("http://192.168.3.22:8010")
            .fileName("progguide::exampledata::keys::accounts.personid.payload")
            ;
        this._model.datasources.push(logicalFile);

        const view = new View()
            .datasource(wuResult)
            ;
        this._model.views.push(view);

        this.loadEditor();
        this.loadGraph();
    }

    loadEditor() {
        //        this._editor.ddl(serialize(this._model) as object);
    }

    loadGraph() {
        const vertexMap: { [key: string]: Vertex } = {};
        const vertices: Vertex[] = this._model.datasources.concat(this._model.views as any).map(ds => {
            let retVal: Vertex = vertexMap[ds.id()];
            if (!retVal) {
                retVal = new Vertex()
                    .columns(["DS"])
                    .data([[ds]])
                    .text(ds.label())
                    ;
                vertexMap[ds.id()] = retVal;
                ds.monitor((id, newValue, oldValue) => {
                    console.log(id, newValue, oldValue);
                    ds.refresh().then(() => {
                        retVal.text(ds.label()).render();
                        this._preview
                            .invalidate()
                            .lazyRender()
                            ;
                    });
                });
            }
            return retVal;
        });
        const edgeMap: { [key: string]: Edge } = {};
        const edges: Edge[] = this._model.views.map(view => {
            let retVal: Edge = edgeMap[view.id()];
            if (!retVal) {
                retVal = new Edge()
                    .sourceVertex(vertexMap[view.datasource().id()])
                    .targetVertex(vertexMap[view.id()])
                    ;
                edgeMap[view.id()] = retVal;
            }
            return retVal;
        });
        this._graph
            .layout("Hierarchy")
            // .applyScaleOnLayout(true)
            .data({ vertices, edges })
            ;
    }

    doResize(width, height) {
        this._dockPanel
            .resize({ width, height })
            .lazyRender();
    }
}
