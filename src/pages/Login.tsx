import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[#F2F2F7] dark:bg-black flex flex-col items-center justify-center p-6 selection:bg-ios-blue/30">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-ios-blue/20 dark:bg-ios-blue/30 rounded-full blur-[80px] sm:blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -60, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px] sm:blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // smooth spring-like bezier
                className="relative z-10 w-full max-w-sm flex flex-col items-center"
            >
                {/* Logo Icon Container with Glassmorphism */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="mb-8 p-1 rounded-[2.5rem] bg-gradient-to-br from-ios-blue to-purple-500 shadow-2xl shadow-ios-blue/30"
                >
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-[2.3rem] border border-white/20">
                        <Dumbbell size={56} strokeWidth={1.5} className="text-white" />
                    </div>
                </motion.div>

                <div className="text-center space-y-4 mb-16 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-4xl sm:text-5xl font-black tracking-tight text-ios-darkText dark:text-white"
                    >
                        Gym Tracker
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-lg text-ios-gray/80 dark:text-gray-400 font-medium leading-snug max-w-[280px] mx-auto"
                    >
                        Treine pesado. Registre rápido. Evolua sempre.
                    </motion.p>
                </div>

                {/* Ultra-Premium Login Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full relative overflow-hidden group rounded-full bg-white dark:bg-[#1C1C1E] shadow-lg shadow-black/5 dark:shadow-white/5 border border-black/5 dark:border-white/10 p-1 flex items-center h-16 transition-colors"
                >
                    {/* Google G Icon Logo */}
                    <div className="h-full aspect-square rounded-full bg-[#F2F2F7] dark:bg-black/50 flex items-center justify-center p-3 z-10">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>

                    <span className="flex-1 text-center font-bold text-[15px] sm:text-[16px] text-ios-darkText dark:text-white z-10">
                        {isLoading ? "Autenticando..." : "Continuar com o Google"}
                    </span>

                    {/* Animated trailing arrow that appears on hover */}
                    <div className="absolute right-4 z-10 w-8 h-8 flex items-center justify-center">
                        <AnimatePresence>
                            {(isHovered || isLoading) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    {isLoading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-ios-blue border-t-transparent rounded-full" />
                                    ) : (
                                        <ArrowRight size={20} className="text-ios-gray" />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Subtle Hover Gradient background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent dark:via-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                </motion.button>
            </motion.div>
        </div>
    );
}
