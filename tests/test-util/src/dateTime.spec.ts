import { expect } from "chai";

import { DateTime, Duration } from "@hpcc-js/util";

describe("DateTime", function () {

    it("basic", async function (): Promise<void> {
        expect(DateTime).to.exist;
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        const d = new Date();
        const date2 = new DateTime();
        test(date2, d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
        const date3 = new DateTime(d);
        test(date3, d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    });

    it("year", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        date.addYear(-3);
        test(date, 1996, 7, 3, 9, 25, 30, 7);
        date.addYear(5);
        test(date, 2001, 7, 3, 9, 25, 30, 7);
    });

    it("month", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        date.addMonth(-12);
        test(date, 1998, 7, 3, 9, 25, 30, 7);
        date.addMonth(2);
        test(date, 1998, 9, 3, 9, 25, 30, 7);
        date.addMonth(25);
        test(date, 2000, 10, 3, 9, 25, 30, 7);
    });

    it("day", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        date.addDay(-365);
        test(date, 1998, 7, 3, 9, 25, 30, 7);
        date.addDay(2);
        test(date, 1998, 7, 5, 9, 25, 30, 7);
        date.addDay(365 + 31 + 2);
        test(date, 1999, 8, 7, 9, 25, 30, 7);
    });

    it("hour", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        date.addHour(-365 * 24);
        test(date, 1998, 7, 3, 9, 25, 30, 7);
        date.addHour(24 * 2);
        test(date, 1998, 7, 5, 9, 25, 30, 7);
        date.addHour(365 * 24 + 31 * 24 + 2 * 24);
        test(date, 1999, 8, 7, 9, 25, 30, 7);
    });

    it("min", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        date.addMinute(24 * 60);
        test(date, 1999, 7, 4, 9, 25, 30, 7);
        date.addMinute(2);
        test(date, 1999, 7, 4, 9, 27, 30, 7);
        date.addMinute(-24 * 60);
        test(date, 1999, 7, 3, 9, 27, 30, 7);
    });

    it("sec", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        date.addSecond(5 * 60);
        test(date, 1999, 7, 3, 9, 30, 30, 7);
        date.addSecond(2);
        test(date, 1999, 7, 3, 9, 30, 32, 7);
        date.addSecond(-5 * 60);
        test(date, 1999, 7, 3, 9, 25, 32, 7);
    });

    it("ms", async function (): Promise<void> {
        const date = new DateTime("1999-07-03T09:25:30.007");
        test(date, 1999, 7, 3, 9, 25, 30, 7);
        date.addMilliSecond(5 * 1000);
        test(date, 1999, 7, 3, 9, 25, 35, 7);
        date.addMilliSecond(2);
        test(date, 1999, 7, 3, 9, 25, 35, 9);
        date.addMilliSecond(-5 * 1000);
        test(date, 1999, 7, 3, 9, 25, 30, 9);
    });

    it("duration", async function (): Promise<void> {
        const from = new DateTime("1999-07-03T09:25:30.007");
        const to = new DateTime("1999-07-04T09:25:30.007");
        expect(Duration.between(from, to).days()).to.equal(1);
        expect(Duration.between(from, to).hours()).to.equal(24);
        expect(Duration.between(from, to).minutes()).to.equal(24 * 60);
        expect(Duration.between(from, to).seconds()).to.equal(24 * 60 * 60);
        expect(Duration.between(from, to).milliseconds()).to.equal(Duration.Day);
    });
});

function test(date: DateTime, year: number, month: number, day: number, hour: number, min: number, sec: number, ms?: number) {
    expect(date.year()).to.equal(year);
    expect(date.month()).to.equal(month);
    expect(date.day()).to.equal(day);
    expect(date.hour()).to.equal(hour);
    expect(date.minute()).to.equal(min);
    expect(date.second()).to.equal(sec);
    ms && expect(date.millisecond()).to.equal(ms);
}
