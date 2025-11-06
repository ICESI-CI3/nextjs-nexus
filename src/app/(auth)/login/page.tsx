'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import LoginForm from '@/src/components/auth/LoginForm';
import { useAuthStore } from '@/src/stores/useAuthStore';

function computeIsAdmin(roles: string[], permissions: string[]) {
  const hasAdminRole = roles.some((r) => r.toUpperCase() === 'ADMINISTRATOR');
  const canManageRoles = permissions.some((p) => p.toUpperCase().includes('MANAGE_ROLES'));
  return hasAdminRole || canManageRoles;
}

export default function LoginPage() {
  const router = useRouter();

  // Importante: NO construir un objeto en el selector.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const permissions = useAuthStore((s) => s.permissions);
  const twoFactorEnabled = useAuthStore((s) => s.twoFactorEnabled);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  // Si ya hay sesión pero aún no tenemos perfil en memoria, traerlo una vez
  React.useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Redirección post-login (y también si alguien llega al login ya autenticado)
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (twoFactorEnabled) return; // si está en 2FA, no redirigimos todavía

    const admin = computeIsAdmin(roles, permissions);
    router.replace(admin ? '/admin' : '/dashboard');
  }, [isAuthenticated, twoFactorEnabled, roles, permissions, router]);

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="TicketHub"
                className="h-10 w-auto"
                width={144}
                height={40}
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Bienvenido de nuevo</h1>
            <p className="mt-1 text-sm text-slate-600">
              Introduce tus credenciales para acceder a tu cuenta.
            </p>
          </div>

          <React.Suspense fallback={<div className="text-sm text-slate-600">Cargando...</div>}>
            <LoginForm />
          </React.Suspense>
        </div>
      </div>
    </main>
  );
}
