"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  User,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase/config";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Limpiar errores cuando el estado de auth cambia
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  // Función para obtener mensajes de error en español
  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      // Errores de autenticación
      'auth/invalid-credential': 'Email o contraseña incorrectos',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'El formato del email es inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      
      // Errores de registro
      'auth/email-already-in-use': 'Ya existe una cuenta con este email',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/operation-not-allowed': 'El registro con email está deshabilitado',
      
      // Errores generales
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión',
    };

    return errorMessages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente';
  };

  // Prevenir hidratación mismatch
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ 
        user: null, 
        login: async () => {}, 
        register: async () => {},
        logout: async () => {}, 
        resetPassword: async () => {},
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
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso');
      return result;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      console.log('✅ Registro exitoso');
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      console.log('✅ Logout exitoso');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      const errorMessage = 'Error al cerrar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de recuperación enviado');
    } catch (error: any) {
      console.error('❌ Error al enviar email de recuperación:', error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      resetPassword, 
      loading, 
      error, 
      clearError 
    }}>
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
