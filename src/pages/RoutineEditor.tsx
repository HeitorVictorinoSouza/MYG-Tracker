import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Save, Trash2, GripVertical, Timer } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { ExerciseSelector } from '../components/ui/ExerciseSelector';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import type { Routine, RoutineExercise, RoutineSet, SetType } from '../types';
import type { ExerciseInfo } from '../data/exercises';

export function RoutineEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [routine, setRoutine] = useState<Routine | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const fetchRoutine = async () => {
            if (!user || !id) return;
            try {
                const docRef = doc(db, `users/${user.uid}/routines/${id}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Routine;
                    if (!data.exercises) data.exercises = []; // Ensure backward compatibility
                    setRoutine({ ...data, id });
                }
            } catch (err) {
                console.error("Error fetching routine:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoutine();
    }, [id, user]);

    const handleSave = async () => {
        if (!user || !id || !routine) return;
        try {
            const docRef = doc(db, `users/${user.uid}/routines/${id}`);
            await updateDoc(docRef, {
                name: routine.name,
                daysOfWeek: routine.daysOfWeek,
                exercises: routine.exercises
            });
            navigate(-1);
        } catch (err) {
            console.error("Error saving routine:", err);
        }
    };

    const addExercise = (ex: ExerciseInfo) => {
        if (!routine) return;
        const newExercise: RoutineExercise = {
            id: Math.random().toString(),
            name: ex.name,
            target: ex.target,
            restTimeSeconds: 90,
            sets: [
                { id: Math.random().toString(), type: 'normal', targetReps: '8-12' }
            ]
        };
        setRoutine({ ...routine, exercises: [...routine.exercises, newExercise] });
        setSheetOpen(false);
    };

    const updateExercise = (exId: string, updates: Partial<RoutineExercise>) => {
        if (!routine) return;
        setRoutine({
            ...routine,
            exercises: routine.exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex)
        });
    };

    const removeExercise = (exId: string) => {
        if (!routine) return;
        setRoutine({
            ...routine,
            exercises: routine.exercises.filter(ex => ex.id !== exId)
        });
    };

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-ios-bg dark:bg-black"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue"></div></div>;
    }

    if (!routine) {
        return <div className="p-6 pt-16">Rotina não encontrada.</div>;
    }

    return (
        <div className="min-h-full pb-32 bg-ios-bg dark:bg-black">
            {/* Header */}
            <div className="sticky top-0 z-30 glass border-b border-black/5 dark:border-white/10 px-6 py-4 flex flex-col pt-safe">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 bg-black/5 dark:bg-white/10 rounded-full active:scale-95 text-ios-gray">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Editar Rotina</h1>
                    <button onClick={handleSave} className="p-2 bg-ios-blue/10 text-ios-blue rounded-full active:scale-95 font-semibold">
                        <Save size={20} />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6 mt-4">
                {/* Meta Data */}
                <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-ios-gray uppercase tracking-wider mb-2 block">Nome da Rotina</label>
                        <input
                            type="text"
                            value={routine.name}
                            onChange={(e) => setRoutine({ ...routine, name: e.target.value })}
                            className="w-full bg-transparent text-xl font-bold focus:outline-none placeholder-ios-gray/50"
                        />
                    </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-ios-gray uppercase tracking-wider px-2">Exercícios</h2>
                    <AnimatePresence>
                        {routine.exercises.map((exercise) => (
                            <EditorExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onUpdate={(updates) => updateExercise(exercise.id, updates)}
                                onRemove={() => removeExercise(exercise.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <Button
                    variant="secondary"
                    className="w-full py-4 text-ios-blue border-2 border-dashed border-ios-blue/30 bg-ios-blue/5 rounded-3xl"
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

function EditorExerciseCard({ exercise, onUpdate, onRemove }: { exercise: RoutineExercise, onUpdate: (updates: Partial<RoutineExercise>) => void, onRemove: () => void }) {

    const setRestTime = (seconds: number) => onUpdate({ restTimeSeconds: seconds });

    const addSet = () => {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: RoutineSet = {
            id: Math.random().toString(),
            type: lastSet ? lastSet.type : 'normal',
            targetReps: lastSet ? lastSet.targetReps : '8-12'
        };
        onUpdate({ sets: [...exercise.sets, newSet] });
    };

    const updateSet = (setId: string, updates: Partial<RoutineSet>) => {
        onUpdate({
            sets: exercise.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        });
    };

    const removeSet = (setId: string) => {
        onUpdate({
            sets: exercise.sets.filter(s => s.id !== setId)
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
            className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-4 overflow-hidden"
        >
            <div className="flex items-center gap-3">
                <div className="text-ios-gray/30 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                </div>
                <div className="flex-1">
                    <input
                        className="w-full text-lg font-bold bg-transparent focus:outline-none"
                        value={exercise.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        placeholder="Nome do Exercício"
                    />
                </div>
                <button onClick={onRemove} className="text-ios-red/50 hover:text-ios-red p-2 transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Rest Timer Config */}
            {exercise.target !== 'Cardio' && (
                <div className="flex items-center gap-2 bg-ios-bg dark:bg-black/40 p-3 rounded-2xl">
                    <Timer size={16} className="text-ios-gray" />
                    <span className="text-sm font-semibold text-ios-gray">Descanso:</span>
                    <select
                        value={exercise.restTimeSeconds}
                        onChange={(e) => setRestTime(Number(e.target.value))}
                        className="bg-transparent font-bold focus:outline-none ml-auto"
                    >
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={90}>1m 30s</option>
                        <option value={120}>2m</option>
                        <option value={180}>3m</option>
                        <option value={300}>5m</option>
                    </select>
                </div>
            )}

            {/* Sets Header */}
            <div className="flex text-[10px] font-bold text-ios-gray px-1 uppercase tracking-wider mt-2">
                {exercise.target !== 'Cardio' && <div className="w-8 text-center">Set</div>}
                {exercise.target !== 'Cardio' && <div className="flex-1 text-center">Tipo</div>}
                <div className={exercise.target === 'Cardio' ? "flex-1 text-center" : "w-24 text-center"}>
                    {exercise.target === 'Cardio' ? 'Minutos Alvo' : 'Reps Alvo'}
                </div>
                <div className="w-8"></div>
            </div>

            {/* Sets List */}
            <div className="space-y-2">
                <AnimatePresence>
                    {exercise.sets.map((set, setIdx) => (
                        <motion.div
                            key={set.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 bg-ios-bg dark:bg-black/20 p-2 rounded-xl"
                        >
                            {exercise.target !== 'Cardio' && (
                                <div className="w-8 text-center font-bold text-ios-gray text-sm">{setIdx + 1}</div>
                            )}

                            {exercise.target !== 'Cardio' && (
                                <select
                                    value={set.type}
                                    onChange={(e) => updateSet(set.id, { type: e.target.value as SetType })}
                                    className={cn(
                                        "flex-1 text-xs font-bold p-2 text-center rounded-lg appearance-none bg-white dark:bg-[#1C1C1E] focus:outline-none shadow-sm",
                                        {
                                            "text-orange-500": set.type === 'warmup',
                                            "text-blue-500": set.type === 'feeder',
                                            "text-green-500": set.type === 'normal',
                                            "text-red-500": set.type === 'failure',
                                        }
                                    )}
                                >
                                    <option value="warmup">Aquecimento</option>
                                    <option value="feeder">Aproximação</option>
                                    <option value="normal">Normal</option>
                                    <option value="failure">Falha/Drop</option>
                                </select>
                            )}

                            <input
                                type="text"
                                inputMode="decimal"
                                value={set.targetReps}
                                onChange={(e) => updateSet(set.id, { targetReps: e.target.value })}
                                className={`${exercise.target === 'Cardio' ? 'flex-1' : 'w-24'} text-center text-sm font-bold bg-white dark:bg-[#1C1C1E] py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-ios-blue shadow-sm`}
                                placeholder={exercise.target === 'Cardio' ? "15" : "8-12"}
                            />

                            <button onClick={() => removeSet(set.id)} className="w-8 h-8 flex items-center justify-center text-ios-gray/50 hover:text-ios-red transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {exercise.target !== 'Cardio' && (
                <Button variant="ghost" size="sm" onClick={addSet} className="mt-2 text-sm bg-black/5 dark:bg-white/5 py-2">
                    + Set
                </Button>
            )}
        </motion.div>
    );
}
