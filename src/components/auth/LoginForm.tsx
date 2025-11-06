'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';
import { authSchemas, cn, formatZodErrors } from '@/src/lib/utils';
import { ROUTES } from '@/src/lib/constants';
import authService from '@/src/services/authService';
import useAuth from '@/src/hooks/useAuth';

type LoginValues = z.infer<typeof authSchemas.login>;

const INITIAL_VALUES: LoginValues = {
  email: '',
  password: '',
};

export default function LoginForm() {
  const [values, setValues] = React.useState<LoginValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, fetchProfile } = useAuth();

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear errors when user starts typing
    setGeneralError('');
    setErrors((prev) => ({ ...prev, [name]: '' }));

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setGeneralError('');

      // Validate form data
      const parse = authSchemas.login.safeParse({
        email: values.email,
        password: values.password,
      });

      if (!parse.success) {
        setErrors(formatZodErrors(parse.error));
        return;
      }

      try {
        setIsSubmitting(true);
        const result = await authService.login(values.email, values.password);

        // Handle 2FA requirement
        if (result.requires2FA) {
          sessionStorage.setItem('temp_2fa_email', values.email);
          sessionStorage.setItem('temp_2fa_password', values.password);

          const next = searchParams.get('next');
          const params = next ? `?next=${encodeURIComponent(next)}` : '';
          router.push(`${ROUTES.VERIFY_2FA}${params}`);
          return;
        }

        // Login successful - set tokens and fetch profile
        setTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        try {
          await fetchProfile();
        } catch (error) {
          // Use debug level to avoid error overlay in development
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Failed to fetch profile:', error);
          }
        }

        // No redirigimos aquí - dejamos que login/page.tsx maneje
        // la redirección basada en activeRole a través de su useEffect
      } catch (err) {
        const error = err as {
          message?: string;
          response?: { data?: { message?: string | string[] }; status?: number };
        };

        // Handle different error types
        const status = error.response?.status;
        const rawMessage = error.response?.data?.message;

        let errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';

        if (status === 400 || status === 401) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (status === 429) {
          errorMessage = 'Demasiados intentos. Por favor, espera unos minutos.';
        } else if (status && status >= 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        } else if (rawMessage) {
          errorMessage = Array.isArray(rawMessage) ? rawMessage.join('. ') : rawMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setGeneralError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, searchParams, setTokens, fetchProfile, router]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* General Error Message */}
      <FormError message={generalError} />

      {/* Email Field */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
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
          <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="cursor-not-allowed text-xs text-slate-600 opacity-60 transition-colors hover:text-slate-800"
            disabled
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
          <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Iniciando…' : 'Iniciar sesión'}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">¿No tienes cuenta?</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Register Link */}
      <Link href={ROUTES.REGISTER} className="block">
        <Button type="button" variant="secondary" fullWidth>
          Regístrate aquí
        </Button>
      </Link>
    </form>
  );
}
