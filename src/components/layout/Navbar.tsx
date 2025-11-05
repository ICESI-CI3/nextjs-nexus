'use client';

/**
 * Navbar Component
 * Main navigation bar with cart badge
 */

import Image from 'next/image';
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
          {/* Back button and Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 transition-colors hover:text-gray-900"
              aria-label="Volver"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <Link href="/events" className="transition-opacity hover:opacity-80">
              <Image
                src="/logo.svg"
                alt="TicketHub"
                width={144}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/events"
              className={`text-sm transition-colors ${
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
                  className={`text-sm transition-colors ${
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

                {/* Profile and logout */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-700 transition-colors hover:text-blue-600"
                  >
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="group rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-red-600"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
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
