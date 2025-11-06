'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getRedirectByRole, type GenericRole } from '@/src/lib/roleUtils';
import { cn } from '@/src/lib/utils';

/**
 * RoleSwitcher Component
 * Allows users with multiple roles to switch between different views
 */

const ROLE_CONFIG: Record<
  GenericRole,
  { label: string; description: string; icon: React.ReactNode }
> = {
  ADMINISTRATOR: {
    label: 'Administrador',
    description: 'Acceso completo al sistema',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  ORGANIZER: {
    label: 'Organizador',
    description: 'Creo y gestiono mis eventos',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  BUYER: {
    label: 'Comprador',
    description: 'Exploro y compro tickets',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  STAFF: {
    label: 'Staff',
    description: 'Valido tickets en eventos',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export function RoleSwitcher() {
  const router = useRouter();
  const activeRole = useAuthStore((s) => s.activeRole);
  const availableRoles = useAuthStore((s) => s.getAvailableRoles());
  const switchRole = useAuthStore((s) => s.switchRole);

  // Si el usuario solo tiene un rol, no mostrar el switcher
  if (availableRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (role: string) => {
    // Cambiar rol en el store
    switchRole(role);

    // Redirigir a la página apropiada para ese rol
    const redirectUrl = getRedirectByRole(role);
    router.push(redirectUrl);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Cambiar Vista</h3>
        <p className="mt-1 text-sm text-slate-600">
          Tienes múltiples roles. Selecciona cómo quieres usar la aplicación.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {availableRoles.map((role) => {
          const config = ROLE_CONFIG[role as GenericRole];
          const isActive = activeRole === role;

          return (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role)}
              disabled={isActive}
              className={cn(
                'flex flex-col items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                isActive
                  ? 'cursor-default border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <div className="flex w-full items-center gap-3">
                <div className={isActive ? 'text-blue-600' : 'text-slate-400'}>{config?.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-base font-semibold',
                        isActive ? 'text-blue-900' : 'text-slate-900'
                      )}
                    >
                      {config?.label || role}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{config?.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSwitcher;
