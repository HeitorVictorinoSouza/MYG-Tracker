import { useState, useEffect } from 'react';

import { Timer, Plus, ChevronLeft, Trash2 } from 'lucide-react';
import { ExerciseCard } from '../components/workout/ExerciseCard';
import { BottomSheet } from '../components/ui/BottomSheet';
import { ExerciseSelector } from '../components/ui/ExerciseSelector';
import { Button } from '../components/ui/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { ActiveExerciseData, WorkoutLog } from '../types';
import { EXERCISE_DATABASE, type ExerciseInfo } from '../data/exercises';

export function EditWorkout() {
    const { logId } = useParams<{ logId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [routineName, setRoutineName] = useState('Editar Treino');
    const [exercises, setExercises] = useState<ActiveExerciseData[]>([]);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [elapsedTimer, setElapsedTimer] = useState(0);
    const [originalLog, setOriginalLog] = useState<WorkoutLog | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch existing log
    useEffect(() => {
        const fetchLog = async () => {
            if (!user || !logId) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, `users/${user.uid}/history/${logId}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as WorkoutLog;
                    setOriginalLog(data);
                    setRoutineName(data.routineName);
                    setElapsedTimer(data.durationSeconds || 0);

                    // Map completed exercises into state
                    if (data.exercises) {
                        // Hydrate missing targets for older logs
                        const hydratedExs = data.exercises.map(ex => {
                            if (!ex.target) {
                                const dbEx = EXERCISE_DATABASE.find(dbE => dbE.name === ex.name);
                                if (dbEx) ex.target = dbEx.target;
                            }
                            return ex;
                        });
                        setExercises(hydratedExs);
                    }
                } else {
                    console.error("No log found");
                    navigate(-1);
                }
            } catch (error) {
                console.error("Failed to load workout log", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLog();
    }, [logId, user, navigate]);

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
                reps: '', rpe: '', completed: true // Pre-check true for editing
            };
            return { ...ex, sets: [...ex.sets, newSet] };
        }));
    };

    const handleCompleteSet = () => {
        // No rest timer needed in edit mode unless user really wants it
    };

    const addExercise = (ex: ExerciseInfo) => {
        setExercises(prev => [
            ...prev,
            {
                id: Math.random().toString(),
                name: ex.name,
                target: ex.target,
                restTimeSeconds: 90,
                sets: [{ id: Math.random().toString(), type: 'normal', weight: '', reps: '', rpe: '', completed: true }]
            }
        ]);
        setSheetOpen(false);
    };

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const saveChanges = async () => {
        if (!user || !logId || !originalLog) {
            navigate(-1);
            return;
        }

        setIsSaving(true);
        try {
            // Filter to only include sets that were actually completed and non-empty
            const completedExercises = exercises.map(ex => ({
                ...ex,
                sets: ex.sets.filter(s => s.completed)
            })).filter(ex => ex.sets.length > 0);

            if (completedExercises.length === 0) {
                // If they removed everything, maybe they want to delete?
                if (window.confirm("Você removeu todos os exercícios. Deseja excluir este treino?")) {
                    await handleDeleteWorkout();
                } else {
                    setIsSaving(false);
                }
                return;
            }

            const updatedFields: Partial<WorkoutLog> = {
                routineName,
                durationSeconds: elapsedTimer,
                exercises: completedExercises
            };

            const docRef = doc(db, `users/${user.uid}/history/${logId}`);
            await updateDoc(docRef, updatedFields);

            navigate(-1);
        } catch (error) {
            console.error("Failed to update workout log", error);
            setIsSaving(false);
        }
    };

    const handleDeleteWorkout = async () => {
        if (!user || !logId) return;
        if (window.confirm("Você tem certeza que deseja excluir esse log de treino definitivamente?")) {
            setIsSaving(true);
            try {
                const docRef = doc(db, `users/${user.uid}/history/${logId}`);
                await deleteDoc(docRef);
                navigate(-1);
            } catch (error) {
                console.error("Failed to delete log", error);
                setIsSaving(false);
            }
        }
    };

    if (isLoading) {
        return <div className="p-6 pt-16 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-ios-blue rounded-full border-t-transparent"></div></div>;
    }

    return (
        <div className="min-h-full pb-32">
            {/* Sticky Top Header */}
            <div className="sticky top-0 z-30 glass border-b border-black/5 dark:border-white/10 px-6 py-4 flex flex-col pt-safe">
                <div className="flex items-center gap-3 mb-2 -ml-2">
                    <button onClick={() => navigate(-1)} className="p-2 bg-black/5 dark:bg-white/10 rounded-full active:scale-95 text-ios-gray">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex justify-between items-center flex-1">
                        <input
                            value={routineName}
                            onChange={(e) => setRoutineName(e.target.value)}
                            className="text-xl font-black truncate max-w-[200px] bg-transparent focus:outline-none border-b border-transparent focus:border-ios-blue/30"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-ios-blue/10 rounded-full px-4 text-xs font-bold disabled:opacity-50"
                            onClick={saveChanges}
                            disabled={isSaving}
                        >
                            {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </div>
                <div className="text-ios-blue font-semibold text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Timer size={16} /> {formatTime(elapsedTimer)}
                    </div>
                    {originalLog && (
                        <span className="text-xs text-ios-gray">
                            Criado em: {new Date(originalLog.startTime).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-6 mt-4">
                {exercises.map(ex => (
                    <div key={ex.id} className="relative">
                        <ExerciseCard
                            exercise={ex}
                            onUpdateSet={(setId, field, val) => handleUpdateSet(ex.id, setId, field, val)}
                            onDeleteSet={(setId) => handleDeleteSet(ex.id, setId)}
                            onAddSet={() => handleAddSet(ex.id)}
                            onCompleteSet={() => handleCompleteSet()}
                        />
                        <button
                            onClick={() => setExercises(prev => prev.filter(e => e.id !== ex.id))}
                            className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-md active:scale-95"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                <Button
                    variant="secondary"
                    className="w-full py-4 text-ios-blue border-2 border-dashed border-ios-blue/30 bg-ios-blue/5"
                    onClick={() => setSheetOpen(true)}
                >
                    <Plus size={20} className="mr-2" />
                    Adicionar Exercício
                </Button>

                <div className="pt-8">
                    <Button
                        variant="ghost"
                        className="w-full py-4 text-red-500 bg-red-500/10 font-bold"
                        onClick={handleDeleteWorkout}
                        disabled={isSaving}
                    >
                        <Trash2 size={20} className="mr-2" />
                        Excluir Registo de Treino
                    </Button>
                </div>
            </div>

            <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} title="Adicionar Exercício">
                <div className="h-full">
                    <ExerciseSelector onSelect={addExercise} />
                </div>
            </BottomSheet>
        </div>
    );
}
