
import { PropertyExt, Widget } from "@hpcc-js/common";
import { Persist } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { View } from "../views/view";
import { Viz } from "./viz";

export class Dashboard extends DockPanel {
    private _visualizations: Viz[] = [];

    visualizations() {
        return [...this._visualizations];
    }

    visualization(w: string | PropertyExt): Viz {
        if (typeof w === "string") {
            return this._visualizations.filter(viz => viz.id() === w)[0];
        }
        return this._visualizations.filter(v => v.vizProps() === w)[0];
    }

    addVisualization(viz: Viz): this {
        this._visualizations.push(viz);
        return this;
    }

    views(): View[] {
        return this._visualizations.map(viz => viz.view());
    }

    view(id: string): View | undefined {
        return this.views().filter(view => view.id() === id)[0];
    }

    update(domNode, element) {
        const previous = this.widgets();
        const current = this.visualizations().map(viz => viz.vizProps());
        const removed = previous.filter(x => current.indexOf(x) === -1);
        const added = current.filter(x => previous.indexOf(x) === -1);
        const updated = this.visualizations().filter(viz => added.indexOf(viz.vizProps()) === -1);
        for (const w of removed) {
            this.removeWidget(w);
        }
        for (const w of added) {
            this.addWidget(w, this.visualization(w).label());
        }
        for (const viz of updated) {
            const wa: any = this.getWidgetAdapter(viz.vizProps());
            wa.title.label = viz.label();
        }
        super.update(domNode, element);
    }

    createLayout(): object {
        return this._visualizations.map(viz => {
            return Persist.serializeToObject(viz.widget());
        });
    }

    protected _prevActive: Widget;
    childActivation(w: Widget) {
        super.childActivation(w);
        if (this._prevActive !== w) {
            this._prevActive = w;
            this.vizActivation(this.visualization(w));
        }
    }

    vizActivation(viz: Viz) {
    }
}
Dashboard.prototype._class += " dashboard_dashboard";
