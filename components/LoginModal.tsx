"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(require("../firebase/config").auth, email, password);
        
        // Actualizar el perfil del usuario con el nombre
        if (displayName) {
          await updateProfile(userCredential.user, {
            displayName: displayName
          });
        }
        
        // 📧 NUEVO: Enviar email de bienvenida desde santi@myworkinpe.lat
        try {
          console.log('📧 Enviando email de bienvenida desde modal a:', email);
          
          const emailResponse = await fetch('/api/email/send-welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              displayName: displayName || 'Usuario',
              credits: 10
            }),
          });

          const emailResult = await emailResponse.json();
          
          if (emailResult.success) {
            console.log('✅ Email de bienvenida enviado desde modal:', emailResult.messageId);
          } else {
            console.error('❌ Error enviando email desde modal:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Error inesperado enviando email desde modal:', emailError);
        }
        
        setLoading(false);
        onClose();
      } else {
        await login(email, password);
        setLoading(false);
        onClose();
      }
    } catch (err: any) {
      setError(isRegister ? "No se pudo crear la cuenta. ¿Ya existe?" : "Correo o contraseña incorrectos");
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleLogin}
        className="bg-white text-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col gap-8 animate-fade-in"
        style={{ minWidth: 440 }}
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-[#028bbf]">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>        <p className="text-gray-500 text-center text-base mb-2">
          {isRegister ? "Crea una cuenta para acceder a más funciones" : "Accede con tu correo y contraseña"}
        </p>
        
        {/* Campos adicionales para registro */}
        {isRegister && (
          <>
            <input
              className="w-full mb-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] transition text-base"
              type="text"
              placeholder="Nombre completo"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
            <input
              className="w-full mb-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] transition text-base"
              type="text"
              placeholder="Universidad (opcional)"
              value={university}
              onChange={e => setUniversity(e.target.value)}
            />
          </>
        )}
        
        <input
          className="w-full mb-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] transition text-base"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] transition text-base"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-[#028bbf] hover:bg-[#027ba8] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {loading ? (isRegister ? "Creando..." : "Ingresando...") : (isRegister ? "Crear cuenta" : "Ingresar")}
        </button>
        <button
          type="button"
          className="w-full mt-1 text-sm text-gray-500 hover:underline"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="w-full mt-1 text-sm text-[#028bbf] hover:underline font-medium"
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
        >
          {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </form>
    </div>
  );
}
