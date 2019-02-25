import { timeFormat, timeParse, utcFormat, utcParse } from "d3-time-format";

const utcFormatter = utcFormat("%Y-%m-%dT%H:%M:%S.%LZ");
const utcParser = utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
const timeFormatter = timeFormat("%Y-%m-%dT%H:%M:%S.%L");
const timeParser = timeParse("%Y-%m-%dT%H:%M:%S.%L");
const timeParser2 = timeParse("%Y-%m-%dT%H:%M:%S");

export class Duration {

    static Day = 86400000;
    static Hour = 3600000;
    static Minute = 60000;
    static Second = 1000;

    private readonly _milliseconds: number;

    private constructor(from: Date, to: Date);
    private constructor(from: DateTime, to: DateTime);
    private constructor(millisecond: number);
    private constructor(fromOrMilli: Date | DateTime | number, to?: Date | DateTime) {
        if (fromOrMilli instanceof Date && to instanceof Date) {
            this._milliseconds = to.valueOf() - fromOrMilli.valueOf();
        } else if (fromOrMilli instanceof DateTime && to instanceof DateTime) {
            this._milliseconds = to.valueOf() - fromOrMilli.valueOf();
        } else {
            this._milliseconds = fromOrMilli as number;
        }
    }

    static days(count: number = 1): Duration {
        return new Duration(count * 1000 * 60 * 60 * 24);
    }

    static hours(count: number = 1): Duration {
        return new Duration(count * 1000 * 60 * 60);
    }

    static minutes(count: number = 1): Duration {
        return new Duration(count * 1000 * 60);
    }

    static seconds(count: number = 1): Duration {
        return new Duration(count * 1000);
    }

    static milliseconds(count: number = 1): Duration {
        return new Duration(count);
    }

    static between(from: DateTime, to: DateTime) {
        return new Duration(from, to);
    }

    days(): number {
        return this._milliseconds / Duration.Day;
    }

    hours(): number {
        return this._milliseconds / Duration.Hour;
    }

    minutes(): number {
        return this._milliseconds / Duration.Minute;
    }

    seconds(): number {
        return this._milliseconds / Duration.Second;
    }

    milliseconds(): number {
        return this._milliseconds;
    }
}

export class DateTime {

    private _d: Date;

    constructor(d?: DateTime | Date | string) {
        if (d instanceof DateTime) {
            this._d = d.date();
        } else if (d instanceof Date) {
            this.date(d);
        } else if (typeof d === "string") {
            this.utc(d);
        } else {
            this._d = new Date();
        }
    }

    clone() {
        return new DateTime(this._d);
    }

    toString(): string {
        return this._d.toString();
    }

    valueOf(): number {
        return this._d.valueOf();
    }

    isLess(other: DateTime): boolean {
        return this._d.valueOf() < other.valueOf();
    }

    isLessEqual(other: DateTime): boolean {
        return this._d.valueOf() <= other.valueOf();
    }

    date(_: Date): this;
    date(): Date;
    date(_?: Date): Date | this {
        if (_ === undefined) return new Date(this._d.valueOf());
        this._d = new Date(_.valueOf());
        return this;
    }

    year(_: number): this;
    year(): number;
    year(_?: number): number | this {
        if (_ === undefined) return this._d.getFullYear();
        this._d.setFullYear(_);
        return this;
    }

    month(_: number): this;
    month(): number;
    month(_?: number): number | this {
        if (_ === undefined) return this._d.getMonth() + 1;
        this._d.setMonth(_ - 1);
        return this;
    }

    day(_: number): this;
    day(): number;
    day(_?: number): number | this {
        if (_ === undefined) return this._d.getDate();
        this._d.setDate(_);
        return this;
    }

    hour(_: number): this;
    hour(): number;
    hour(_?: number): number | this {
        if (_ === undefined) return this._d.getHours();
        this._d.setHours(_);
        return this;
    }

    minute(_: number): this;
    minute(): number;
    minute(_?: number): number | this {
        if (_ === undefined) return this._d.getMinutes();
        this._d.setMinutes(_);
        return this;
    }

    second(_: number): this;
    second(): number;
    second(_?: number): number | this {
        if (_ === undefined) return this._d.getSeconds();
        this._d.setSeconds(_);
        return this;
    }
    millisecond(_: number): this;
    millisecond(): number;
    millisecond(_?: number): number | this {
        if (_ === undefined) return this._d.getMilliseconds();
        this._d.setMilliseconds(_);
        return this;
    }

    utc(_: string): this;
    utc(): string;
    utc(_?: string): string | this {
        if (_ === undefined) return utcFormatter(this._d);
        const d = utcParser(_) || timeParser(_) || timeParser2(_);
        if (!d) throw new Error("Invalid UTC Date/Time String");
        this._d = d;
        return this;
    }

    local(): string {
        return timeFormatter(this._d);
    }

    format(specifier: string) {
        return timeFormat(specifier)(this._d);
    }

    //  Date Math  ---
    add(_: Duration): this {
        this._d = new Date(this._d.valueOf() + _.milliseconds());
        return this;
    }

    diff(other: DateTime): Duration {
        return Duration.between(this, other);
    }

    addYear(_: number): this {
        this._d.setFullYear(this._d.getFullYear() + _);
        return this;
    }

    addMonth(_: number): this {
        this._d.setMonth(this._d.getMonth() + _);
        return this;
    }

    addDay(_: number): this {
        this._d.setDate(this._d.getDate() + _);
        return this;
    }

    addHour(_: number): this {
        this._d.setHours(this._d.getHours() + _);
        return this;
    }

    addMinute(_: number): this {
        this._d.setMinutes(this._d.getMinutes() + _);
        return this;
    }

    addSecond(_: number): this {
        this._d.setSeconds(this._d.getSeconds() + _);
        return this;
    }

    addMilliSecond(_: number): this {
        this._d.setMilliseconds(this._d.getMilliseconds() + _);
        return this;
    }

    clipYear(): this {
        this._d = new Date(this._d.getFullYear());
        return this;
    }

    clipMonth(): this {
        this._d = new Date(this._d.getFullYear(), this._d.getMonth());
        return this;
    }

    clipDay(): this {
        this._d = new Date(this._d.getFullYear(), this._d.getMonth(), this._d.getDate());
        return this;
    }

    clipHour(): this {
        this._d = new Date(this._d.getFullYear(), this._d.getMonth(), this._d.getDate(), this._d.getHours());
        return this;
    }

    clipMinute(): this {
        this._d = new Date(this._d.getFullYear(), this._d.getMonth(), this._d.getDate(), this._d.getHours(), this._d.getMinutes());
        return this;
    }

    clipSecond(): this {
        this._d = new Date(this._d.getFullYear(), this._d.getMonth(), this._d.getDate(), this._d.getHours(), this._d.getMinutes(), this._d.getSeconds());
        return this;
    }
}

export class DateSpan {

}
