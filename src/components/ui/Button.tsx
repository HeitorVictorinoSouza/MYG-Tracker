import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <motion.button
                whileTap={{ scale: 0.96 }}
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl font-semibold transition-colors focus:outline-none disabled:opacity-50",
                    {
                        "bg-ios-blue text-white": variant === 'primary',
                        "bg-ios-lightGray text-ios-darkText dark:bg-white/10 dark:text-white": variant === 'secondary',
                        "bg-ios-red text-white": variant === 'danger',
                        "bg-transparent text-ios-blue": variant === 'ghost',
                        "px-3 py-1.5 text-sm": size === 'sm',
                        "px-5 py-3 text-base": size === 'md',
                        "px-6 py-4 text-lg": size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
