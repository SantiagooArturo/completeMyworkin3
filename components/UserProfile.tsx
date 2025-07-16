'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import Avatar from './Avatar';
import { Edit2, MapPin, Calendar, Mail, User as UserIcon, X } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    location: '',
    university: '',
    career: '',
    bio: ''
  });

  if (!isOpen || !user) return null;

  const handleSaveProfile = () => {
    // Aquí puedes implementar la lógica para guardar el perfil en Firestore
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#028bbf] to-[#027ba8] p-6 rounded-t-xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {profileData.displayName || user.email?.split('@')[0] || 'Mi Perfil'}
              </h2>
              <p className="text-blue-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Información del Perfil</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-[#028bbf] text-white rounded-lg hover:bg-[#027ba8] transition-colors"
            >
              <Edit2 size={16} />
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="inline w-4 h-4 mr-1" />
                Nombre completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf]"
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {profileData.displayName || 'No especificado'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Correo electrónico
              </label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{user.email}</p>
            </div>

            {/* Universidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Universidad
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.university}
                  onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf]"
                  placeholder="Tu universidad"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {profileData.university || 'No especificado'}
                </p>
              )}
            </div>

            {/* Carrera */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Carrera
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.career}
                  onChange={(e) => setProfileData({ ...profileData, career: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf]"
                  placeholder="Tu carrera"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {profileData.career || 'No especificado'}
                </p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Ubicación
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf]"
                  placeholder="Tu ubicación"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {profileData.location || 'No especificado'}
                </p>
              )}
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acerca de mí
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#028bbf] h-24 resize-none"
                  placeholder="Cuéntanos sobre ti..."
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800 min-h-[96px]">
                  {profileData.bio || 'No hay información disponible'}
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-8">
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-[#028bbf] text-white py-3 rounded-lg font-semibold hover:bg-[#027ba8] transition-colors"
              >
                Guardar Cambios
              </button>
            )}
            <button
              onClick={logout}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
