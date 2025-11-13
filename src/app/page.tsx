'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getRedirectByRole } from '@/src/lib/roleUtils';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, activeRole, isLoading } = useAuthStore();

  useEffect(() => {
    console.log('[HomePage] Estado:', { isLoading, isAuthenticated, activeRole });

    // Wait for the authentication status to finish loading
    if (isLoading) {
      console.log('[HomePage] Esperando a que termine de cargar...');
      return;
    }

    // If authenticated, redirect to their role's home
    if (isAuthenticated && activeRole) {
      const homeUrl = getRedirectByRole(activeRole);
      console.log('[HomePage] Usuario autenticado, redirigiendo a:', homeUrl);
      router.replace(homeUrl);
    } else {
      // If not authenticated, redirect to /events
      console.log('[HomePage] Usuario NO autenticado, redirigiendo a /events');
      router.replace('/events');
    }
  }, [isAuthenticated, activeRole, isLoading, router]);

  // Show a loading indicator while deciding the redirection
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>
      </div>
    </div>
  );
}
