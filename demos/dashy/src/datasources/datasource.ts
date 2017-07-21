import { PropertyExt, publish } from "@hpcc-js/common";
import { IDatasource, IField } from "@hpcc-js/dgrid";

let datasourceID = 0;
export abstract class Datasource extends PropertyExt implements IDatasource {
    constructor() {
        super();
        this._id = "ds" + datasourceID++;
    }

    label(): string {
        return "";
    }

    abstract hash(): string;

    abstract outFields(): IField[];
    abstract total(): number;

    fetch(from: number, count: number): Promise<any[]> {
        return this._fetch(from, count);
    }

    protected abstract _fetch(from: number, count: number): Promise<any[]>;
}

export abstract class SamplingDatasource extends Datasource {
    @publish(10, "number", "Number of samples")
    samples: { (): number; (_: number): SamplingDatasource; };
    @publish(100, "number", "Sample size")
    sampleSize: { (): number; (_: number): SamplingDatasource; };

    constructor() {
        super();
    }

    fetch(from: number, count: number): Promise<any[]> {
        if (count > this.samples() * this.sampleSize()) {
            return this._sample();
        }
        return this._fetch(from, count);
    }

    _sample(samples: number = this.samples(), sampleSize: number = this.sampleSize()): Promise<any[]> {
        const pages: Array<Promise<any[]>> = [];
        const lastPage = this.total() - sampleSize;
        for (let i = 0; i < samples; ++i) {
            pages.push(this._fetch(Math.floor(i * lastPage / sampleSize), sampleSize));
        }
        return Promise.all(pages).then(responses => {
            let retVal2: any[] = [];
            for (const response of responses) {
                retVal2 = retVal2.concat(response);
            }
            return retVal2;
        });
    }
}
