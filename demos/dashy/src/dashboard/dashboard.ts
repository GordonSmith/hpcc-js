import { DockPanel } from "@hpcc-js/phosphor";
import { Viz } from "./viz";

export class Dashboard extends DockPanel {

    private _visualizations: Viz[] = [];
    visualizations() {
        return [...this._visualizations];
    }

    addVisualization(viz: Viz): this {
        this._visualizations.push(viz);
        return this;
    }

    update(domNode, element) {
        const previous = this.widgets();
        const current = this.visualizations().map(viz => viz.widget());
        const removed = previous.filter(x => current.indexOf(x) === -1);
        const added = current.filter(x => previous.indexOf(x) === -1);
        for (const w of removed) {
            this.removeWidget(w);
        }
        for (const w of added) {
            this.addWidget(w, "test");
        }
        super.update(domNode, element);
    }
}
Dashboard.prototype._class += " dashboard_dashboard";
