import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Plus, X, ChevronLeft } from 'lucide-react';
import { ExerciseCard } from '../components/workout/ExerciseCard';
import { BottomSheet } from '../components/ui/BottomSheet';
import { ExerciseSelector } from '../components/ui/ExerciseSelector';
import { Button } from '../components/ui/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Routine, ActiveExerciseData, RoutineSet, WorkoutLog, ActiveSetData, PreviousStat } from '../types';
import type { ExerciseInfo } from '../data/exercises';

export function ActiveWorkout() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [routineName, setRoutineName] = useState('Sessão Livre');
    const [exercises, setExercises] = useState<ActiveExerciseData[]>([]);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [restTimer, setRestTimer] = useState(0); // in seconds
    const [elapsedTimer, setElapsedTimer] = useState(0);
    const [startTime] = useState(Date.now());
    const [isSaving, setIsSaving] = useState(false);
    const [previousStats, setPreviousStats] = useState<Record<string, PreviousStat>>({});

    // Fetch routine details
    useEffect(() => {
        const fetchRoutine = async () => {
            if (!user || !id) return;
            const docRef = doc(db, `users/${user.uid}/routines/${id}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Routine;
                setRoutineName(data.name);

                // Map Template -> Active Session Data
                if (data.exercises) {
                    const activeExs: ActiveExerciseData[] = data.exercises.map(ex => ({
                        id: Math.random().toString(),
                        routineExerciseId: ex.id,
                        name: ex.name,
                        target: ex.target,
                        restTimeSeconds: ex.restTimeSeconds || 90,
                        sets: ex.sets.map((set: RoutineSet) => ({
                            id: Math.random().toString(),
                            routineSetId: set.id,
                            type: set.type,
                            weight: '',
                            reps: '',
                            rpe: '',
                            completed: false
                        }))
                    }));
                    setExercises(activeExs);
                }
            }
        };
        fetchRoutine();
    }, [id, user]);

    // Fetch previous performances
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            const q = query(
                collection(db, `users/${user.uid}/history`),
                orderBy('startTime', 'desc'),
                limit(15) // Look at the last 15 workouts
            );

            const snapshot = await getDocs(q);
            const historyObj: Record<string, PreviousStat> = {};

            // Go through history, newest first
            snapshot.forEach(doc => {
                const log = doc.data() as WorkoutLog;
                if (!log.exercises) return;

                log.exercises.forEach(ex => {
                    // Only process if we haven't found a previous stat for this exercise yet
                    if (!historyObj[ex.name]) {

                        if (ex.target === 'Cardio') {
                            // Find the first completed set for time
                            const compSet = ex.sets.find((s: ActiveSetData) => s.completed && s.reps);
                            if (compSet) {
                                historyObj[ex.name] = {
                                    date: log.startTime,
                                    isCardio: true,
                                    time: `${compSet.reps} Min`
                                };
                            }
                        } else {
                            // Collect all completed normal/working sets
                            const completedSets = ex.sets.filter((s: ActiveSetData) => s.completed && s.type !== 'warmup' && s.type !== 'feeder' && s.weight && s.reps);

                            if (completedSets.length > 0) {
                                historyObj[ex.name] = {
                                    date: log.startTime,
                                    isCardio: false,
                                    sets: completedSets.map((s: ActiveSetData) => ({ weight: s.weight, reps: s.reps }))
                                };
                            } else {
                                // Fallback: just find any completed set
                                const anySets = ex.sets.filter((s: ActiveSetData) => s.completed && s.weight && s.reps);
                                if (anySets.length > 0) {
                                    historyObj[ex.name] = {
                                        date: log.startTime,
                                        isCardio: false,
                                        sets: anySets.map((s: ActiveSetData) => ({ weight: s.weight, reps: s.reps }))
                                    };
                                }
                            }
                        }
                    }
                });
            });

            setPreviousStats(historyObj);
        };

        fetchHistory();
    }, [user]);

    // Global Elapsed Timer
    useEffect(() => {
        const int = setInterval(() => setElapsedTimer(prev => prev + 1), 1000);
        return () => clearInterval(int);
    }, []);

    // Rest Timer logic
    useEffect(() => {
        if (restTimer > 0) {
            const int = setInterval(() => setRestTimer(prev => prev - 1), 1000);
            return () => clearInterval(int);
        }
    }, [restTimer]);

    const handleUpdateSet = (exId: string, setId: string, field: string, value: string | boolean) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
            };
        }));
    };

    const handleDeleteSet = (exId: string, setId: string) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exId) return ex;
            return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        }));
    };

    const handleAddSet = (exId: string) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exId) return ex;
            const lastSet = ex.sets[ex.sets.length - 1];
            const newSet = {
                id: Math.random().toString(),
                type: lastSet ? lastSet.type : 'normal' as "warmup" | "feeder" | "normal" | "failure",
                weight: lastSet ? lastSet.weight : '',
                reps: '', rpe: '', completed: false
            };
            return { ...ex, sets: [...ex.sets, newSet] };
        }));
    };

    const handleCompleteSet = (restTime: number) => {
        setRestTimer(restTime); // Dynamic rest interaction
    };

    const addExercise = (ex: ExerciseInfo) => {
        setExercises(prev => [
            ...prev,
            {
                id: Math.random().toString(),
                name: ex.name,
                target: ex.target,
                restTimeSeconds: 90,
                sets: [{ id: Math.random().toString(), type: 'normal', weight: '', reps: '', rpe: '', completed: false }]
            }
        ]);
        setSheetOpen(false);
    };

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const finishWorkout = async () => {
        if (!user || exercises.length === 0) {
            navigate(-1);
            return;
        }

        setIsSaving(true);
        try {
            // Filter to only include sets that were actually completed
            const completedExercises = exercises.map(ex => ({
                ...ex,
                sets: ex.sets.filter(s => s.completed)
            })).filter(ex => ex.sets.length > 0);

            if (completedExercises.length === 0) {
                // If they completed nothing, just close
                navigate(-1);
                return;
            }

            const log: Omit<WorkoutLog, 'id'> = {
                routineId: id,
                routineName,
                startTime: startTime,
                endTime: Date.now(),
                durationSeconds: elapsedTimer,
                exercises: completedExercises
            };

            await addDoc(collection(db, `users/${user.uid}/history`), log);

            // Re-route to home
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Failed to save workout log", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-full pb-32">
            {/* Sticky Top Header */}
            <div className="sticky top-0 z-30 glass border-b border-black/5 dark:border-white/10 px-6 py-4 flex flex-col pt-safe">
                <div className="flex items-center gap-3 mb-2 -ml-2">
                    <button onClick={() => navigate(-1)} className="p-2 bg-black/5 dark:bg-white/10 rounded-full active:scale-95 text-ios-gray">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex justify-between items-center flex-1">
                        <h1 className="text-xl font-black truncate max-w-[200px]">{routineName}</h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-ios-blue/10 rounded-full px-4 text-xs font-bold disabled:opacity-50"
                            onClick={finishWorkout}
                            disabled={isSaving}
                        >
                            {isSaving ? "Salvando..." : "Concluir"}
                        </Button>
                    </div>
                </div>
                <div className="text-ios-blue font-semibold text-sm flex items-center gap-2">
                    <Timer size={16} /> {formatTime(elapsedTimer)}
                </div>
            </div>

            {/* Floating Rest Timer */}
            <AnimatePresence>
                {restTimer > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/80 dark:bg-white/90 text-white dark:text-black px-6 py-3 rounded-full shadow-2xl z-40 backdrop-blur-md flex items-center gap-3 font-semibold"
                    >
                        <Timer size={18} />
                        Descanso: {formatTime(restTimer)}
                        <button onClick={() => setRestTimer(0)} className="ml-2 bg-white/20 p-1 rounded-full"><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 space-y-6 mt-4">
                {exercises.map(ex => (
                    <ExerciseCard
                        key={ex.id}
                        exercise={ex}
                        previousPerformance={previousStats[ex.name]}
                        onUpdateSet={(setId, field, val) => handleUpdateSet(ex.id, setId, field, val)}
                        onDeleteSet={(setId) => handleDeleteSet(ex.id, setId)}
                        onAddSet={() => handleAddSet(ex.id)}
                        onCompleteSet={() => handleCompleteSet(ex.restTimeSeconds)}
                    />
                ))}

                <Button
                    variant="secondary"
                    className="w-full py-4 text-ios-blue border-2 border-dashed border-ios-blue/30 bg-ios-blue/5"
                    onClick={() => setSheetOpen(true)}
                >
                    <Plus size={20} className="mr-2" />
                    Adicionar Exercício
                </Button>
            </div>

            <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} title="Adicionar Exercício">
                <div className="h-full">
                    <ExerciseSelector onSelect={addExercise} />
                </div>
            </BottomSheet>
        </div>
    );
}
