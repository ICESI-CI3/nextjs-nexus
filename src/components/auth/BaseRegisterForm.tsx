'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';
import FormSuccess from '@/src/components/ui/FormSuccess';
import { authSchemas, cn, formatZodErrors } from '@/src/lib/utils';
import roleService from '@/src/services/roleService';
import type { Role } from '@/src/lib/types';

type RegisterValues = z.infer<typeof authSchemas.register> & {
  selectedRoleId: string;
};

const INITIAL_VALUES: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  selectedRoleId: '',
};

interface BaseRegisterFormProps {
  mode: 'public' | 'admin';
  onSubmit: (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleIds: string[];
  }) => Promise<void>;
  onSuccess?: () => void;
  showBackToLogin?: boolean;
}

export default function BaseRegisterForm({
  mode,
  onSubmit,
  onSuccess,
  showBackToLogin = true,
}: BaseRegisterFormProps) {
  const [values, setValues] = React.useState<RegisterValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const successTimerRef = React.useRef<number | null>(null);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = React.useState(true);

  // Cargar roles según el modo
  React.useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const availableRoles =
          mode === 'public'
            ? await roleService.getPublicRoles()
            : await roleService.getAdminCreatableRoles();

        setRoles(availableRoles);

        // Seleccionar BUYER por defecto
        const buyerRole = availableRoles.find((r) => r.name === 'BUYER');
        if (buyerRole) {
          setValues((prev) => ({ ...prev, selectedRoleId: buyerRole.id }));
        }
      } catch (error) {
        const apiError = error as { response?: { status?: number }; message?: string };

        // Si es 403 (sin permisos), mostrar error inline sin toast
        if (apiError.response?.status === 403) {
          setGeneralError('No tienes permisos para crear usuarios en esta sección');
        } else {
          setGeneralError('Error al cargar roles disponibles');
        }

        // Log en desarrollo sin activar overlay
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Error loading roles:', error);
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, [mode]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralError('');
    setSuccessMessage('');
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRoleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      selectedRoleId: e.target.value,
    }));
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setGeneralError('');
      setSuccessMessage('');

      const parse = authSchemas.register.safeParse({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });

      if (!parse.success) {
        setErrors(formatZodErrors(parse.error));
        return;
      }

      if (!values.selectedRoleId) {
        setGeneralError('Por favor selecciona un tipo de usuario');
        return;
      }

      try {
        setIsSubmitting(true);
        console.log('[BaseRegisterForm] Submitting form in mode:', mode);

        await onSubmit({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          roleIds: [values.selectedRoleId],
        });

        console.log('[BaseRegisterForm] onSubmit completed successfully');

        // Éxito en UI del formulario solo para modo admin
        // En modo público, el registro hace login automático y redirige
        if (mode === 'admin') {
          console.log('[BaseRegisterForm] Admin mode - showing success message');
          setSuccessMessage('Usuario registrado exitosamente');
          // auto-cierre luego de ~15s
          if (successTimerRef.current) {
            window.clearTimeout(successTimerRef.current);
          }
          successTimerRef.current = window.setTimeout(() => {
            setSuccessMessage('');
          }, 15000);

          // Resetear form
          setValues(INITIAL_VALUES);
          const buyerRole = roles.find((r) => r.name === 'BUYER');
          if (buyerRole) {
            setValues((prev) => ({ ...prev, selectedRoleId: buyerRole.id }));
          }

          onSuccess?.();
          setIsSubmitting(false);
        } else {
          // En modo público, mantener el estado de carga mientras se redirige
          // El formulario permanecerá con el botón deshabilitado hasta que la redirección ocurra
          console.log('[BaseRegisterForm] Public mode - keeping loading state for redirect');
          onSuccess?.();
        }
      } catch (err) {
        console.error('[BaseRegisterForm] Error caught:', err);
        const error = err as {
          message?: string;
          response?: { data?: { message?: string | string[] }; status?: number };
        };

        let errorMessage = 'Error al registrar usuario';

        if (error.response?.status === 409) {
          errorMessage = 'El correo electrónico ya está en uso';
        } else if (error.response?.data?.message) {
          const msg = error.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else if (error.message) {
          errorMessage = error.message;
        }

        console.error('[BaseRegisterForm] Setting error message:', errorMessage);
        setGeneralError(errorMessage);
        setSuccessMessage('');
        setIsSubmitting(false);
        // NO mostrar toast aquí porque ya mostramos el error en el formulario
      }
    },
    [values, roles, mode, onSubmit, onSuccess]
  );

  // Limpiar timer en unmount para evitar fugas
  React.useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // Helper para obtener info visual del rol
  const getRoleDisplay = (roleName: string) => {
    switch (roleName) {
      case 'BUYER':
        return {
          label: 'Comprador',
          description: 'Busco eventos y compro boletos',
          icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          ),
        };
      case 'ORGANIZER':
        return {
          label: 'Organizador',
          description: 'Creo y gestiono eventos',
          icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        };
      case 'STAFF':
        return {
          label: 'Staff',
          description: 'Valido tickets en eventos',
          icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      default:
        return {
          label: roleName,
          description: '',
          icon: null,
        };
    }
  };

  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <>
      {/* Logo y Header solo para modo admin */}
      {mode === 'admin' && (
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center justify-center">
            {/* Logo oficial proporcionado por el equipo */}
            <Image
              src="/logo.svg"
              alt="TicketHub"
              className="h-10 w-auto"
              width={144}
              height={40}
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Registrar nuevo usuario</h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {generalError && <FormError message={generalError} />}
        {successMessage && <FormSuccess message={successMessage} />}

        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Juan"
            value={values.firstName}
            onChange={handleChange}
            disabled={isSubmitting}
            className={cn(
              'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              errors.firstName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
            )}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-xs text-red-600" role="alert">
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
            Apellido
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Pérez"
            value={values.lastName}
            onChange={handleChange}
            disabled={isSubmitting}
            className={cn(
              'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              errors.lastName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
            )}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-xs text-red-600" role="alert">
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={values.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className={cn(
              'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
            )}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            disabled={isSubmitting}
            className={cn(
              'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              errors.password
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
            )}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-xs text-red-600" role="alert">
              {errors.password}
            </p>
          )}
          <p className="text-xs text-slate-600">
            Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">
            {mode === 'public' ? '¿Qué tipo de usuario eres?' : 'Tipo de usuario'}
          </label>
          <div className={cn('grid gap-3', roles.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
            {roles.map((role) => {
              const display = getRoleDisplay(role.name);
              const isSelected = values.selectedRoleId === role.id;

              return (
                <label
                  key={role.id}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                    isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <input
                    type="radio"
                    name="selectedRoleId"
                    value={role.id}
                    checked={isSelected}
                    onChange={handleRoleChange}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  <div className={isSelected ? 'text-slate-900' : 'text-slate-400'}>
                    {display.icon}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-slate-900' : 'text-slate-600'
                    )}
                  >
                    {display.label}
                  </span>
                  <span className="text-center text-xs text-slate-500">{display.description}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" fullWidth disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Procesando…' : mode === 'public' ? 'Crear cuenta' : 'Registrar usuario'}
        </Button>

        {/* Back to Login - Solo modo público */}
        {showBackToLogin && mode === 'public' && (
          <>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-500">¿Ya tienes cuenta?</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link href="/login" className="block">
              <Button type="button" variant="secondary" fullWidth>
                Iniciar sesión
              </Button>
            </Link>
          </>
        )}
      </form>
    </>
  );
}
