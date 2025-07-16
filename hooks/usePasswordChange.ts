'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface UsePasswordChangeResult {
  // Estados
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordError: string;
  isLoading: boolean;
  isSendingReset: boolean;
  
  // Setters
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setPasswordError: (value: string) => void;
  
  // Funciones
  changePassword: () => Promise<boolean>;
  sendPasswordResetEmail: () => Promise<boolean>;
  resetForm: () => void;
  validatePassword: () => string | null;
}

export function usePasswordChange(user: User | null): UsePasswordChangeResult {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const validatePassword = (): string | null => {
    if (!currentPassword) {
      return "La contraseña actual es requerida";
    }
    
    if (newPassword !== confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    
    if (newPassword.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    
    if (!hasLetters && !hasNumbers) {
      return "La contraseña debe contener al menos letras o números";
    }

    return null;
  };

  const changePassword = async (): Promise<boolean> => {
    setPasswordError("");
    
    // Validar entrada
    const validationError = validatePassword();
    if (validationError) {
      setPasswordError(validationError);
      return false;
    }

    if (!user?.email) {
      setPasswordError("Usuario no válido");
      return false;
    }

    setIsLoading(true);
    
    try {
      // Reautenticar al usuario antes de cambiar la contraseña
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Cambiar la contraseña
      await updatePassword(user, newPassword);
      
      resetForm();
      return true;
      
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      
      // Manejo específico de errores de Firebase
      switch (error.code) {
        case 'auth/wrong-password':
          setPasswordError("La contraseña actual es incorrecta");
          break;
        case 'auth/weak-password':
          setPasswordError("La nueva contraseña es muy débil");
          break;
        case 'auth/requires-recent-login':
          setPasswordError("Para cambiar tu contraseña, necesitas cerrar sesión e iniciar sesión nuevamente");
          break;
        case 'auth/too-many-requests':
          setPasswordError("Demasiados intentos. Intenta nuevamente en unos minutos");
          break;
        case 'auth/network-request-failed':
          setPasswordError("Error de conexión. Verifica tu internet e intenta nuevamente");
          break;
        default:
          setPasswordError("Error al cambiar la contraseña. Si el problema persiste, cierra sesión e inicia sesión nuevamente");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmailAction = async (): Promise<boolean> => {
    if (!user?.email) {
      setPasswordError("No se pudo obtener tu email");
      return false;
    }

    setIsSendingReset(true);
    setPasswordError("");

    try {
      await sendPasswordResetEmail(auth, user.email);
      resetForm();
      return true;
    } catch (error: any) {
      console.error('Error enviando email de reset:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setPasswordError("No se encontró una cuenta con este email");
          break;
        case 'auth/invalid-email':
          setPasswordError("Email inválido");
          break;
        case 'auth/network-request-failed':
          setPasswordError("Error de conexión. Verifica tu internet");
          break;
        default:
          setPasswordError("Error al enviar el email. Intenta nuevamente");
      }
      return false;
    } finally {
      setIsSendingReset(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  return {
    // Estados
    currentPassword,
    newPassword,
    confirmPassword,
    passwordError,
    isLoading,
    isSendingReset,
    
    // Setters
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setPasswordError,
    
    // Funciones
    changePassword,
    sendPasswordResetEmail: sendPasswordResetEmailAction,
    resetForm,
    validatePassword
  };
}
