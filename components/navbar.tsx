'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useAuth } from "../hooks/useAuth";
import LoginModal from "./LoginModal";
import Avatar from "./Avatar";
import UserProfile from "./UserProfile";
import StudentDashboard from "./StudentDashboard";
import CreditBalance from "./CreditBalance";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white py-3 shadow-md fixed top-0 left-0 right-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium">
                Inicio
              </Link>
              <Link href="/bolsa-trabajo" className="text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium">
                Bolsa de trabajo
              </Link>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium bg-transparent">
                      Herramientas de empleabilidad
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[250px] p-2">
                        <Link
                          href="/analizar-cv"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#028bbf] rounded-md"
                        >
                          Analizar tu CV con AI
                        </Link>
                        <Link
                          href="/match-cv"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#028bbf] rounded-md"
                        >
                          Hacer match de tu CV con prácticas
                        </Link>
                        <Link
                          href="/crear-cv"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#028bbf] rounded-md"
                        >
                          Crear CV
                        </Link>
                        <Link
                          href="/interview-simulation"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#028bbf] rounded-md"
                        >
                          Simulación de entrevistas
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Credit Balance Badge - Solo para usuarios autenticados */}
            {user && (
              <CreditBalance variant="compact" className="hidden md:flex" />
            )}

            <a
              href="https://mc.ht/s/SH1lIgc"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center gap-2 py-1.5 px-3 bg-[#028bbf] hover:bg-[#027ba8] text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Chatea con Worky</span>
            </a>
            {/* Botón de login/logout */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {/* Dashboard Button */}
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 py-1.5 px-3 bg-blue-100 hover:bg-blue-200 text-[#028bbf] rounded-full font-medium shadow-md transition-all text-sm"
                >
                  Panel
                </Link>

                {/* User Avatar and Profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <Avatar user={user} size="sm" />
                  <span className="text-sm font-medium text-gray-700 max-w-20 truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Usuario'}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center justify-center gap-2 py-1.5 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium shadow-md transition-all text-sm"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
          {/* Botón de menú hamburguesa (visible solo en móvil) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#028bbf] transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t mt-3">
            {/* Credit Balance Badge - Solo para usuarios autenticados en móvil */}
            {user && (
              <div className="mb-4 pb-3 border-b border-gray-200">
                <CreditBalance variant="compact" />
              </div>
            )}

            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/bolsa-trabajo"
                className="text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Bolsa de trabajo
              </Link>
              <div className="space-y-2">
                <div className="text-gray-700 font-medium text-sm">Bots de empleabilidad</div>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/analizar-cv"
                    className="block text-gray-600 hover:text-[#028bbf] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Analizar tu CV con AI
                  </Link>
                  <Link
                    href="/match-cv"
                    className="block text-gray-600 hover:text-[#028bbf] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hacer match de tu CV con prácticas
                  </Link>
                  <Link
                    href="/crear-cv"
                    className="block text-gray-600 hover:text-[#028bbf] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Crear CV
                  </Link>
                </div>
              </div>
              <a
                href="https://mc.ht/s/SH1lIgc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#028bbf] hover:text-[#027ba8] transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Chatea con Worky</span>
              </a>

              {/* Opciones de usuario para móvil */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size="sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.displayName || user.email?.split('@')[0] || 'Usuario'}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium"
                  >
                    Mi Panel
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left text-gray-700 hover:text-[#028bbf] transition-colors text-sm font-medium"
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left text-[#028bbf] hover:text-[#027ba8] transition-colors text-sm font-medium pt-4 border-t border-gray-200"
                >
                  Iniciar sesión
                </Link>
              )}
            </nav>
          </div>
        )}
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <StudentDashboard isOpen={dashboardOpen} onClose={() => setDashboardOpen(false)} />
      </div>
    </header>
  );
}