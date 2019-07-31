import { Exercise, Exercise_Log, ExerciseIDMap, ExerciseLogRow } from "./db-defs";

export interface CalcRow {
    employee: number;
    date: string;
    time: string;
    bodyPart: string;
    ExerciseName: string;
}
export type CalcData = CalcRow[];

export type Tally = { [key: string]: { count: number, row: ExerciseLogRow } };
export function map2arr(json: Tally, masterJson?: Tally): Array<[string, number]> {
    masterJson = masterJson || json;
    const keys = Object.keys(masterJson);
    keys.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    const retVal: Array<[string, number]> = [];
    for (const key of keys) {
        retVal.push([key, (json[key] && json[key].count) || 0]);
    }
    return retVal;
}

type Tree = { label: string, children?: Tree[], size?: number };
export function map2tree(json: Tally) {
    const retVal: Tree = {
        label: "Exercise",
        children: []
    };
    for (const key in json) {
        retVal.children.push({ label: key, size: +json[key] });
    }
    return retVal;
}

function tally(dict: Tally, _key: string | number, row: ExerciseLogRow, keyFunc?: (key: string | number) => string) {
    const key = keyFunc ? keyFunc(_key) : _key;
    if (!dict[key]) {
        dict[key] = {
            count: 0,
            row
        };
    }
    dict[key].count++;
}

export interface AllData {
    dates: Tally;
    employee: Tally;
    attendance: Tally;
    exType: Tally;
    exName: Tally;
}

export class DB {
    exercise: Exercise;
    exerciseLog: Exercise_Log;
    exerciseMap: ExerciseIDMap = {};

    constructor(exercise: Exercise, exercise_log: Exercise_Log) {
        this.exercise = exercise;
        this.exerciseLog = exercise_log;
        this.exercise.forEach(row => {
            this.exerciseMap[row.Exercise_ID] = row;
        });
    }

    calcData(globalEmpID?: number, dateLow?: string, dateHigh?: string, empID?: number): AllData {
        const dates: Tally = {};
        const attendance: Tally = {};
        const employee: Tally = {};
        const exType: Tally = {};
        const exName: Tally = {};

        this.exerciseLog.filter(row => !globalEmpID || row.Account_No == globalEmpID).filter(row => !dateLow || !dateHigh || (row.Time >= dateLow && row.Time <= dateHigh)).map(row => {
            tally(employee, row.Account_No, row);
            return row;
        }).filter(row => !empID || row.Account_No == empID).map((row): CalcRow => {
            const exercise = this.exerciseMap[row.Exercise_ID];
            const [date, time] = row.Time.split(" ");
            tally(dates, date, row, key => (key as string).substr(0, 7));
            tally(attendance, date, row);
            tally(exName, exercise.Exercise_Name, row);

            const bodyPart = exercise.Exercise_Area;
            if (bodyPart) {
                tally(exType, bodyPart, row);
            }

            return {
                employee: row.Account_No,
                date,
                time,
                bodyPart,
                ExerciseName: exercise.Exercise_Name
            };
        }).filter(row => !!row.bodyPart);

        return {
            dates,
            attendance,
            employee,
            exType,
            exName
        };
    }
}
