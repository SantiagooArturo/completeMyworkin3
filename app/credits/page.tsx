'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import CreditDashboard from "@/components/CreditDashboard";
import { ArrowLeft } from "lucide-react";

export default function CreditPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se determina el estado de auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (la redirección se maneja en useEffect)
  if (!user) {
    return null;
  }

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028bbf]"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#028bbf] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Volver al Dashboard</span>
                </Link>
                <div className="border-l border-gray-300 h-6 mx-4"></div>
                <Link href="/">
                  <img src="/MyWorkIn-web.png" alt="MyWorkIn Logo" className="h-8" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Mis Créditos</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Créditos
            </h2>
            <p className="text-gray-600">
              Administra tus créditos, ve tu historial de transacciones y compra nuevos paquetes.
            </p>
          </div>

          {/* Credit Dashboard Content */}
          <CreditDashboard />
        </div>
      </div>
    </ClientOnly>
  );
}
