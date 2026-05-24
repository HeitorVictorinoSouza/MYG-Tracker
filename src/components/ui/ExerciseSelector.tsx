import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE, type ExerciseInfo } from '../../data/exercises';

const MUSCLE_GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio'];

interface ExerciseSelectorProps {
    onSelect: (exercise: ExerciseInfo) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customTarget, setCustomTarget] = useState('');

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const groupedExercises = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = EXERCISE_DATABASE.filter(ex =>
            ex.name.toLowerCase().includes(query) || ex.target.toLowerCase().includes(query)
        );

        const groups: Record<string, ExerciseInfo[]> = {};
        filtered.forEach(ex => {
            if (!groups[ex.target]) groups[ex.target] = [];
            groups[ex.target].push(ex);
        });

        return groups;
    }, [searchQuery]);

    const groupOrder = MUSCLE_GROUPS;
    const activeGroups = groupOrder.filter(g => groupedExercises[g]?.length > 0);

    const openCreateForm = () => {
        setCustomName(searchQuery.trim());
        setCustomTarget('');
        setIsCreating(true);
    };

    const handleCreate = () => {
        const name = customName.trim();
        if (!name || !customTarget) return;
        onSelect({ name, target: customTarget });
        setIsCreating(false);
        setCustomName('');
        setCustomTarget('');
    };

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
                        if (e.target.value.trim().length > 0) {
                            const allOpen: Record<string, boolean> = {};
                            groupOrder.forEach(g => (allOpen[g] = true));
                            setExpandedGroups(allOpen);
                        }
                        setIsCreating(false);
                    }}
                    className="w-full bg-black/5 dark:bg-white/5 py-3 pl-10 pr-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue shadow-inner"
                />
            </div>

            {/* Create Custom Exercise */}
            <AnimatePresence mode="wait">
                {isCreating ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-ios-blue/5 border border-ios-blue/20 rounded-2xl p-4 space-y-3"
                    >
                        <p className="text-xs font-bold text-ios-blue uppercase tracking-wider">Novo exercício personalizado</p>
                        <input
                            type="text"
                            placeholder="Nome do exercício"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            autoFocus
                            className="w-full bg-white dark:bg-[#1C1C1E] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ios-blue"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {MUSCLE_GROUPS.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setCustomTarget(g)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-between gap-1 ${
                                        customTarget === g
                                            ? 'bg-ios-blue text-white'
                                            : 'bg-white dark:bg-[#1C1C1E] text-ios-gray'
                                    }`}
                                >
                                    {g}
                                    {customTarget === g && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-sm font-bold text-ios-gray"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!customName.trim() || !customTarget}
                                className="flex-1 py-2.5 rounded-xl bg-ios-blue text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Adicionar
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="trigger"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={openCreateForm}
                        className="flex items-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-dashed border-ios-blue/30 bg-ios-blue/5 text-ios-blue font-bold text-sm hover:bg-ios-blue/10 transition-colors"
                    >
                        <Plus size={16} />
                        Criar exercício personalizado
                        {searchQuery.trim() && (
                            <span className="ml-auto text-xs font-semibold text-ios-blue/60 truncate max-w-[140px]">
                                "{searchQuery.trim()}"
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="flex-1 overflow-y-auto rounded-xl space-y-2 pb-10">
                {activeGroups.length === 0 ? (
                    <div className="text-center text-ios-gray py-8 text-sm font-semibold">
                        Nenhum exercício encontrado.
                    </div>
                ) : (
                    activeGroups.map(group => {
                        const isOpen = expandedGroups[group] === true;
                        return (
                            <div key={group} className="bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-black text-lg"
                                >
                                    <span>
                                        {group}{' '}
                                        <span className="text-xs text-ios-gray font-semibold font-normal ml-2">
                                            ({groupedExercises[group].length})
                                        </span>
                                    </span>
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
