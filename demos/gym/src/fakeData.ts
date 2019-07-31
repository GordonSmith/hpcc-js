import { Exercise, Exercise_Log, ExerciseLogRow, ExerciseRow } from "./db-defs";
import { RawData } from "./raw";

declare const raw: RawData;

type ExerciseNameMap = { [Exercise_Name: string]: ExerciseRow };

const knownEmployeeID = [123, 1200, 1235, 1237, 1238, 1239, 1298, 1300, 1391, 1400, 1401, 1697, 8765];

function randn_bm(): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-5.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return num;
}

const bodyParts = ["back", "shoulder", "leg", "chest", "squat"];
function calcBody(_desc: string) {
    const desc = _desc.toLowerCase();
    for (const bp of bodyParts) {
        if (desc.indexOf(bp) >= 0) {
            return bp;
        }
    }
}

const colToSQL = (col: string) => `\`${col}\``;
const rowToSQL = (row: any) => `(${row.map((cell: any) => JSON.stringify(cell)).join(",")})`;

function jsonToSQL(table: string, json: any[]): string {
    const cols: string[] = [];
    for (const key in json[0]) {
        cols.push(key);
    }
    const data: any[] = json.map(row => {
        return cols.map(col => {
            return row[col];
        });
    });
    return `INSERT INTO \`${table}\` (${cols.map(colToSQL).join(",")}) VALUES
    ${data.map(rowToSQL).join(",\n")};`;
}

function exportData() {
    const rawData = raw.map(r => {
        return {
            Employee: "" + knownEmployeeID[Math.floor(randn_bm() * knownEmployeeID.length)],
            ...r
        };
    });

    const exerciseNameMap: ExerciseNameMap = {};
    const exercise: Exercise = [];
    let exerciseID: number = 0;
    const exercise_Log: Exercise_Log = rawData.map((row): ExerciseLogRow => {
        if (!exerciseNameMap[row.ExerciseName]) {
            const exerciseRow = {
                Exercise_ID: ++exerciseID,
                Exercise_Name: row.ExerciseName,
                Exercise_Area: calcBody(row.WorkoutName)
            };
            exerciseNameMap[row.ExerciseName] = exerciseRow;
            exercise.push(exerciseRow);
        }

        return {
            Account_No: +row.Employee,
            Reps: +row.Reps,
            Sets: 1,
            Time: row.Date,
            Exercise_ID: exerciseNameMap[row.ExerciseName].Exercise_ID
        };
    });

    return {
        exercise_Log,
        exercise_LogSQL: jsonToSQL("Exercise_Log", exercise_Log),
        exercise,
        exerciseSQL: jsonToSQL("Exercise", exercise)
    };
}

export const tmp = exportData();
export const exercise = tmp.exercise;
export const exercise_log = tmp.exercise_Log;
