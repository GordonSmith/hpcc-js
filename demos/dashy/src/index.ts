import { DDLEditor } from "@hpcc-js/codemirror";
import { Graph } from "@hpcc-js/graph";
import { DockPanel } from "@hpcc-js/phosphor";

export class App {
    _dockPanel = new DockPanel();
    _graph: Graph = new Graph();
    _editor = new DDLEditor();

    constructor(placeholder) {
        this._dockPanel
            .target(placeholder)
            .addWidget("Data Flow", this._graph)
            .addWidget("Source", this._editor, "split-right", this._graph)
            .render()
            ;
    }

    doResize() {
    }
}
