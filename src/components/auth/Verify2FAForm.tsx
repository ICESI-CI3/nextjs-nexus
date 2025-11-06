'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';
import { cn, formatZodErrors } from '@/src/lib/utils';
import { ROUTES } from '@/src/lib/constants';
import authService from '@/src/services/authService';
import useAuth from '@/src/hooks/useAuth';
import ErrorBoundary from '@/src/components/ui/ErrorBoundary';

const TOTP_SCHEMA = z.object({
  totpCode: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d+$/, 'El código solo debe contener números'),
});

type TotpValues = z.infer<typeof TOTP_SCHEMA>;

const INITIAL_VALUES: TotpValues = {
  totpCode: '',
};

function Verify2FAFormContent() {
  const [values, setValues] = React.useState<TotpValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, fetchProfile } = useAuth();

  const email = React.useMemo(() => sessionStorage.getItem('temp_2fa_email'), []);
  const password = React.useMemo(() => sessionStorage.getItem('temp_2fa_password'), []);

  React.useEffect(() => {
    if (!email || !password) {
      router.replace(ROUTES.LOGIN);
    }
  }, [email, password, router]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear errors when user starts typing
    setGeneralError('');
    setErrors({});

    // Only allow digits and max 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setGeneralError('');

      // Validate TOTP code
      const parse = TOTP_SCHEMA.safeParse(values);
      if (!parse.success) {
        setErrors(formatZodErrors(parse.error));
        return;
      }

      if (!email || !password) {
        setGeneralError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        setTimeout(() => router.replace(ROUTES.LOGIN), 2000);
        return;
      }

      try {
        setIsSubmitting(true);
        const result = await authService.loginWith2FA(email, password, values.totpCode);

        // Clear temporary credentials
        sessionStorage.removeItem('temp_2fa_email');
        sessionStorage.removeItem('temp_2fa_password');

        // Set tokens and fetch profile
        setTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        try {
          await fetchProfile();
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }

        const next = searchParams.get('next');
        router.push(next || ROUTES.DASHBOARD);
      } catch (err) {
        const error = err as {
          message?: string;
          response?: { data?: { message?: string | string[] }; status?: number };
        };

        const status = error.response?.status;
        const rawMessage = error.response?.data?.message;

        let errorMessage = 'Error al verificar el código. Por favor, intenta nuevamente.';

        if (status === 400 || status === 401) {
          errorMessage = 'Código incorrecto o expirado. Verifica e intenta nuevamente.';
        } else if (status === 429) {
          errorMessage = 'Demasiados intentos. Por favor, espera unos minutos.';
        } else if (rawMessage) {
          errorMessage = Array.isArray(rawMessage) ? rawMessage.join('. ') : rawMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setGeneralError(errorMessage);
        setValues(INITIAL_VALUES); // Clear input on error
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, email, password, searchParams, setTokens, fetchProfile, router]
  );

  if (!email || !password) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* General Error Message */}
      <FormError message={generalError} />

      {/* TOTP Code Input */}
      <div className="space-y-1">
        <label htmlFor="totpCode" className="block text-sm font-medium text-slate-700">
          Código de autenticación
        </label>
        <input
          id="totpCode"
          name="totpCode"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={values.totpCode}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={6}
          autoFocus
          className={cn(
            'block w-full rounded-md border bg-white px-3 py-3 text-center font-mono text-lg tracking-widest text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            errors.totpCode || generalError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
          )}
          aria-invalid={!!errors.totpCode}
          aria-describedby={errors.totpCode ? 'totpCode-error' : undefined}
        />
        {errors.totpCode && (
          <p id="totpCode-error" className="mt-1 text-xs text-red-600" role="alert">
            {errors.totpCode}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Abre tu app autenticadora y copia el código de 6 dígitos
        </p>
      </div>

      {/* Submit Button */}
      <Button type="submit" fullWidth disabled={isSubmitting || values.totpCode.length !== 6}>
        {isSubmitting ? 'Verificando…' : 'Verificar código'}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">¿Problemas para acceder?</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Back to Login Link */}
      <Link href={ROUTES.LOGIN} className="block">
        <Button type="button" variant="ghost" fullWidth>
          Volver al inicio de sesión
        </Button>
      </Link>
    </form>
  );
}

export default function Verify2FAForm() {
  return (
    <ErrorBoundary>
      <Verify2FAFormContent />
    </ErrorBoundary>
  );
}
