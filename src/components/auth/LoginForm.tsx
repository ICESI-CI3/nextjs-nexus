'use client';

import * as React from 'react';
import Link from 'next/link';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import { authSchemas, cn, formatZodErrors } from '@/src/lib/utils';
import { showToast } from '@/src/lib/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import authService from '@/src/services/authService';
import { ROUTES } from '@/src/lib/constants';
import useAuth from '@/src/hooks/useAuth';

type LoginValues = z.infer<typeof authSchemas.login> & { rememberMe: boolean };

const initialValues: LoginValues = {
  email: '',
  password: '',
  rememberMe: false,
};

export default function LoginForm() {
  const [values, setValues] = React.useState<LoginValues>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

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

      if (result.requires2FA) {
        showToast.info('Se requiere verificación 2FA.');
        // Redirigir a pantalla de verificación 2FA pasando credenciales por query params
        const next = searchParams.get('next');
        const params = new URLSearchParams({
          email: values.email,
          password: values.password,
        });
        if (next) params.set('next', next);
        router.push(`/verify-2fa?${params.toString()}`);
        return;
      }

      // Sin 2FA: propagar tokens al store para marcar sesión activa inmediatamente
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });

      showToast.success('Inicio de sesión exitoso');
      const next = searchParams.get('next');
      // Redirige al destino deseado o al dashboard protegido
      router.push(next || ROUTES.DASHBOARD);
    } catch (err: unknown) {
      // Extrae el mensaje de error de forma segura (axios-like)
      const e =
        err && typeof err === 'object'
          ? (err as { message?: string; response?: { data?: { message?: unknown } } })
          : undefined;
      const raw = e?.response?.data?.message;
      const msg =
        (Array.isArray(raw) ? raw.join(' ') : typeof raw === 'string' ? raw : e?.message) ||
        'No se pudo iniciar sesión';
      console.error('Login error:', err);
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          className={cn(
            'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none',
            errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <Link href="#" className="text-xs text-slate-600 hover:text-slate-800">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          className={cn(
            'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none',
            errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
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

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={values.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-600"
        />
        <label htmlFor="rememberMe" className="text-sm text-slate-700">
          Recordarme
        </label>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Iniciando…' : 'Iniciar sesión'}
      </Button>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">¿No tienes cuenta?</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Link href="/register" className="block">
        <Button type="button" variant="secondary" fullWidth>
          Regístrate aquí
        </Button>
      </Link>
    </form>
  );
}
