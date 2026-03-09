import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE, type ExerciseInfo } from '../../data/exercises';

interface ExerciseSelectorProps {
    onSelect: (exercise: ExerciseInfo) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    const groupedExercises = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = EXERCISE_DATABASE.filter(ex =>
            ex.name.toLowerCase().includes(query) || ex.target.toLowerCase().includes(query)
        );

        const groups: Record<string, ExerciseInfo[]> = {};
        filtered.forEach(ex => {
            if (!groups[ex.target]) {
                groups[ex.target] = [];
            }
            groups[ex.target].push(ex);
        });

        return groups;
    }, [searchQuery]);

    const groupOrder = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio'];
    const activeGroups = groupOrder.filter(g => groupedExercises[g] && groupedExercises[g].length > 0);

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray" />
                <input
                    type="text"
                    placeholder="Buscar exercício ou grupo muscular..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Auto-expand all if searching
                        if (e.target.value.trim().length > 0) {
                            const allOpen: Record<string, boolean> = {};
                            groupOrder.forEach(g => allOpen[g] = true);
                            setExpandedGroups(allOpen);
                        }
                    }}
                    className="w-full bg-black/5 dark:bg-white/5 py-3 pl-10 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue shadow-inner"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto rounded-xl space-y-2 pb-10">
                {activeGroups.length === 0 ? (
                    <div className="text-center text-ios-gray py-8">
                        Nenhum exercício encontrado.
                    </div>
                ) : (
                    activeGroups.map(group => {
                        const isOpen = expandedGroups[group] === true; // Default closed
                        return (
                            <div key={group} className="bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-black text-lg"
                                >
                                    <span>{group} <span className="text-xs text-ios-gray font-semibold font-normal ml-2">({groupedExercises[group].length})</span></span>
                                    {isOpen ? <ChevronUp size={20} className="text-ios-gray" /> : <ChevronDown size={20} className="text-ios-gray" />}
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                {groupedExercises[group].map(ex => (
                                                    <button
                                                        key={ex.name}
                                                        onClick={() => onSelect(ex)}
                                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-ios-blue/10 dark:hover:bg-ios-blue/20 hover:text-ios-blue transition-colors font-semibold text-[15px] border border-transparent active:scale-[0.98]"
                                                    >
                                                        {ex.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
