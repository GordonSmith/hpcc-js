import { graph3 } from "@hpcc-js/graph";
import { IMovie, IPerson } from "./IMDBServer";
import { RandomServer as IMDBServer } from "./RandomServer";

interface Vertex extends graph3.VertexProps {
    payload: IMovie | IPerson;
}

interface CoreEdge extends graph3.EdgeProps {
    source: Vertex;
    target: Vertex;
}

/**
 * The IMDBGraph class manages the master list of "explored" movies and people.
 * It derives from a standard Graph with some minimal visual tweaks.
 */
export class CoreGraph extends graph3.Graph {

    private _server = IMDBServer.attach();
    private verticies: Vertex[] = [];
    private vertexMap: { [id: string]: Vertex } = {};
    private edges: CoreEdge[] = [];
    private edgeMap: { [id: string]: CoreEdge } = {};

    constructor() {
        super();

        this
            // .layout("ForceDirected2")
            // .forceDirectedLinkDistance(150)
            // .highlightOnMouseOverVertex(true)
            // .hierarchyDigraph(false)
            ;

        // this.tooltipHTML(d => d.tooltipHTML());
    }

    clear() {
        this.verticies = [];
        this.vertexMap = {};
        this.edges = [];
        this.edgeMap = {};
    }

    load(movie_person: string): Promise<void> {
        this.clear();
        return this._server.isPerson(movie_person).then(isPerson => {
            if (isPerson) {
                return this._server.person(movie_person).then(person => {
                    return this.createPersonVertex(person);
                });
            }
            return this._server.isMovie(movie_person).then(isMovie => {
                if (isMovie) {
                    return this._server.movie(movie_person).then(movie => {
                        return this.createMovieVertex(movie);
                    });
                }
                return null;
            });
        }).then(v => {
            if (v) {
                return this.expand(v);
            } else {
                return this._server.movies().then(movies => {
                    return Promise.all(movies.map((movie, i) => {
                        const mv = this.createMovieVertex(movie);
                        return this.expand(mv);
                    })).then(all => null);
                });
            }
        });
    }

    createMovieVertex(movie: IMovie): Vertex {
        let retVal = this.vertexMap[`m: ${movie.title} `];
        if (!retVal) {
            retVal = this.vertexMap[`m: ${movie.title} `] = { id: movie.title, text: movie.title, payload: movie };
            this.verticies.push(retVal);
        }
        return retVal;
    }

    createPersonVertex(person: IPerson): Vertex {
        let retVal = this.vertexMap[`p: ${person.name} `];
        if (!retVal) {
            retVal = this.vertexMap[`p: ${person.name} `] = { id: person.name, text: person.name, payload: person };
            this.verticies.push(retVal);
        }
        return retVal;
    }

    createEdge(source, target, label: "Actor" | "Director"): CoreEdge {
        const id = `${source.id} -> ${target.id} ${label}`;
        let retVal: CoreEdge = this.edgeMap[id];
        if (!retVal) {
            retVal = this.edgeMap[id] = { id, source, target };
            this.edges.push(retVal);
        }
        return retVal;
    }

    expandMovie(v: Vertex): Promise<void> {
        return this._server.moviePeople((v.payload as IMovie).title).then(people => {
            people.directors.forEach(director => {
                const p = this.createPersonVertex(director);
                this.createEdge(p, v, "Director");
            });
            people.actors.forEach(actor => {
                const p = this.createPersonVertex(actor);
                this.createEdge(p, v, "Actor");
            });
        });
    }

    expandPerson(v: Vertex): Promise<void> {
        return this._server.personMovies((v.payload as IPerson).name).then(movies => {
            movies.directed.forEach(movie => {
                const m = this.createMovieVertex(movie);
                this.createEdge(v, m, "Director");
            });
            movies.acted.forEach(movie => {
                const m = this.createMovieVertex(movie);
                this.createEdge(v, m, "Actor");
            });
        });
    }

    expand(v: Vertex): Promise<void> {
        // v.expanded(true);
        let promise;
        if ((v.payload as IMovie).title) {
            promise = this.expandMovie(v);
        } else {
            promise = Promise.resolve();
        }
        return promise.then(() => {
            this.data({ vertices: this.verticies, edges: this.edges }, true);
        });
    }
}
