export class ImmutableArray<T> implements Iterable<T> {
    private _arr: T[];

    get length(): number {
        return this._arr.length;
    }

    constructor(items: T[]) {
        this._arr = items;
    }

    [Symbol.iterator](): Iterator<T> {
        return this._arr[Symbol.iterator]();
    }

    sort(compareFn?: (a: T, b: T) => number): ImmutableArray<T> {
        return new ImmutableArray<T>([...this._arr].sort(compareFn));
    }

    limit(length: number): ImmutableArray<T> {
        const arr = [...this._arr];
        arr.length = length;
        return new ImmutableArray<T>(arr);
    }
}
