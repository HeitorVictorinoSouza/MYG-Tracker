import { SetRow } from './SetRow';
import { Button } from '../ui/Button';
import { Check, History } from 'lucide-react';
import type { PreviousStat } from '../../types';

interface ExerciseData {
    id: string;
    name: string;
    target?: string;
    sets: Array<{ id: string; weight: string; reps: string; rpe: string; completed: boolean }>;
}

interface ExerciseCardProps {
    exercise: ExerciseData;
    previousPerformance?: PreviousStat;
    onUpdateSet: (setId: string, field: string, value: string | boolean) => void;
    onDeleteSet: (setId: string) => void;
    onAddSet: () => void;
    onCompleteSet: () => void;
}

export function ExerciseCard({ exercise, previousPerformance, onUpdateSet, onDeleteSet, onAddSet, onCompleteSet }: ExerciseCardProps) {
    const isCardio = exercise.target === 'Cardio';

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[2rem] p-5 shadow-sm border border-black/5 dark:border-white/10 mb-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold flex-1 pr-2">{exercise.name}</h3>
            </div>

            {/* Historic Performance Section */}
            {previousPerformance && (
                <div className="mb-4 bg-ios-gray/5 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-ios-gray font-bold mb-2">
                        <History size={14} />
                        <span>Treino Anterior ({formatDate(previousPerformance.date)})</span>
                    </div>

                    {previousPerformance.isCardio ? (
                        <div className="flex items-center justify-center p-2 bg-white dark:bg-black/20 rounded-xl">
                            <span className="font-bold text-sm">{previousPerformance.time}</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
                            {previousPerformance.sets?.map((set, idx) => (
                                <div key={idx} className="flex-shrink-0 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl p-2.5 min-w-[80px] flex flex-col items-center justify-center gap-0.5 shadow-sm">
                                    <span className="text-[10px] uppercase font-bold text-ios-gray tracking-wider">Série {idx + 1}</span>
                                    <span className="text-sm font-black text-ios-blue">{set.weight}kg</span>
                                    <span className="text-xs font-semibold">{set.reps} reps</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex text-xs font-semibold text-ios-gray px-3 mb-2">
                {!isCardio && <div className="w-8 text-center text-[10px] uppercase tracking-wider">Set</div>}
                <div className={`flex-1 grid gap-2 px-2 text-center text-[10px] uppercase tracking-wider ${isCardio ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    <span>{isCardio ? 'Min' : 'kg'}</span>
                    {!isCardio && <span>Reps</span>}
                    {!isCardio && <span>RPE</span>}
                </div>
                <div className="w-10 text-center text-[10px] uppercase tracking-wider"><Check size={14} className="mx-auto" /></div>
            </div>

            <div className="space-y-2">
                {exercise.sets.map((set: any, index: number) => (
                    <SetRow
                        key={set.id}
                        setNumber={index + 1}
                        weight={set.weight}
                        reps={set.reps}
                        rpe={set.rpe}
                        completed={set.completed}
                        isCardio={isCardio}
                        onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
                        onDelete={() => onDeleteSet(set.id)}
                        onComplete={onCompleteSet}
                    />
                ))}
            </div>

            {!isCardio && (
                <Button variant="ghost" className="w-full mt-3 py-3" onClick={onAddSet}>
                    + Adicionar Série
                </Button>
            )}
        </div>
    );
}
