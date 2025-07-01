'use client';

import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import Link from "next/link";
import Avatar from "../../components/Avatar";
import ClientOnly from "../../components/ClientOnly";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";
import { UserService, UserProfile, UserStats } from "../../services/userService";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import {
  User, 
  Mail, 
  School, 
  MapPin, 
  Phone, 
  Calendar,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Camera,
  Key,
  TrendingUp,
  FileText,
  Send,
  Play,
  Briefcase,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // User profile and stats
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [success, setSuccess] = useState("");
  const [formattedDate, setFormattedDate] = useState<string>("No disponible");

  // Hook para cambio de contraseña
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    passwordError,
    isLoading: passwordLoading,
    isSendingReset,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setPasswordError,
    changePassword,
    sendPasswordResetEmail,
    resetForm
  } = usePasswordChange(user);

  // Estados para controlar visibilidad de contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadUserData();
    }
  }, [user, loading, router]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      // Cargar datos básicos del usuario
      setDisplayName(user.displayName || "");
      
      // Formatear fecha en el cliente para evitar problemas de hidratación
      if (user.metadata.creationTime) {
        setFormattedDate(new Date(user.metadata.creationTime).toLocaleDateString('es-ES'));
      }

      // Cargar perfil completo desde Firestore
      const profile = await UserService.getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        setUniversity(profile.university || "");
        setLocation(profile.location || "");
        setPhone(profile.phone || "");
        setBio(profile.bio || "");
      }      // Cargar estadísticas del usuario
      const stats = await UserService.getUserStats(user);
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      setLoadingProfile(false);
    }
  };
  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  if (!user) return null;
  const handleSave = async () => {
    setSaving(true);
    try {
      if (user) {
        // Actualizar displayName en Firebase Auth
        if (displayName.trim()) {
          await updateProfile(user, {
            displayName: displayName.trim()
          });
        }

        // Guardar datos adicionales en Firestore
        await UserService.updateUserProfile(user.uid, {
          email: user.email || "",
          displayName: displayName.trim(),
          university: university.trim(),
          location: location.trim(),
          phone: phone.trim(),
          bio: bio.trim(), // Cambiado de undefined a null
        });

        // Recargar datos del perfil
        await loadUserData();
        
        setSuccess("Perfil actualizado correctamente");
        setEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSuccess("Error al actualizar el perfil");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    const success = await changePassword();
    if (success) {
      setSuccess("Contraseña actualizada correctamente");
      setChangingPassword(false);
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  const handlePasswordResetEmail = async () => {
    const success = await sendPasswordResetEmail();
    if (success) {
      setSuccess("Se ha enviado un enlace de restablecimiento a tu correo electrónico");
      setChangingPassword(false);
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
      {/* Header - Alineado con las columnas del contenido */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-6">
            {/* Lado izquierdo: Navegación y título */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            </div>

            {/* Lado derecho: Logo */}
            <div className="flex items-center">
              <Link href="/dashboard">
                <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8 hover:opacity-80 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* COLUMNA 1: Accesos rápidos - Aumentar anchura */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Accesos rápidos</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link 
                  href="/analizar-cv"
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[#028bbf] to-[#027ba8] hover:from-[#027ba8] hover:to-[#026596] text-white rounded-lg transition group"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp size={18} />
                    <span className="font-medium">Analizar CV</span>
                  </div>
                  {userStats && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {userStats.cvAnalyzesRemaining}
                    </span>
                  )}
                </Link>
                
                <Link 
                  href="/crear-cv"
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg transition"
                >
                  <FileText size={18} />
                  <span>Crear CV</span>
                </Link>
                
                <Link 
                  href="/match-cv"
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg transition"
                >
                  <Send size={18} />
                  <span>Búsqueda de Empleos</span>
                </Link>
                
                <Link 
                  href="/bolsa-trabajo"
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg transition"
                >
                  <Briefcase size={18} />
                  <span>Bolsa de Trabajo</span>
                </Link>
                
                <Link 
                  href="/interview-simulation"
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg transition"
                >
                  <Play size={18} />
                  <span>Simulación de Entrevistas</span>
                </Link>
                
                <div className="pt-3 border-t border-gray-100">
                  <Link 
                    href="/dashboard"
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition border border-gray-200"
                  >
                    <span>Ver Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="w-full mt-2 text-red-600 hover:text-red-700 px-4 py-3 rounded-lg transition border border-red-200 hover:border-red-300 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: Información del perfil - Ajustar proporcionalmente */}
          <div className="lg:col-span-5 xl:col-span-6">
            <div className="space-y-8">
              {/* Información Personal */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center space-x-2 text-[#028bbf] hover:text-[#027ba8] transition"
                    >
                      <Edit3 size={16} />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
                      >
                        <Save size={16} />
                        <span>{saving ? "Guardando..." : "Guardar"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setDisplayName(user.displayName || "");
                          setUniversity(userProfile?.university || "");
                          setLocation(userProfile?.location || "");
                          setPhone(userProfile?.phone || "");
                          setBio(userProfile?.bio || "");
                        }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
                      >
                        <X size={16} />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Tu nombre completo"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <User size={16} className="text-gray-500" />
                          <span className="text-gray-900">{displayName || "No especificado"}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Universidad
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Ej: Universidad Nacional"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <School size={16} className="text-gray-500" />
                          <span className="text-gray-900">{university || "No especificado"}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Ej: Lima, Perú"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-gray-900">{location || "No especificado"}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Ej: +51 987654321"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone size={16} className="text-gray-500" />
                          <span className="text-gray-900">{phone || "No especificado"}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de registro
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-gray-900">{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    {editing ? (
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                        placeholder="Cuéntanos un poco sobre ti..."
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                        <span className="text-gray-900">{bio || "No hay biografía disponible"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cambiar contraseña */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
                  {!changingPassword && (
                    <button
                      onClick={() => setChangingPassword(true)}
                      className="flex items-center space-x-2 text-[#028bbf] hover:text-[#027ba8] transition"
                    >
                      <Key size={16} />
                      <span>Cambiar contraseña</span>
                    </button>
                  )}
                </div>

                {changingPassword && (
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Key className="inline h-4 w-4 mr-1" />
                        Contraseña actual *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Tu contraseña actual"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-3">
                          <PasswordStrengthIndicator password={newPassword} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar nueva contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] focus:border-transparent text-gray-900"
                          placeholder="Repite la nueva contraseña"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={handlePasswordChange}
                        disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                        className="flex items-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} />
                        <span>{passwordLoading ? "Cambiando..." : "Cambiar contraseña"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setChangingPassword(false);
                          resetForm();
                        }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
                      >
                        <X size={16} />
                        <span>Cancelar</span>
                      </button>
                    </div>

                    {/* Opción alternativa: Resetear por email */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">
                        ¿Olvidaste tu contraseña actual? Puedes recibir un enlace de restablecimiento por email.
                      </p>
                      <button
                        onClick={handlePasswordResetEmail}
                        disabled={isSendingReset}
                        className="flex items-center space-x-2 text-[#028bbf] hover:text-[#027ba8] transition disabled:opacity-50"
                      >
                        <Mail size={16} />
                        <span>{isSendingReset ? "Enviando..." : "Enviar enlace por email"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA 3: Foto y estadísticas - Mantener tamaño */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-6">
            {/* Foto de perfil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar user={user} size="xl" />
                  <button className="absolute bottom-0 right-0 bg-[#028bbf] hover:bg-[#027ba8] text-white p-2 rounded-full shadow-lg transition">
                    <Camera size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {displayName || 'Usuario'}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Estadísticas del perfil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Progreso del perfil */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Perfil completado</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(() => {
                      let completedFields = 0;
                      const totalFields = 6;
                      
                      if (displayName) completedFields++;
                      if (user.email) completedFields++;
                      if (university) completedFields++;
                      if (location) completedFields++;
                      if (phone) completedFields++;
                      if (bio) completedFields++;
                      
                      return Math.round((completedFields / totalFields) * 100);
                    })()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#028bbf] h-2 rounded-full transition-all duration-500" 
                    style={{
                      width: `${(() => {
                        let completedFields = 0;
                        const totalFields = 6;
                        
                        if (displayName) completedFields++;
                        if (user.email) completedFields++;
                        if (university) completedFields++;
                        if (location) completedFields++;
                        if (phone) completedFields++;
                        if (bio) completedFields++;
                        
                        return Math.round((completedFields / totalFields) * 100);
                      })()}%`
                    }}
                  ></div>
                </div>

                {/* Estadísticas de análisis CV */}
                {/* {userStats && (
                  <div className="pt-4 space-y-3 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Análisis CV usados</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userStats.cvAnalyzesUsed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Análisis restantes</span>
                      <span className={`text-sm font-medium ${
                        userStats.cvAnalyzesRemaining > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {userStats.cvAnalyzesRemaining}
                      </span>
                    </div>
                  </div>
                )} */}

                {/* Estadísticas adicionales */}
                {userStats && (userStats.cvsCreated || userStats.applicationsSent || userStats.trainingsCompleted) && (
                  <div className="pt-4 space-y-3 border-t border-gray-100">
                    {userStats.cvsCreated && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CVs creados</span>
                        <span className="text-sm font-medium text-gray-900">{userStats.cvsCreated}</span>
                      </div>
                    )}
                    {userStats.applicationsSent && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Postulaciones</span>
                        <span className="text-sm font-medium text-gray-900">{userStats.applicationsSent}</span>
                      </div>
                    )}
                    {userStats.trainingsCompleted && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Entrenamientos</span>
                        <span className="text-sm font-medium text-gray-900">{userStats.trainingsCompleted}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
}
