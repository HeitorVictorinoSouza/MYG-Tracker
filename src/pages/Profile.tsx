import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    User, Settings, Moon, Scale, Bell,
    HelpCircle, Star, FileText, LogOut, ChevronRight
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

// Simple Settings Row Item
function SettingsRow({
    icon: Icon,
    label,
    value,
    onClick,
    danger = false
}: {
    icon: any,
    label: string,
    value?: string,
    onClick?: () => void,
    danger?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] active:bg-black/5 dark:active:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5 last:border-0 ${danger ? 'text-red-500' : 'text-ios-darkText dark:text-white'}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={22} className={danger ? 'text-red-500' : 'text-ios-blue'} />
                <span className="font-semibold text-[15px]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-sm font-medium text-ios-gray">{value}</span>}
                {!danger && <ChevronRight size={18} className="text-ios-gray/50" />}
            </div>
        </button>
    );
}

// Simple Settings Section Group
function SettingsGroup({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="px-5 mb-2 text-xs font-bold text-ios-gray uppercase tracking-wider">{title}</h3>
            <div className="rounded-[1.5rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-sm">
                {children}
            </div>
        </div>
    );
}

export function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Placeholder state for preferences
    const [theme] = useState('Sistema');
    const [unit] = useState('Kg');

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-full pb-32 bg-[#F2F2F7] dark:bg-black pt-safe">
            {/* Header Sticky */}
            <div className="sticky top-0 z-30 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-6 py-4">
                <h1 className="text-3xl font-black tracking-tight">Perfil</h1>
            </div>

            <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

                {/* Profile Card */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[2rem] p-6 shadow-sm border border-black/5 dark:border-white/10 flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-ios-gray/10 border-2 border-ios-blue/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Foto de perfil" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} className="text-ios-gray" />
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h2 className="text-xl font-bold truncate">
                            {user?.displayName || "Atleta Anônimo"}
                        </h2>
                        <p className="text-ios-gray text-sm font-medium truncate mt-0.5">
                            {user?.email || "Nenhum email vinculado"}
                        </p>
                        <div className="mt-3 inline-flex px-3 py-1 bg-ios-blue/10 text-ios-blue text-[10px] uppercase font-black tracking-wider rounded-full">
                            Conta Premium
                        </div>
                    </div>
                </div>

                {/* Settings Actions */}
                <SettingsGroup title="Conta & Corpo">
                    <SettingsRow icon={User} label="Editar Perfil" onClick={() => alert("Em breve!")} />
                    <SettingsRow icon={Scale} label="Medidas Corporais" value="Em breve" onClick={() => alert("Em breve!")} />
                </SettingsGroup>

                <SettingsGroup title="Preferências do App">
                    <SettingsRow icon={Moon} label="Tema" value={theme} onClick={() => alert("Em breve!")} />
                    <SettingsRow icon={Settings} label="Unidades" value={unit} onClick={() => alert("Em breve!")} />
                    <SettingsRow icon={Bell} label="Notificações" value="Ativo" onClick={() => alert("Em breve!")} />
                </SettingsGroup>

                <SettingsGroup title="Suporte & Comunidade">
                    <SettingsRow icon={Star} label="Avaliar na App Store" onClick={() => alert("Em breve!")} />
                    <SettingsRow icon={HelpCircle} label="Ajuda e Feedback" onClick={() => alert("Em breve!")} />
                    <SettingsRow icon={FileText} label="Termos e Privacidade" onClick={() => alert("Em breve!")} />
                </SettingsGroup>

                {/* Danger Zone */}
                <div className="mt-10">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full bg-white dark:bg-[#1C1C1E] text-red-500 font-bold p-4 rounded-[1.5rem] flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-black/5 dark:border-white/10 shadow-sm"
                    >
                        {isLoggingOut ? (
                            <span className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <LogOut size={20} />
                                Sair da Conta
                            </>
                        )}
                    </button>
                    <p className="text-center text-[11px] font-semibold text-ios-gray/60 mt-4">
                        GYM v1.0.0 • Desenvolvido por Heitor
                    </p>
                </div>

            </div>
        </div>
    );
}
