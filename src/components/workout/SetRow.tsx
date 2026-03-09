import { SwipeableRow } from '../ui/SwipeableRow';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SetRowProps {
    setNumber: number;
    weight: string;
    reps: string;
    rpe: string;
    completed: boolean;
    isCardio?: boolean;
    onUpdate: (field: string, value: string | boolean) => void;
    onDelete: () => void;
    onComplete: () => void;
}

export function SetRow({ setNumber, weight, reps, rpe, completed, isCardio, onUpdate, onDelete, onComplete }: SetRowProps) {
    return (
        <SwipeableRow onDelete={onDelete}>
            <div className={cn("flex items-center gap-2 p-3 transition-colors", completed ? "bg-ios-gray/10 dark:bg-white/5 opacity-60" : "")}>
                {!isCardio && (
                    <div className="w-8 text-center font-bold text-ios-gray">
                        {setNumber}
                    </div>
                )}

                <div className={`flex-1 grid gap-2 ${isCardio ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder={isCardio ? "Minutos" : "kg"}
                        value={weight} // we repurpose the 'weight' field to hold 'minutes'
                        onChange={(e) => onUpdate('weight', e.target.value)}
                        disabled={completed}
                        className="w-full bg-ios-bg dark:bg-black rounded-xl px-1 py-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-ios-blue disabled:opacity-50 text-[15px]"
                    />
                    {!isCardio && (
                        <>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Reps"
                                value={reps}
                                onChange={(e) => onUpdate('reps', e.target.value)}
                                disabled={completed}
                                className="w-full bg-ios-bg dark:bg-black rounded-xl px-1 py-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-ios-blue disabled:opacity-50 text-[15px]"
                            />
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="RPE"
                                value={rpe}
                                onChange={(e) => onUpdate('rpe', e.target.value)}
                                disabled={completed}
                                className="w-full bg-ios-bg dark:bg-black rounded-xl px-1 py-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-ios-blue disabled:opacity-50 text-[15px]"
                            />
                        </>
                    )}
                </div>

                <button
                    onClick={() => {
                        const willComplete = !completed;
                        onUpdate('completed', willComplete);
                        if (willComplete) onComplete();
                    }}
                    className={cn(
                        "w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 transition-all mr-1",
                        completed ? "bg-ios-blue border-ios-blue text-white scale-105" : "border-ios-lightGray text-transparent dark:border-white/20 active:bg-black/5"
                    )}
                >
                    <Check size={20} strokeWidth={3} />
                </button>
            </div>
        </SwipeableRow>
    );
}
