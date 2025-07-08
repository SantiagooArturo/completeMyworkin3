'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import ClientBolsaTrabajoPage from '@/components/client-bolsa-trabajo-page';

export default function BolsaTrabajoPage() {
  const { user } = useAuth();

  // Si hay usuario, usar el layout del dashboard
  if (user) {
    return (
      <DashboardLayout>
        <ClientBolsaTrabajoPage />
      </DashboardLayout>
    );
  }

  // Si no hay usuario, mostrar la página completa (sin layout)
  return <ClientBolsaTrabajoPage />;
}
