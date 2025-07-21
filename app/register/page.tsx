'use client';

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { OnboardingService } from "@/services/onboardingService";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = () => {
    // Redirigir al onboarding para que complete su información
    router.push('/dashboard');
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError("El nombre completo es obligatorio");
      setLoading(false);
      return;
    }
    
    try {
      // Crear usuario con Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      // Actualizar el perfil del usuario con el nombre
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });

      // OBLIGATORIO: Guardar información en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: displayName.trim(),
        university: university.trim(),
        email: email,
        role: 'student',
        status: 'active',
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Crear cuenta de créditos
      const { CreditService } = await import('@/services/creditService');
      try {
        await CreditService.getCreditAccount(userCredential.user);
      } catch (creditError) {
        console.error('Error creando cuenta de créditos:', creditError);
      }
      
      // 📧 NUEVO: Enviar email de bienvenida desde santi@myworkinpe.lat
      try {
        console.log('📧 Enviando email de bienvenida a:', email);
        
        const emailResponse = await fetch('/api/email/send-welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            displayName: displayName.trim(),
            credits: 10 // Los créditos de bienvenida que reciben
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResult.success) {
          console.log('✅ Email de bienvenida enviado exitosamente:', emailResult.messageId);
        } else {
          console.error('❌ Error enviando email de bienvenida:', emailResult.error);
        }
      } catch (emailError) {
        // No fallar el registro si el email falla
        console.error('❌ Error inesperado enviando email de bienvenida:', emailError);
      }
      
      setLoading(false);
      await OnboardingService.skipOnboarding(userCredential.user);
      // Redirigir al portal de trabajo
      router.push('/portal-trabajo');
      
    } catch (err: any) {
      let errorMessage = "No se pudo crear la cuenta";
      
      // Manejo específico de errores de Firebase
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Este correo ya está registrado";
          break;
        case 'auth/invalid-email':
          errorMessage = "Correo electrónico inválido";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es muy débil";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión. Verifica tu internet";
          break;
        default:
          errorMessage = "Error al crear la cuenta. Inténtalo nuevamente";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear cuenta
          </h1>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleRegister} className="space-y-6 text-gray-800">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                id="displayName"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent transition"
                type="text"
                placeholder="Tu nombre completo"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico *
              </label>
              <input
                id="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent transition"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                id="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent transition"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña *
              </label>
              <input
                id="confirmPassword"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent transition"
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#028bbf] hover:bg-[#027ba8] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Separador */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O regístrate con</span>
              </div>
            </div>
          </div>

          {/* Botón de Google */}
          <GoogleAuthButton 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          >
            Registrarse con Google
          </GoogleAuthButton>

          <div className="mt-6 space-y-4">
            <Link 
              href="/login"
              className="block w-full text-center text-[#028bbf] hover:text-[#027ba8] font-medium transition"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
            
            <Link 
              href="/"
              className="block w-full text-center text-gray-500 hover:text-gray-700 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}