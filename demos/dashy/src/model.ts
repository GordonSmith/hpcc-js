import { PropertyExt } from "@hpcc-js/common";
import { Viz } from "./dashboard/viz";
import { NullView } from "./views/nullview";
import { View } from "./views/view";

export class Model extends PropertyExt {
    private _views: View[] = [];
    private _nullView = new NullView(this, "");
    private _visualizations: Viz[] = [];
    private _nullVisualization = new Viz(this, "");

    clear() {
        this._views = [];
    }

    addView(view: View): this {
        this._views.push(view);
        return this;
    }

    viewIDs() {
        return this._views.map(view => view.id());
    }

    view(id: string): View | undefined {
        const retVal = this._views.filter(view => view.id() === id);
        if (retVal.length) {
            return retVal[0] as View;
        }
        return this._nullView;
    }

    visualizations() {
        return [...this._visualizations];
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
            const filterIDs = otherViz.view().updatedBy().map(item => item.from);
            return filterIDs.indexOf(viz.id()) >= 0;
        });
    }

    visualization(id: string): Viz {
        const retVal = this.visualizations().filter(ds => ds.id() === id);
        if (retVal.length) {
            return retVal[0];
        }
        return this._nullVisualization;
    }
}
Model.prototype._class += " Model";
