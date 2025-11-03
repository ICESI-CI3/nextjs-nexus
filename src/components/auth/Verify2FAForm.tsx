'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import { cn, formatZodErrors } from '@/src/lib/utils';
import { showToast } from '@/src/lib/toast';
import authService from '@/src/services/authService';
import { ROUTES } from '@/src/lib/constants';
import useAuth from '@/src/hooks/useAuth';

const totpSchema = z.object({
  totpCode: z
    .string()
    .min(6, 'El código debe tener 6 dígitos')
    .max(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números'),
});

type TotpValues = z.infer<typeof totpSchema>;

const initialValues: TotpValues = {
  totpCode: '',
};

export default function Verify2FAForm() {
  const [values, setValues] = React.useState<TotpValues>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  // Recuperar email y password desde query params (pasados por LoginForm)
  const email = searchParams.get('email');
  const password = searchParams.get('password');
  const next = searchParams.get('next');

  React.useEffect(() => {
    // Si no hay credenciales, redirigir al login
    if (!email || !password) {
      showToast.error('Sesión expirada. Inicia sesión de nuevo.');
      router.replace(ROUTES.LOGIN);
    }
  }, [email, password, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    // Solo permitir dígitos y máximo 6 caracteres
    if (/^\d*$/.test(value) && value.length <= 6) {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const parse = totpSchema.safeParse(values);
    if (!parse.success) {
      setErrors(formatZodErrors(parse.error));
      return;
    }

    if (!email || !password) {
      showToast.error('Faltan credenciales. Vuelve a iniciar sesión.');
      router.replace(ROUTES.LOGIN);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authService.loginWith2FA(email, password, values.totpCode);

      // Propagar tokens al store
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });

      showToast.success('Verificación exitosa');
      // Redirigir al destino deseado o al dashboard
      router.push(next || ROUTES.DASHBOARD);
    } catch (_err) {
      showToast.error('Código incorrecto o expirado');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Si faltan credenciales, no renderizar el form (el useEffect redirigirá)
  if (!email || !password) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          className={cn(
            'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center font-mono text-2xl tracking-widest text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none',
            errors.totpCode && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
          aria-invalid={!!errors.totpCode}
          aria-describedby={errors.totpCode ? 'totpCode-error' : undefined}
          maxLength={6}
          autoFocus
        />
        {errors.totpCode && (
          <p id="totpCode-error" className="mt-1 text-xs text-red-600" role="alert">
            {errors.totpCode}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Abre tu app autenticadora (Google Authenticator, Authy, etc.) y copia el código de 6
          dígitos.
        </p>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting || values.totpCode.length !== 6}>
        {isSubmitting ? 'Verificando…' : 'Verificar código'}
      </Button>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">¿Problemas para acceder?</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Link href={ROUTES.LOGIN} className="block">
        <Button type="button" variant="ghost" fullWidth>
          Volver al inicio de sesión
        </Button>
      </Link>
    </form>
  );
}
