'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getRedirectByRole } from '@/src/lib/roleUtils';
import { ROUTES } from '@/src/lib/constants';
import Button from '@/src/components/ui/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, activeRole, switchRole, getAvailableRoles, fetchProfile, isLoading } =
    useAuthStore();

  const [isChangingRole, setIsChangingRole] = React.useState(false);

  // Cargar perfil al montar
  React.useEffect(() => {
    if (!user) {
      fetchProfile().catch((error) => {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar el perfil');
      });
    }
  }, [user, fetchProfile]);

  const availableRoles = getAvailableRoles();

  const handleRoleSwitch = async (role: string) => {
    if (role === activeRole) {
      toast.error('Ya estás en este rol');
      return;
    }

    try {
      setIsChangingRole(true);

      // Cambiar el rol activo
      switchRole(role);

      toast.success(`Cambiado a rol: ${role}`);

      // Redirigir al dashboard correspondiente del nuevo rol
      const redirectUrl = getRedirectByRole(role);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Error switching role:', error);
      toast.error('Error al cambiar de rol');
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleNavigateTo2FA = () => {
    router.push(ROUTES.SETUP_2FA);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-800 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="mt-2 text-sm text-slate-600">Administra tu información personal y roles</p>
      </div>

      {/* User Information Card */}
      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Información Personal</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre</label>
            <p className="mt-1 text-base text-slate-900">{user.firstName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Apellido</label>
            <p className="mt-1 text-base text-slate-900">{user.lastName}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
            <p className="mt-1 text-base text-slate-900">{user.email}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Autenticación de Dos Factores (2FA)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  user.twoFactorEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {user.twoFactorEnabled ? 'Activada' : 'Desactivada'}
              </span>
              <Button variant="secondary" size="sm" onClick={handleNavigateTo2FA}>
                {user.twoFactorEnabled ? 'Gestionar 2FA' : 'Activar 2FA'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Role Card */}
      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Rol Activo</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Estás navegando como:</p>
            <p className="text-xl font-bold text-slate-900">{activeRole || 'Sin rol activo'}</p>
          </div>
        </div>
      </div>

      {/* Switch Role Card */}
      {availableRoles.length > 1 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Cambiar de Rol</h2>
          <p className="mb-6 text-sm text-slate-600">
            Tienes acceso a múltiples roles. Selecciona uno para cambiar tu vista de la aplicación.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableRoles.map((role) => {
              const isActive = role === activeRole;
              const roleLabels: Record<string, { label: string; icon: string }> = {
                ADMINISTRATOR: { label: 'Administrador', icon: '⚙️' },
                ORGANIZER: { label: 'Organizador', icon: '🎪' },
                BUYER: { label: 'Comprador', icon: '🎫' },
                STAFF: { label: 'Personal', icon: '👤' },
              };

              const roleInfo = roleLabels[role] || { label: role, icon: '📌' };

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  disabled={isActive || isChangingRole}
                  className={`group relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    isActive
                      ? 'border-slate-800 bg-slate-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md'
                  } ${isChangingRole ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <div
                    className={`text-4xl transition-transform ${
                      !isActive && !isChangingRole && 'group-hover:scale-110'
                    }`}
                  >
                    {roleInfo.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{roleInfo.label}</p>
                    {isActive && (
                      <span className="mt-1 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">
                        Activo
                      </span>
                    )}
                  </div>
                  {!isActive && !isChangingRole && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-800/0 transition-all group-hover:bg-slate-800/5" />
                  )}
                </button>
              );
            })}
          </div>
          {isChangingRole && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-slate-600 border-r-transparent"></div>
              Cambiando de rol...
            </div>
          )}
        </div>
      )}

      {availableRoles.length === 1 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <p className="text-center text-sm text-slate-600">
            Solo tienes un rol asignado actualmente.
          </p>
        </div>
      )}
    </div>
  );
}
