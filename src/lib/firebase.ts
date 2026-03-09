import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// O Vite expõe as variáveis de ambiente em import.meta.env
// Usamos o prefixo VITE_ obrigatório.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Padrão de Singleton (evita inicializar o Firebase múltiplas vezes durante o Hot Reload do Vite)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Instâncias ativas para exportação global
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provider global configurado para o fluxo do Google
export const googleProvider = new GoogleAuthProvider();

// Opcional: força selecione de conta sempre que o pop-up abrir (boa prática em apps onde usuários dividem o PC)
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
