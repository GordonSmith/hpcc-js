import * as d3 from "d3"
import ResizeSurface from "../common/ResizeSurface"
import MultiChart from "./MultiChart"
import INDChart from "../api/INDChart"
debugger
export default class MultiChartSurface extends ResizeSurface {
    constructor() {
        super();
        INDChart.call(this);

        this._title = "MultiChartSurface";

        this._content = new MultiChart();
        var context = this;
        this._content.click = function (row, column) {
            context.click(row, column);
        };
        this._menu.click = function (d) {
            context._content.chartType(d).render();
        };
        this.content(this._content);
        this.mode("all");
    }

    columns(_) {
        if (!arguments.length) return this.content().columns();
        this.content().columns(_);
        return this;
    }

    data(_) {
        if (!arguments.length) return this.content().data();
        this.content().data(_);
        return this;
    }

    mode(_) {
        var retVal = MultiChartSurface.prototype.mode_call.apply(this, arguments);
        if (arguments.length) {
            this._mode = _;
            switch (this._mode) {
                case "1d":
                case "1D":
                    this.menu(this.content()._1DChartTypes.map(function (item) { return item.display; }).sort());
                    break;
                case "2d":
                case "2D":
                    this.menu(this.content()._2DChartTypes.concat(this.content()._NDChartTypes.concat(this.content()._anyChartTypes)).map(function (item) { return item.display; }).sort());
                    break;
                case "multi":
                /* falls through */
                case "ND":
                    this.menu(this.content()._NDChartTypes.concat(this.content()._anyChartTypes).map(function (item) { return item.display; }).sort());
                    break;
                case "all":
                /* falls through */
                default:
                    this.menu(this.content()._allChartTypes.map(function (item) { return item.display; }).sort());
            }
        }
        return retVal;
    }
}
MultiChartSurface.prototype._class += " chart_MultiChartSurface";
MultiChartSurface.prototype.implements(INDChart.prototype);

MultiChartSurface.prototype.publish("mode", "2D", "set", "Chart Type", ["1D", "2D", "ND", "all"]);
MultiChartSurface.prototype.publishProxy("chartType", "_content");

