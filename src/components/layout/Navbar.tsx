'use client';

/**
 * Navbar Component
 * Main navigation bar with cart badge
 */

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCartStore } from '@/src/stores/useCartStore';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { Can } from '@/src/components/auth/Can';

function isActivePath(current: string | null, target: string): boolean {
  if (!current) return false;
  // Activo si coincide exacto o si es prefijo (para subrutas)
  return current === target || current.startsWith(`${target}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const totalItems = useCartStore((s) => s.totalItems);
  const fetchCarts = useCartStore((s) => s.fetchCarts);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeRole = useAuthStore((s) => s.activeRole);

  // Cargar carrito cuando hay usuario
  useEffect(() => {
    if (user) {
      fetchCarts().catch(() => {
        /* badge = 0 si falla */
      });
    }
  }, [user, fetchCarts]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Determinar redirección del logo según el rol activo del usuario
  const getLogoRedirect = () => {
    // Si no hay usuario logueado, siempre redirigir a eventos
    if (!user) {
      return '/events';
    }

    // Si estamos en admin, redirigir a admin
    if (pathname?.startsWith('/admin')) {
      return '/admin';
    }

    // Si estamos en organizer, redirigir a organizer
    if (pathname?.startsWith('/organizer')) {
      return '/organizer';
    }

    // Si no estamos en admin/organizer, verificar el rol activo del usuario
    if (activeRole) {
      switch (activeRole) {
        case 'ADMINISTRATOR':
          return '/admin';
        case 'ORGANIZER':
          return '/organizer';
        case 'STAFF':
          return '/tickets/validate';
        case 'BUYER':
        default:
          return '/events';
      }
    }

    // Default: página de eventos
    return '/events';
  };

  // Verificar si el usuario tiene el rol BUYER
  const hasBuyerRole = user?.roles?.some((role) => role.name === 'BUYER') ?? false;

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={getLogoRedirect()} className="transition-opacity hover:opacity-80">
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
                isActivePath(pathname, '/events')
                  ? 'font-semibold text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Eventos
            </Link>

            {user ? (
              <>
                {/* Admin solo con permiso */}
                <Can permission="VIEW_USERS">
                  <Link
                    href="/admin"
                    className={`text-sm transition-colors ${
                      isActivePath(pathname, '/admin')
                        ? 'font-semibold text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Admin
                  </Link>
                </Can>

                {/* Mis Compras - Solo para usuarios con rol BUYER */}
                {hasBuyerRole && (
                  <Link
                    href="/purchases/history"
                    className={`text-sm transition-colors ${
                      isActivePath(pathname, '/purchases/history')
                        ? 'font-semibold text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Mis Compras
                  </Link>
                )}

                {/* Carrito con badge - Solo para usuarios con rol BUYER */}
                {hasBuyerRole && (
                  <Link href="/cart" className="relative" aria-label="Carrito">
                    <svg
                      className={`h-6 w-6 ${
                        isActivePath(pathname, '/cart') ? 'text-blue-600' : 'text-gray-700'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </Link>
                )}

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
            ) : (
              /* Botones de Login/Registro para usuarios no logueados */
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
