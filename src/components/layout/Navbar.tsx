'use client';

/**
 * Navbar Component
 * Main navigation bar with cart badge
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/src/stores/useCartStore';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, fetchCarts } = useCartStore();
  const { user, logout } = useAuthStore();

  // Fetch carts when component mounts to get total items
  useEffect(() => {
    if (user) {
      fetchCarts().catch(() => {
        // Silently fail - cart badge will show 0
      });
    }
  }, [user, fetchCarts]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link
            href="/events"
            className="text-xl font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            TicketHub
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/events"
              className={`transition-colors ${
                isActive('/events')
                  ? 'font-semibold text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Eventos
            </Link>

            {user && (
              <>
                <Link
                  href="/purchases/history"
                  className={`transition-colors ${
                    isActive('/purchases/history')
                      ? 'font-semibold text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Mis Compras
                </Link>

                {/* Cart button with badge */}
                <Link href="/cart" className="relative transition-colors hover:text-blue-600">
                  <svg
                    className={`h-6 w-6 ${isActive('/cart') ? 'text-blue-600' : 'text-gray-700'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {/* Badge */}
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown (simplified) */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-700 transition-colors hover:text-blue-600"
                  >
                    {user.firstName || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Salir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
