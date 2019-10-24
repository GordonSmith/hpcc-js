import { publish, SVGGWidget } from "@hpcc-js/core";

export interface VertexItem {
    id: string;
    label: string;
    [key: string]: any;
}

export class Vertex3 extends SVGGWidget {

    @publish(5, "Radius")
    radius: publish<number, this>;

    protected _circle: any;
    protected _title: any;

    constructor() {
        super();
    }

    enter(element) {
        super.enter(element);
        this._circle = element
            .append("circle")
            .attr("fill", "navy")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            ;
        this._title = this._circle.append("title");
    }

    update(element) {
        super.update(element);
        this._circle.attr("r", this.radius());
        this._title.text("XXX");
    }
}
