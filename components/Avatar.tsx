'use client';

import Image from 'next/image';
import { User } from 'firebase/auth';

interface AvatarProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };
  const avatarSrc = user?.photoURL;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  // Si no hay photoURL, usar el avatar por defecto o iniciales
  if (!avatarSrc) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gradient-to-br from-[#028bbf] to-[#0369a1] ${className}`}>
        <span className="text-white font-semibold text-lg">
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 ${className}`}>      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={`Avatar de ${displayName}`}
          width={size === 'xl' ? 128 : size === 'lg' ? 80 : size === 'md' ? 48 : 32}
          height={size === 'xl' ? 128 : size === 'lg' ? 80 : size === 'md' ? 48 : 32}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#028bbf] flex items-center justify-center text-white font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
