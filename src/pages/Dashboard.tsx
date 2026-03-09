import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronRight, Activity, TrendingUp, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, ComposedChart, Line, YAxis, Tooltip, Legend, LineChart, CartesianGrid } from 'recharts';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { WorkoutLog } from '../types';
import { EXERCISE_DATABASE } from '../data/exercises';

export function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<WorkoutLog[]>([]);
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Exercise Progression States
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [availableExercises, setAvailableExercises] = useState<string[]>([]);

    useEffect(() => {
        if (!user) return;

        // Fetch last 30 days of workouts
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const q = query(
            collection(db, `users/${user.uid}/history`),
            where('startTime', '>=', thirtyDaysAgo),
            orderBy('startTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs: WorkoutLog[] = [];

            // For Exercise Dropdown
            const exerciseSet = new Set<string>();

            snapshot.forEach((doc) => {
                const log = { id: doc.id, ...doc.data() } as WorkoutLog;
                logs.push(log);

                log.exercises.forEach(ex => exerciseSet.add(ex.name));
            });
            setHistory(logs);
            calculateStreak(logs);

            const uniqueExs = Array.from(exerciseSet).sort();
            setAvailableExercises(uniqueExs);
            if (uniqueExs.length > 0 && !selectedExercise) {
                setSelectedExercise(uniqueExs[0]);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const calculateStreak = (logs: WorkoutLog[]) => {
        if (logs.length === 0) {
            setStreak(0);
            return;
        }

        // Standardize to beginning of day for comparison
        const getStartOfDay = (ts: number) => new Date(ts).setHours(0, 0, 0, 0);

        const uniqueDays = [...new Set(logs.map(log => getStartOfDay(log.startTime)))].sort((a, b) => b - a);

        const today = getStartOfDay(Date.now());
        const yesterday = getStartOfDay(Date.now() - 86400000);

        let currentStreak = 0;
        let expectedDay: number | null = uniqueDays[0] === today ? today : (uniqueDays[0] === yesterday ? yesterday : null);

        if (!expectedDay) {
            setStreak(0); // Didn't workout today or yesterday = broken streak
            return;
        }

        for (const day of uniqueDays) {
            if (day === expectedDay) {
                currentStreak++;
                expectedDay = expectedDay - 86400000; // Expected day moves back 1 day
            } else {
                break;
            }
        }

        setStreak(currentStreak);
    };

    // Prepare frequency chart data (last 7 days)
    const getFrequencyData = () => {
        const data = [];
        const today = new Date();
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const startStr = new Date(d).setHours(0, 0, 0, 0);

            // Check if any log falls on this day
            const workedOut = history.some(log => new Date(log.startTime).setHours(0, 0, 0, 0) === startStr);

            data.push({
                name: i === 0 ? 'Hoje' : days[d.getDay()],
                value: workedOut ? 1 : 0
            });
        }
        return data;
    };

    // Calculate progression data for selected exercise
    const getProgressionData = () => {
        if (!selectedExercise || history.length === 0) return [];

        const data: any[] = [];

        // Iterate history from oldest to newest for the chart timeline
        [...history].reverse().forEach(log => {
            const exerciseInstance = log.exercises.find(ex => ex.name === selectedExercise);
            if (exerciseInstance && exerciseInstance.sets.length > 0) {

                // Find Max Weight in this session
                let maxWeight = 0;
                let maxWeightReps = 0;
                let validVolume = false;

                exerciseInstance.sets.forEach(set => {
                    if (set.completed && set.weight) {
                        validVolume = true;
                        const w = parseFloat(set.weight.replace(',', '.'));
                        if (!isNaN(w) && w >= maxWeight) {
                            maxWeight = w;
                            const r = parseInt(set.reps || '0');
                            maxWeightReps = r;
                        }
                    }
                });

                if (validVolume) {
                    data.push({
                        date: new Date(log.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        maxWeight: maxWeight,
                        setsVolume: exerciseInstance.sets.filter(s => s.completed).length,
                        topReps: maxWeightReps
                    });
                }
            }
        });

        return data;
    };

    // Calculate total volume per workout for the history chart
    const getTotalVolumeData = () => {
        if (history.length === 0) return [];

        return [...history].reverse().map(log => {
            let totalVolume = 0;
            log.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        const w = parseFloat(set.weight.replace(',', '.'));
                        const r = parseInt(set.reps.toString());
                        if (!isNaN(w) && !isNaN(r)) {
                            totalVolume += (w * r);
                        }
                    }
                });
            });
            return {
                date: new Date(log.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                volume: totalVolume
            };
        });
    };

    const freqData = getFrequencyData();
    const progressionData = getProgressionData();
    const volumeData = getTotalVolumeData();

    if (isLoading) {
        return <div className="p-6 pt-16 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-ios-blue rounded-full border-t-transparent"></div></div>;
    }

    const isCardio = EXERCISE_DATABASE.find(ex => ex.name === selectedExercise)?.target === 'Cardio';

    return (
        <div className="p-6 pt-12 space-y-8 min-h-screen">
            {/* Header & Avatar */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <p className="text-ios-gray font-medium text-sm tracking-wide uppercase">Visão Geral</p>
                    <h1 className="text-3xl font-black tracking-tight">Evolução</h1>
                </div>
                <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center font-bold text-lg text-ios-blue shadow-inner relative">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'H'}
                    {streak >= 3 && (
                        <div className="absolute -top-1 -right-1 bg-white dark:bg-black rounded-full p-0.5 shadow-sm">
                            <Flame size={14} className="text-orange-500 fill-orange-500" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass rounded-3xl p-4 flex flex-col justify-between aspect-square border-black/5 dark:border-white/5 relative overflow-hidden bg-white/50 dark:bg-[#1C1C1E]/50 min-w-0"
                >
                    <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 self-end shadow-sm">
                        <Flame size={20} className={cn(streak > 0 && "fill-orange-500")} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-3xl font-black">{streak}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-ios-gray uppercase tracking-wider break-words leading-tight mt-1">Dias Ofensiva</p>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -bottom-4 -right-4 text-orange-500/5 rotate-12 pointer-events-none">
                        <Flame size={100} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass rounded-3xl p-4 flex flex-col justify-between aspect-square border-black/5 dark:border-white/5 relative overflow-hidden bg-white/50 dark:bg-[#1C1C1E]/50 min-w-0"
                >
                    <div className="w-10 h-10 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue shrink-0 self-end shadow-sm">
                        <Activity size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-3xl font-black">{history.length}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-ios-gray uppercase tracking-wider break-words leading-tight mt-1">Treinos (30d)</p>
                    </div>
                </motion.div>
            </div>

            {/* Total Volume history */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                className="glass p-4 rounded-3xl mt-6 h-72 border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/40"
            >
                <h2 className="text-lg font-bold mb-4 px-2 flex items-center gap-2">
                    <Activity size={18} className="text-ios-blue" /> Volume Total (kg)
                </h2>
                {volumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={volumeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142, 142, 147, 0.2)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93', fontWeight: 'bold' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93' }} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tw-colors-ios-bg)' }}
                                labelStyle={{ color: '#8E8E93', fontWeight: 'bold' }}
                                itemStyle={{ color: '#007AFF', fontWeight: 'bold' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="volume"
                                name="Volume Total"
                                stroke="#007AFF"
                                strokeWidth={4}
                                dot={{ r: 4, fill: '#007AFF', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-ios-gray/50 font-semibold text-sm pb-10">
                        Nenhum volume registrado ainda.
                    </div>
                )}
            </motion.div>

            {/* Frequência (Bar Chart) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Frequência</h2>
                    <span className="text-xs font-bold text-ios-blue bg-ios-blue/10 px-2 py-1 rounded-md">Últimos 7 dias</span>
                </div>
                <div className="h-40 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={freqData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <Bar
                                dataKey="value"
                                radius={[4, 4, 4, 4]}
                                barSize={24}
                                fill="#007AFF"
                                fillOpacity={0.8}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Exercise Progression Chart */}
            {availableExercises.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5"
                >
                    <div className="flex justify-between items-center mb-6 gap-2">
                        <h2 className="text-lg font-bold flex items-center gap-2 shrink-0">
                            {isCardio ? <Activity size={18} className="text-ios-blue" /> : <TrendingUp size={18} className="text-green-500" />}
                            {isCardio ? 'Duração' : 'Carga'}
                        </h2>
                        <div className="relative min-w-0 flex-1 flex justify-end">
                            <select
                                className="appearance-none max-w-full bg-black/5 dark:bg-white/5 text-ios-blue text-xs font-bold py-1.5 pl-3 pr-8 rounded-md focus:outline-none truncate"
                                value={selectedExercise}
                                onChange={(e) => setSelectedExercise(e.target.value)}
                            >
                                {availableExercises.map(ex => (
                                    <option key={ex} value={ex} className="text-black">{ex}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ios-blue pointer-events-none" />
                        </div>
                    </div>

                    <div className="h-48 w-full mt-4 -ml-4">
                        {progressionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={progressionData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 10 }} />
                                    {!isCardio && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,149,0,0.5)', fontSize: 10 }} />}
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#8E8E93' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                                    {!isCardio && <Bar yAxisId="right" dataKey="setsVolume" name="Séries" barSize={12} fill="rgba(255,149,0,0.2)" radius={[4, 4, 4, 4]} />}
                                    {!isCardio && <Line yAxisId="right" type="monotone" dataKey="topReps" name="Reps Máx" stroke="#007AFF" strokeWidth={3} strokeDasharray="4 4" dot={{ strokeWidth: 2, r: 3, fill: '#007AFF' }} />}
                                    <Line yAxisId="left" type="monotone" dataKey="maxWeight" name={isCardio ? "Tempo (min)" : "Carga (kg)"} stroke={isCardio ? "#007AFF" : "#34C759"} strokeWidth={4} dot={{ strokeWidth: 2, r: 4, fill: isCardio ? '#007AFF' : '#34C759' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-ios-gray/50 font-semibold text-sm">
                                Grave mais treinos para ver dados.
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Recent Workouts */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <h2 className="text-sm font-bold text-ios-gray uppercase tracking-wider">Últimos Treinos</h2>
                    <button onClick={() => navigate('/history')} className="text-ios-blue text-sm font-semibold flex items-center">
                        Ver Todos <ChevronRight size={16} />
                    </button>
                </div>

                <div className="space-y-3">
                    {history.slice(0, 3).map((log, i) => (
                        <motion.button
                            key={log.id}
                            onClick={() => navigate(`/workout/log/${log.id}/edit`)}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                            className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl flex items-center justify-between border border-black/5 dark:border-white/5 active:scale-95 transition-transform shadow-sm w-full"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center font-bold text-ios-gray">
                                    {new Date(log.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </div>
                                <div>
                                    <h3 className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{log.routineName}</h3>
                                    <p className="text-sm text-ios-gray">{log.exercises.length} exercícios • {Math.floor(log.durationSeconds / 60)} min</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-ios-gray/30" />
                        </motion.button>
                    ))}
                    {history.length === 0 && (
                        <div className="text-center text-ios-gray p-8 bg-black/5 dark:bg-white/5 rounded-3xl">
                            Nenhum treino finalizado nos últimos 30 dias.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
