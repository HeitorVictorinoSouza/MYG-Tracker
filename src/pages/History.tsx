import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { WorkoutLog } from '../types';

export function History() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<WorkoutLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (!user) return;

        // Fetch all history for accurate calendar dots
        const q = query(
            collection(db, `users/${user.uid}/history`),
            orderBy('startTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs: WorkoutLog[] = [];
            snapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() } as WorkoutLog);
            });
            setHistory(logs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Calendar logic helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    // Format helpers
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Does this specific date have a workout?
    const workoutsOnDate = (date: Date) => {
        return history.filter(log => {
            const logDate = new Date(log.startTime);
            return isSameDay(logDate, date);
        });
    };

    // Render calendar grid
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-12"></div>);
        }

        const today = new Date();

        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);

            const dayWorkouts = workoutsOnDate(date);
            const hasWorkout = dayWorkouts.length > 0;

            days.push(
                <button
                    key={d}
                    onClick={() => setSelectedDate(date)}
                    className="relative h-12 flex flex-col items-center justify-center rounded-xl transition-all"
                >
                    <div className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all z-10",
                        isSelected
                            ? "bg-ios-blue text-white shadow-md shadow-ios-blue/30 scale-110 border-0 relative z-20"
                            : isToday
                                ? "text-ios-blue"
                                : "text-ios-gray hover:bg-black/5 dark:hover:bg-white/5",
                        !isSelected && hasWorkout && "border-2 border-ios-blue text-ios-blue"
                    )}>
                        {d}
                    </div>
                </button>
            );
        }

        return days;
    };

    const selectedWorkouts = workoutsOnDate(selectedDate);

    if (isLoading) {
        return <div className="p-6 pt-16 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-ios-blue rounded-full border-t-transparent"></div></div>;
    }

    return (
        <div className="p-6 pt-12 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-ios-gray hover:text-ios-blue transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
                        <CalendarIcon size={24} className="text-ios-blue" /> Histórico
                    </h1>
                </div>
                <div className="w-10"></div> {/* Match spacer for flex layout */}
            </div>

            {/* Calendar Widget */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[2rem] p-6 shadow-sm border border-black/5 dark:border-white/5 mx-auto max-w-sm w-full">
                {/* Month Control */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-lg font-bold capitalize">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 text-ios-gray hover:text-black dark:hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 text-ios-gray hover:text-black dark:hover:text-white transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day) => (
                        <div key={day} className="h-8 flex items-center justify-center text-[10px] font-bold text-ios-gray/60 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                </div>
            </div>

            {/* Selected Date Workouts */}
            <div className="pt-4 max-w-sm mx-auto w-full">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-bold text-ios-gray uppercase tracking-wider">
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </h3>
                    <span className="text-xs font-bold text-ios-blue bg-ios-blue/10 px-2 py-1 rounded-md">
                        {selectedWorkouts.length} Treino{selectedWorkouts.length !== 1 && 's'}
                    </span>
                </div>

                <div className="space-y-3">
                    {selectedWorkouts.length > 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            {selectedWorkouts.map((log) => (
                                <button
                                    key={log.id}
                                    onClick={() => navigate(`/workout/log/${log.id}/edit`)}
                                    className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl flex items-center justify-between border border-black/5 dark:border-white/5 active:scale-95 transition-transform shadow-sm w-full text-left"
                                >
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{log.routineName}</h4>
                                        <p className="text-sm font-semibold text-ios-gray flex gap-2">
                                            <span>{log.exercises.length} exercícios</span>
                                            <span>•</span>
                                            <span>{Math.floor(log.durationSeconds / 60)} min</span>
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-ios-blue/10 rounded-full flex items-center justify-center text-ios-blue">
                                        <ChevronRight size={20} />
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black/5 dark:bg-white/5 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon size={24} className="text-ios-gray/50" />
                            </div>
                            <p className="font-bold text-ios-gray pb-2">Nenhum treino</p>
                            <p className="text-xs font-semibold text-ios-gray/50">Você descansou neste dia.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
