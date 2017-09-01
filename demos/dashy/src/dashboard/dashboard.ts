
import { d3SelectionType, PropertyExt, Widget } from "@hpcc-js/common";
import { Persist } from "@hpcc-js/other";
import { DockPanel } from "@hpcc-js/phosphor";
import { compare } from "@hpcc-js/util";
import { View } from "../views/view";
import { Viz } from "./viz";

export class Dashboard extends DockPanel {
    private _visualizations: Viz[] = [];
    private _nullVisualization = new Viz(this, "");

    visualizations() {
        return [...this._visualizations];
    }

    visualization(w: string | PropertyExt): Viz {
        let retVal: Viz[];
        if (typeof w === "string") {
            retVal = this._visualizations.filter(viz => viz.id() === w);
        } else {
            retVal = this._visualizations.filter(v => v.vizProps() === w);
        }
        if (retVal.length) {
            return retVal[0];
        }
        return this._nullVisualization;
    }

    visualizationIDs() {
        return this._visualizations.map(viz => viz.id());
    }

    addVisualization(viz: Viz): this {
        this._visualizations.push(viz);
        return this;
    }

    filteredBy(viz: Viz): Viz[] {
        return this._visualizations.filter(otherViz => {
            const filterIDs = otherViz.view().updatedBy();
            return filterIDs.indexOf(viz.id()) >= 0;
        });
    }

    views(): View[] {
        return this._visualizations.map(viz => viz.view());
    }

    view(id: string): View | undefined {
        return this.views().filter(view => view.id() === id)[0];
    }

    update(domNode: HTMLElement, element: d3SelectionType) {
        const previous = this.widgets();
        const diff = compare(previous, this.visualizations().map(viz => viz.widget()));
        for (const w of diff.removed) {
            this.removeWidget(w);
        }
        for (const w of diff.added) {
            this.addWidget(w, this.visualization(w).label());
        }
        for (const w of diff.unchanged) {
            const wa: any = this.getWidgetAdapter(w);
            wa.title.label = this.visualization(w).label();
        }
        super.update(domNode, element);
    }

    createLayout(): object {
        return {
            layout: this.layout(),
            visualizations: this._visualizations.map(viz => {
                return Persist.serializeToObject(viz.widget());
            })
        };
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
