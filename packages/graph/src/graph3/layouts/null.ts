import { Layout } from "./layout";

export class Null extends Layout {

    start() {
        super.start();
        const size = this._graph.size();
        const data = this._graph.layoutData();
        //  Avoid edges of 0 length ---
        data.vertices().forEach(v => {
            v.x = size.width / 2 + Math.random() * 5 - 2.5;
            v.y = size.height / 2 + Math.random() * 5 - 2.5;
        });
        this._graph
            .moveEdges(true)
            .moveVertices(true)
            ;
        this.stop();
        return this;
    }
}
