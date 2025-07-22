"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Configurar persistencia de Firebase Auth
    const initAuth = async () => {
      try {
        // Configurar persistencia local explícitamente
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Persistencia de Firebase Auth configurada');
      } catch (error) {
        console.warn('⚠️ No se pudo configurar la persistencia de Firebase:', error);
      }
    };

    initAuth();
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        console.log('🔄 Estado de autenticación cambió:', user ? `Usuario: ${user.email}` : 'Sin usuario');
        setUser(user);
        setLoading(false);
        // Limpiar errores cuando el estado de auth cambia
        setError(null);
      }
    }, (error) => {
      console.error('❌ Error en onAuthStateChanged:', error);
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Prevenir hidratación mismatch
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ 
        user: null, 
        login: async () => {}, 
        loginWithGoogle: async () => {},
        logout: async () => {}, 
        loading: true,
        error: null,
        clearError: () => {}
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Asegurar que la persistencia esté configurada antes del login
      await setPersistence(auth, browserLocalPersistence);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso:', result.user.email);
      return result;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Asegurar que la persistencia esté configurada
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Verificar si es un usuario nuevo y crear su documento en Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Es un usuario nuevo, crear su documento
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          role: 'student',
          status: 'active',
          verified: true, // Los usuarios de Google están verificados
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          photoURL: result.user.photoURL || null,
          university: '', // Podrán completarlo en onboarding
          authProvider: 'google'
        });

        // Crear cuenta de créditos para nuevos usuarios
        try {
          const { CreditService } = await import('@/services/creditService');
          await CreditService.getCreditAccount(result.user);
        } catch (creditError) {
          console.error('Error creando cuenta de créditos:', creditError);
        }
      }
      
      console.log('✅ Login con Google exitoso:', result.user.email);
      return result;
    } catch (error: any) {
      console.error('❌ Error en login con Google:', error);
      setError(error.message || 'Error al iniciar sesión con Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      console.error('Error en logout:', error);
      setError(error.message || 'Error al cerrar sesión');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
