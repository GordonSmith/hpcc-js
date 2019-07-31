export interface RawRow {
    Date: string;
    WorkoutName: string;
    ExerciseName: string;
    SetOrder: string;
    Weight: string;
    Reps: string;
    Distance: string;
    Seconds: string;
    Notes: string;
    WorkoutNotes: string;
}
export type RawData = RawRow[];
