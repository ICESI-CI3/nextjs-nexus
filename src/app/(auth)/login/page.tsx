'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import LoginForm from '@/src/components/auth/LoginForm';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getPostLoginRedirect } from '@/src/lib/getPostLoginRedirect';

export default function LoginPage() {
  const router = useRouter();

  // Importante: NO construir un objeto en el selector.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const twoFactorEnabled = useAuthStore((s) => s.twoFactorEnabled);
  const isLoading = useAuthStore((s) => s.isLoading);
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

    // IMPORTANTE: Esperar a que termine de cargar el perfil
    if (isLoading) {
      console.log('[LoginPage] Still loading profile, waiting...');
      return;
    }

    // Esperar a que activeRole esté establecido
    // Si no hay activeRole pero hay usuario, dar un momento para que se establezca
    if (!activeRole && user) {
      console.log('[LoginPage] Waiting for activeRole to be set...');
      return;
    }

    const redirectUrl = getPostLoginRedirect(activeRole);
    console.log(`[LoginPage] Redirecting to ${redirectUrl} with activeRole: ${activeRole}`);
    router.replace(redirectUrl);
  }, [isAuthenticated, twoFactorEnabled, activeRole, user, isLoading, router]);

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              <Image
                src="/dark-logo.svg"
                alt="TicketHub"
                className="h-12 w-auto"
                width={180}
                height={50}
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Bienvenido de nuevo</h1>
            <p className="mt-1 text-sm text-slate-600">
              Introduce tus credenciales para acceder a tu cuenta.
            </p>
          </div>

          {/* Show loading indicator when authenticated and loading profile */}
          {isAuthenticated && isLoading && (
            <div className="mb-4 rounded-md bg-slate-50 p-4 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
              <p className="mt-2 text-sm text-slate-600">Cargando perfil...</p>
            </div>
          )}

          <React.Suspense fallback={<div className="text-sm text-slate-600">Cargando...</div>}>
            <LoginForm />
          </React.Suspense>
        </div>
      </div>
    </main>
  );
}
