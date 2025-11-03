'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/src/lib/constants';
import { useAuth } from './useAuth';

/**
 * Client-side route guard. Redirects to login if not authenticated.
 * Returns current auth flags so pages can render skeletons if desired.
 */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`${ROUTES.LOGIN}?next=${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return { isAuthenticated, isLoading } as const;
}

export default useRequireAuth;
