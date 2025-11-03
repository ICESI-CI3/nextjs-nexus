'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/ui/Button';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import { useAuth } from '@/src/hooks/useAuth';
import { ROUTES } from '@/src/lib/constants';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Guard will redirect; render nothing to avoid flash
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <Button onClick={logout} variant="secondary">
          Cerrar sesión
        </Button>
      </div>

      <div className="space-y-4">
        {/* Card de seguridad 2FA */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium text-slate-900">Seguridad</h3>
              <p className="mt-1 text-sm text-slate-600">
                Gestiona la autenticación de dos factores para tu cuenta.
              </p>
            </div>
            <div className="ml-4">
              <Button onClick={() => router.push(ROUTES.SETUP_2FA)} className="text-sm">
                2FA
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">
            Esta es una pantalla protegida. Aquí agregaremos tarjetas, métricas y accesos rápidos a
            las secciones del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
