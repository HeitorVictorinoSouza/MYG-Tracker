import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Routine } from '../../types';

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: Omit<Routine, 'id'>) => void;
}

const DAYS_OF_WEEK = [
    { label: 'D', value: 0 },
    { label: 'S', value: 1 },
    { label: 'T', value: 2 },
    { label: 'Q', value: 3 },
    { label: 'Q', value: 4 },
    { label: 'S', value: 5 },
    { label: 'S', value: 6 },
];

export function RoutineModal({ isOpen, onClose, onSave }: RoutineModalProps) {
    const [name, setName] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            name,
            daysOfWeek: selectedDays,
            exercises: [] // Start with empty exercises, can be edited later
        });
        setName('');
        setSelectedDays([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-4 right-4 top-[20%] glass rounded-[2rem] p-6 z-50 shadow-2xl border border-black/5 dark:border-white/10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Nova Rotina</h2>
                            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/10 rounded-full active:scale-95 transition-transform text-ios-gray">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-ios-gray mb-2">NOME DO TREINO</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Peito e Tríceps"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1C1C1E] rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-ios-gray mb-2">DIAS DA SEMANA</label>
                                <div className="flex justify-between items-center gap-1">
                                    {DAYS_OF_WEEK.map(day => {
                                        const isSelected = selectedDays.includes(day.value);
                                        return (
                                            <button
                                                key={day.value}
                                                onClick={() => toggleDay(day.value)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all active:scale-90",
                                                    isSelected
                                                        ? "bg-ios-blue text-white shadow-md"
                                                        : "bg-white dark:bg-[#1C1C1E] text-ios-gray border border-black/5 dark:border-white/10"
                                                )}
                                            >
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={!name.trim()}
                                className="w-full mt-4 flex items-center gap-2"
                            >
                                <Check size={20} />
                                Criar Rotina
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
