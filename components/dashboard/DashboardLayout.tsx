'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  ChevronDown,
  Laptop,
  HelpCircle
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import { useCredits } from '@/hooks/useCredits';
import CreditBalance from '../CreditBalance';
import AutoCarousel from '../AutoCarousel';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    id: 'portal-trabajo',
    label: 'Portal de trabajo',
    icon: Briefcase,
    href: '/portal-trabajo',
    badge: null
  },
    {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    badge: null
  },
  {
    id: 'mis-postulaciones',
    label: 'Mis postulaciones',
    icon: Laptop,
    href: '/postulaciones',
    badge: null
  },
  {
    id: 'mi-cv',
    label: 'Mi CV',
    icon: FileText,
    href: '/crear-cv',
    badge: null
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const { credits } = useCredits(user);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no hay usuario
    if (!loading && !user) {
      console.log('🔄 Redirigiendo a login - no hay usuario autenticado');
      router.push('/login');
    } else if (!loading && user) {
      console.log('✅ Usuario autenticado:', user.email);
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user) {
    return null; // This will be handled by the redirect useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 mt-4 px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <img src="/MyWorkIn-web.png" alt="MyWorkIn" className="h-12" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-4 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#eff8ff] text-[#028bbf]'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span> 
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className='p-4 mt-56'>
        <AutoCarousel size='sm'/>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Header */}
        <div className="">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div></div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Credits Badge */}
              {/* Credit Balance Badge - Solo para usuarios autenticados */}
              {user && (
                <CreditBalance variant="compact" className="hidden md:flex" />
              )}

              {/* Chat Button */}
              <button className="flex items-center space-x-2 bg-[#028bbf] hover:bg-[#027ba8] text-white px-4 py-2 rounded-full text-sm font-medium transition">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chatea con Worky</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <Avatar user={user} size="sm" />
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {user.displayName?.split(' ')[0] || 'D'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 m-4 border-none bg-[#eff8ff] min-h-[calc(120vh-16rem)] rounded-2xl">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
