import { range } from "d3-array";
import { IMovie, IPerson } from "./IMDBServer";

let data: RandomServer;
export class RandomServer {
    /*
        This is a "fake" IMDB server
        There are a lot of uneeded promises to emulate what it would be like if actually calling a real server.
    */

    private _movieMap: { [title: string]: IMovie } = {};
    private _personMap: { [name: string]: IPerson } = {};

    private constructor() {
    }

    static attach(): RandomServer {
        if (!data) {
            data = new RandomServer();
        }
        return data;
    }

    private _movie(title: string): IMovie {
        let retVal = this._movieMap[title.trim()];
        if (!retVal) {
            retVal = this._movieMap[title.trim()] = {
                title,
                directors: [],
                actors: []
            };
        }
        return retVal;
    }

    async movies(): Promise<IMovie[]> {
        await this.load();
        const retVal = [];
        for (const key in this._movieMap) {
            retVal.push(this._movieMap[key]);
        }
        return retVal;
    }

    async movie(title: string): Promise<IMovie> {
        await this.load();
        return this._movie(title);
    }

    async isMovie(title: string): Promise<boolean> {
        await this.load();
        return !!this._movieMap[title];
    }

    async movieDirectors(title: string): Promise<IPerson[]> {
        const movie = await this.movie(title);
        return Promise.all(movie.directors.map(p => this.person(p)));
    }

    async movieActors(title: string): Promise<IPerson[]> {
        const movie = await this.movie(title);
        return Promise.all(movie.actors.map(p => this.person(p)));
    }

    async moviePeople(title: string): Promise<{ directors: IPerson[], actors: IPerson[] }> {
        return Promise.all([this.movieDirectors(title), this.movieActors(title)]).then(all => {
            return {
                directors: all[0],
                actors: all[1]
            };
        });
    }

    private _person(name: string): IPerson {
        let retVal = this._personMap[name];
        if (!retVal) {
            retVal = this._personMap[name] = {
                name,
                directed: [],
                acted: []
            };
        }
        return retVal;
    }

    async person(name: string): Promise<IPerson> {
        await this.load();
        return this._person(name);
    }

    async isPerson(name: string): Promise<boolean> {
        await this.load();
        return !!this._personMap[name];
    }

    async directedMovies(name: string): Promise<IMovie[]> {
        const person = await this.person(name);
        return Promise.all(person.directed.map(m => this.movie(m)));
    }

    async actedMovies(name: string): Promise<IMovie[]> {
        const person = await this.person(name);
        return Promise.all(person.acted.map(m => this.movie(m)));
    }

    async personMovies(name: string): Promise<{ directed: IMovie[], acted: IMovie[] }> {
        return Promise.all([this.directedMovies(name), this.actedMovies(name)]).then(all => {
            return {
                directed: all[0],
                acted: all[1]
            };
        });
    }

    private _loaded: Promise<void>;
    private load(): Promise<void> {
        if (!this._loaded) {
            this._loaded = new Promise((resolve, reject) => {
                const movieCount = 5;
                const peopleCount = movieCount * 100;
                const actorCount = 0;

                range(peopleCount).forEach(p => {
                    this._person(`Person-${p}`);
                });

                range(movieCount).forEach(m => {
                    const movie = this._movie(`Movie-${m}`);
                    this.pickPeople(1, peopleCount).forEach(d => {
                        movie.directors.push(d.name);
                        d.directed.push(movie.title);
                    });
                    this.pickPeople(actorCount, peopleCount).forEach(d => {
                        movie.actors.push(d.name);
                        d.acted.push(movie.title);
                    });
                });
                resolve();
            });
        }
        return this._loaded;
    }

    private pickPeople(count: number, max: number) {
        const retVal: IPerson[] = [];
        const picked = {};
        while (retVal.length < count) {
            const person = this._person(`Person-${Math.floor(Math.random() * max)}`);
            if (!picked[person.name]) {
                picked[person.name] = true;
                retVal.push(person);
            }
        }
        return retVal;
    }
}
