import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Settings, Dumbbell } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AppLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-ios-bg dark:bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-ios-bg dark:bg-black">
            <main className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation Navbar - Glassmorphism */}
            <nav className="fixed bottom-0 left-0 right-0 h-24 glass flex items-center justify-around px-6 pb-6 pt-2 z-40 border-t border-black/5 dark:border-white/10">
                <NavLink to="/" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-ios-blue" : "text-ios-gray")}>
                    <Home size={24} />
                    <span className="text-[10px] font-medium">Início</span>
                </NavLink>

                <NavLink to="/workout" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-ios-blue" : "text-ios-gray")}>
                    {({ isActive }) => (
                        <>
                            <div className={cn("p-3 rounded-full -mt-8 shadow-soft transition-transform", isActive ? "bg-ios-blue text-white" : "bg-white dark:bg-[#1C1C1E] text-ios-gray dark:text-gray-400 border border-black/5 dark:border-white/10")}>
                                <Dumbbell size={28} />
                            </div>
                            <span className="text-[10px] font-medium mt-1">Treinar</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-ios-blue" : "text-ios-gray")}>
                    <Settings size={24} />
                    <span className="text-[10px] font-medium">Perfil</span>
                </NavLink>
            </nav>
        </div>
    );
}
