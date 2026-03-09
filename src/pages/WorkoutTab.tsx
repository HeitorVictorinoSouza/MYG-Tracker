import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RoutineModal } from '../components/routine/RoutineModal';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Routine } from '../types';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/ui/BottomSheet';

const DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function WorkoutTab() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);

    // Get current day of week (0-6)
    const todayIndex = new Date().getDay();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/routines`),
            // Ordering client-side for simplicity as we don't have a complex sort yet
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedRoutines: Routine[] = [];
            snapshot.forEach(doc => {
                loadedRoutines.push({ id: doc.id, ...doc.data() } as Routine);
            });
            setRoutines(loadedRoutines);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSaveRoutine = async (newRoutine: Omit<Routine, 'id'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/routines`), newRoutine);
        } catch (error) {
            console.error("Error adding routine: ", error);
        }
    };

    const startWorkout = (routineId: string) => {
        // Pass the routine ID to the active session
        navigate(`/workout/${routineId}/active`);
    };

    const handleDeleteRoutine = async (routineId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/routines/${routineId}`));
        } catch (error) {
            console.error("Error deleting routine: ", error);
        }
    };

    const todayRoutines = routines.filter(r => r.daysOfWeek.includes(todayIndex));
    const otherRoutines = routines.filter(r => !r.daysOfWeek.includes(todayIndex));

    return (
        <div className="p-6 pt-12 space-y-8 min-h-full">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Treinar</h1>
                    <p className="text-ios-gray font-medium">{DAYS_FULL[todayIndex]}, foco total.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="w-10 h-10 bg-ios-blue text-white rounded-full flex items-center justify-center shadow-soft active:scale-90 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {routines.length === 0 ? (
                <div className="glass rounded-[2rem] p-8 text-center flex flex-col items-center justify-center border border-black/5 dark:border-white/5 space-y-4">
                    <div className="w-16 h-16 bg-ios-blue/10 flex items-center justify-center rounded-full text-ios-blue">
                        <Plus size={32} />
                    </div>
                    <h3 className="text-xl font-bold">Nenhum treino montado</h3>
                    <p className="text-ios-gray text-sm">Crie sua primeira rotina de treino tocando no botão acima para começar.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Treinos de Hoje */}
                    <div>
                        <h2 className="text-sm font-bold text-ios-gray uppercase tracking-wider mb-3">Treino de Hoje</h2>
                        <div className="space-y-3">
                            {todayRoutines.length > 0 ? todayRoutines.map(routine => (
                                <RoutineCard
                                    key={routine.id}
                                    routine={routine}
                                    onStart={() => startWorkout(routine.id)}
                                    onEdit={() => navigate(`/routine/${routine.id}/edit`)}
                                    onDelete={() => handleDeleteRoutine(routine.id)}
                                    isToday={true}
                                />
                            )) : (
                                <div className="p-4 bg-white/50 dark:bg-black/30 rounded-2xl border border-black/5 text-center text-ios-gray text-sm">
                                    Dia de descanso! Nenhuma rotina agendada para hoje.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Outras Rotinas */}
                    {otherRoutines.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-ios-gray uppercase tracking-wider mb-3 mt-8">Outras Rotinas</h2>
                            <div className="space-y-3">
                                {otherRoutines.map(routine => (
                                    <RoutineCard
                                        key={routine.id}
                                        routine={routine}
                                        onStart={() => startWorkout(routine.id)}
                                        onEdit={() => navigate(`/routine/${routine.id}/edit`)}
                                        onDelete={() => handleDeleteRoutine(routine.id)}
                                        isToday={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <RoutineModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveRoutine}
            />
        </div>
    );
}

function RoutineCard({ routine, onStart, onEdit, onDelete, isToday }: { routine: Routine, onStart: () => void, onEdit: () => void, onDelete: () => void, isToday: boolean }) {
    const daysStr = routine.daysOfWeek.map(d => DAYS_FULL[d].substring(0, 3)).join(', ');
    const [isMenuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-4"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">{routine.name}</h3>
                        <p className="text-sm text-ios-gray mt-1 flex items-center gap-1">
                            {routine.exercises ? routine.exercises.length : 0} exercícios • {daysStr || 'Sem dias fixos'}
                        </p>
                    </div>
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="text-ios-gray/50 hover:text-ios-gray p-2 -mr-2 active:scale-95 transition-transform"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>

                <Button
                    onClick={onStart}
                    variant={isToday ? 'primary' : 'secondary'}
                    className="w-full flex justify-center items-center gap-2 py-3"
                >
                    <Play size={18} fill="currentColor" />
                    Iniciar Treino
                </Button>
            </motion.div>

            <BottomSheet isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} title="Opções">
                <div className="space-y-4 pt-2">
                    <button
                        onClick={() => { setMenuOpen(false); onEdit(); }}
                        className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl font-bold text-lg text-left shadow-sm active:scale-95 transition-transform"
                    >
                        Configurar Exercícios
                    </button>
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            if (window.confirm("Você tem certeza que deseja excluir esse treino? Esta ação é irreversível.")) {
                                onDelete();
                            }
                        }}
                        className="w-full bg-ios-red/10 text-ios-red p-4 rounded-2xl font-bold text-lg text-left active:scale-95 transition-transform"
                    >
                        Excluir Treino
                    </button>
                </div>
            </BottomSheet>
        </>
    );
}
