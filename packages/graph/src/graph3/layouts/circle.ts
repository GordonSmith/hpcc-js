import { Layout } from "./layout";

const rads = (degrees: number) => degrees * Math.PI / 180;
const radius = (vertexCount: number, sideLength: number) => sideLength / (2 * Math.sin(rads(180 / vertexCount)));

export class Circle extends Layout {

    constructor(graph, readonly sideLength = 60) {
        super(graph);
    }

    start() {
        super.start();
        const size = this._graph.size();
        const vertices = this._graph.layoutData().vertices();
        const r = radius(vertices.length, this.sideLength);
        const angle = 360 / vertices.length;
        vertices.forEach((v, i) => {
            v.x = size.width / 2 + Math.cos(rads(i * angle)) * r;
            v.y = size.height / 2 + Math.sin(rads(i * angle)) * r;
        });
        this._graph.moveVertices(true, true);
        this.stop();
        this._running = false;
        return this;
    }
}
