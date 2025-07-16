'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import ClientBolsaTrabajoPage from '@/components/client-bolsa-trabajo-page';
import Navbar from '@/components/navbar';

export default function BolsaTrabajoPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar loading hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028bbf]"></div>
      </div>
    );
  }

  // Si hay usuario, usar el layout del dashboard
  if (user) {
    return (
      <DashboardLayout>
        <ClientBolsaTrabajoPage />
      </DashboardLayout>
    );
  }

  // Si no hay usuario, usar layout público
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-100 font-poppins">
      <Navbar />
      
      {/* Espaciador para compensar el header fijo */}
      <div className="h-[52px]"></div>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-4xl">
        <ClientBolsaTrabajoPage />
      </main>
      
      {/* Footer simplificado */}
      <footer className="bg-white border-t border-gray-200 py-3 mt-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center">
            <p className="text-gray-600 text-xs mb-2">© 2025 MyWorkIn. Todos los derechos reservados.</p>
            <div className="flex justify-center space-x-4 text-xs text-indigo-600">
              <a href="/terminos-condiciones" className="hover:text-indigo-800 transition-colors">Términos y Condiciones</a>
              <a href="/politica-privacidad" className="hover:text-indigo-800 transition-colors">Política de Privacidad</a>
              <a href="/politica-reembolsos" className="hover:text-indigo-800 transition-colors">Política de Reembolsos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}