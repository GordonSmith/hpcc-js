import { PropertyExt } from "@hpcc-js/common";

export abstract class Datasource extends PropertyExt {
    sample(samples: number, sampleSize: number): Promise<any[]> {
        if (samples * sampleSize >= this.total()) {
            return this.fetch(0, this.total());
        } else {
            const pages: Array<Promise<any[]>> = [];
            const lastPage = this.total() - sampleSize;
            for (let i = 0; i < samples; ++i) {
                pages.push(this.fetch(Math.floor(i * lastPage / sampleSize), sampleSize));
            }
            return Promise.all(pages).then(responses => {
                let retVal2 = [];
                for (const response of responses) {
                    retVal2 = retVal2.concat(response);
                }
                return retVal2;
            });
        }
    }

    abstract fetch(from: number, count: number): Promise<any[]>;
    abstract total(): number;
}
