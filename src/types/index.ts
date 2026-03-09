export type SetType = 'warmup' | 'feeder' | 'normal' | 'failure';

export interface RoutineSet {
    id: string;
    type: SetType;
    targetReps: string; // ex: "8-12", "15"
}

export interface RoutineExercise {
    id: string;
    name: string;
    target?: string;
    restTimeSeconds: number; // ex: 90, 120
    sets: RoutineSet[];
}

export interface Routine {
    id: string;
    name: string;
    daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, etc.
    exercises: RoutineExercise[];
}

export interface ActiveSetData {
    id: string;
    routineSetId?: string; // Link to template, optional
    type: SetType;
    weight: string;
    reps: string;
    rpe: string;
    completed: boolean;
}

export interface ActiveExerciseData {
    id: string;
    routineExerciseId?: string;
    name: string;
    target?: string;
    restTimeSeconds: number;
    sets: ActiveSetData[];
}

export interface WorkoutLog {
    id: string;
    routineId?: string;
    routineName: string;
    startTime: number;
    endTime: number;
    durationSeconds: number;
    exercises: ActiveExerciseData[]; // To keep it simple, we store the full finished state
}

export interface PreviousStat {
    date: number;
    isCardio: boolean;
    time?: string;
    sets?: { weight: string; reps: string }[];
}
