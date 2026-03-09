import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { ReactNode } from 'react';
import { Trash } from 'lucide-react';

interface SwipeableRowProps {
    onDelete: () => void;
    children: ReactNode;
}

export function SwipeableRow({ onDelete, children }: SwipeableRowProps) {
    const controls = useAnimation();
    const [deleted, setDeleted] = useState(false);

    const handleDragEnd = (_event: any, info: any) => {
        if (info.offset.x < -100) {
            // Swipe enough to delete
            controls.start({ x: -window.innerWidth }).then(() => {
                setDeleted(true);
                onDelete();
            });
        } else {
            // Snap back to normal
            controls.start({ x: 0 });
        }
    };

    if (deleted) return null;

    return (
        <div className="relative w-full overflow-hidden bg-ios-red rounded-2xl mb-3">
            <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center text-white">
                <Trash size={24} />
            </div>
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.5, right: 0.1 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full h-full bg-white dark:bg-[#1C1C1E] rounded-2xl z-10 relative shadow-sm border border-black/5 dark:border-white/5"
            >
                {children}
            </motion.div>
        </div>
    );
}
