//  Typescript port of:  https://github.com/datavis-tech/graph-data-structure

type D3Node = { id: string };
type D3Link = { source: string, target: string, weight: number };
type D3Graph = {
    nodes: D3Node[],
    links: D3Link[]
};

interface PathT extends Array<string> {
    weight: number;
}

export class Graph2 {

    edges: { [key: string]: string[] } = {};
    edgeWeights: { [key: string]: number } = {};
    edgePayload: { [key: string]: any } = {};

    constructor() {
    }

    addVertex(v: string) {
        this.edges[v] = this.adjacent(v);
        return this;
    }

    removeVertex(v: string) {
        Object.keys(this.edges).forEach(u => {
            this.edges[u].forEach(v => {
                if (v === v) {
                    this.removeEdge(u, v);
                }
            });
        });
        delete this.edges[v];
        return this;
    }

    vertices() {
        const vertexSet: { [key: string]: boolean } = {};
        Object.keys(this.edges).forEach(u => {
            vertexSet[u] = true;
            this.edges[u].forEach(function (v) {
                vertexSet[v] = true;
            });
        });
        return Object.keys(vertexSet);
    }

    adjacent(v: string) {
        return this.edges[v] || [];
    }

    encodeEdge(u: string, v: string): string {
        return u + "->" + v;
    }

    setEdgeWeight(u: string, v: string, weight: number) {
        this.edgeWeights[this.encodeEdge(u, v)] = weight;
        return this;
    }

    getEdgeWeight(u: string, v: string) {
        const weight = this.edgeWeights[this.encodeEdge(u, v)];
        return weight === undefined ? 1 : weight;
    }

    addEdge(u: string, v: string, weight?: number) {
        this.addVertex(u);
        this.addVertex(v);
        this.adjacent(u).push(v);

        if (weight !== undefined) {
            this.setEdgeWeight(u, v, weight);
        }

        return this;
    }

    removeEdge(u: string, v: string) {
        if (this.edges[u]) {
            this.edges[u] = this.adjacent(u).filter(function (_v) {
                return _v !== v;
            });
        }
        return this;
    }

    inDegree(v: string) {
        let degree = 0;
        function check(v2: string) {
            if (v2 === v) {
                degree++;
            }
        }
        Object.keys(this.edges).forEach(e => {
            this.edges[e].forEach(check);
        });
        return degree;
    }

    outDegree(v: string) {
        return v in this.edges ? this.edges[v].length : 0;
    }

    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    // This variant includes an additional option
    // `includeSourceVertices` to specify whether to include or
    // exclude the source nodes from the result (true by default).
    // If `sourceVertices` is not specified, all nodes in the graph
    // are used as source nodes.
    depthFirstSearch(sourceVertices: string[], includeSourceVertices: boolean) {
        const context = this;

        if (!sourceVertices) {
            sourceVertices = this.vertices();
        }

        if (typeof includeSourceVertices !== "boolean") {
            includeSourceVertices = true;
        }

        const visited: { [key: string]: boolean } = {};
        const vertexList: string[] = [];

        function DFSVisit(v: string) {
            if (!visited[v]) {
                visited[v] = true;
                context.adjacent(v).forEach(DFSVisit);
                vertexList.push(v);
            }
        }

        if (includeSourceVertices) {
            sourceVertices.forEach(DFSVisit);
        } else {
            sourceVertices.forEach(v => {
                visited[v] = true;
            });
            sourceVertices.forEach(v => {
                context.adjacent(v).forEach(DFSVisit);
            });
        }

        return vertexList;
    }

    // Least Common Ancestors
    // Inspired by https://github.com/relaxedws/lca/blob/master/src/LowestCommonAncestor.php code
    // but uses depth search instead of breadth. Also uses some optimizations
    lowestCommonAncestors(v1: string, v2: string) {
        const context = this;

        const v1Ancestors: string[] = [];
        const lcas: string[] = [];

        function CA1Visit(visited: { [x: string]: boolean; }, v: string): boolean {
            if (!visited[v]) {
                visited[v] = true;
                v1Ancestors.push(v);
                if (v === v2) {
                    lcas.push(v);
                    return false; // found - shortcut
                }
                return context.adjacent(v).every(v => {
                    return CA1Visit(visited, v);
                });
            } else {
                return true;
            }
        }

        function CA2Visit(visited: { [x: string]: boolean; }, v: string) {
            if (!visited[v]) {
                visited[v] = true;
                if (v1Ancestors.indexOf(v) >= 0) {
                    lcas.push(v);
                } else if (lcas.length === 0) {
                    context.adjacent(v).forEach(v2 => {
                        CA2Visit(visited, v2);
                    });
                }
            }
        }

        if (CA1Visit({}, v1)) { // No shortcut worked
            CA2Visit({}, v2);
        }

        return lcas;
    }

    // The topological sort algorithm yields a list of visited nodes
    // such that for each visited edge (u, v), u comes before v in the list.
    // Amazingly, this comes from just reversing the result from depth first search.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
    topologicalSort(sourceVertices: string[], includeSourceVertex: boolean) {
        return this.depthFirstSearch(sourceVertices, includeSourceVertex).reverse();
    }

    // Dijkstra's Shortest Path Algorithm.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 658
    // Variable and function names correspond to names in the book.
    shortestPath(v1: string, v2: string) {
        const context = this;

        // Upper bounds for shortest path weights from source.
        const d: { [key: string]: number } = {};

        // Predecessors.
        const p: { [key: string]: string } = {};

        // Poor man's priority queue, keyed on d.
        let q: { [key: string]: boolean } = {};

        function initializeSingleSource() {
            context.vertices().forEach(v => {
                d[v] = Infinity;
            });
            if (d[v1] !== Infinity) {
                throw new Error("Source node is not in the graph");
            }
            if (d[v2] !== Infinity) {
                throw new Error("Destination node is not in the graph");
            }
            d[v1] = 0;
        }

        // Adds entries in q for all nodes.
        function initializePriorityQueue() {
            context.vertices().forEach(v => {
                q[v] = true;
            });
        }

        // Returns true if q is empty.
        function priorityQueueEmpty() {
            return Object.keys(q).length === 0;
        }

        // Linear search to extract (find and remove) min from q.
        function extractMin(): string | null {
            let min = Infinity;
            let minVertex;
            Object.keys(q).forEach(v => {
                if (d[v] < min) {
                    min = d[v];
                    minVertex = v;
                }
            });
            if (minVertex === undefined) {
                // If we reach here, there's a disconnected subgraph, and we're done.
                q = {};
                return null;
            }
            delete q[minVertex];
            return minVertex;
        }

        function relax(u: string, v: string) {
            const w = context.getEdgeWeight(u, v);
            if (d[v] > d[u] + w) {
                d[v] = d[u] + w;
                p[v] = u;
            }
        }

        function dijkstra() {
            initializeSingleSource();
            initializePriorityQueue();
            while (!priorityQueueEmpty()) {
                const u = extractMin() as string;
                context.adjacent(u).forEach(v => {
                    relax(u, v);
                });
            }
        }

        // Assembles the shortest path by traversing the
        // predecessor subgraph from destination to source.
        function path(): PathT {
            const vertexList: PathT = [] as any;
            let weight = 0;
            let v = v2;
            while (p[v]) {
                vertexList.push(v);
                weight += context.getEdgeWeight(p[v], v);
                v = p[v];
            }
            if (v !== v1) {
                throw new Error("No path found");
            }
            vertexList.push(v);
            vertexList.reverse();
            vertexList.weight = weight;
            return vertexList;
        }

        dijkstra();

        return path();
    }

    d3Serialize(): D3Graph {
        const context = this;
        const serialized: D3Graph = {
            nodes: this.vertices().map(id => {
                return { id };
            }),
            links: []
        };

        serialized.nodes.forEach(node => {
            const source = node.id;
            context.adjacent(source).forEach(target => {
                serialized.links.push({
                    source,
                    target,
                    weight: context.getEdgeWeight(source, target)
                });
            });
        });

        return serialized;
    }

    d3Deserialize(serialized: D3Graph) {
        serialized.nodes.forEach(node => {
            this.addVertex(node.id);
        });
        serialized.links.forEach(link => {
            this.addEdge(link.source, link.target, link.weight);
        });
        return this;
    }
}
