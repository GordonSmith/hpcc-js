export interface ExerciseRow {
    Exercise_ID: number;
    Exercise_Name: string;
    Exercise_Area: string;
}
export type Exercise = ExerciseRow[];

export interface ExerciseLogRow {
    Account_No: number;
    Reps: number;
    Sets: number;
    Time: string;
    Exercise_ID: number;
}
export type Exercise_Log = ExerciseLogRow[];

export type ExerciseIDMap = { [Exercise_ID: number]: ExerciseRow };
