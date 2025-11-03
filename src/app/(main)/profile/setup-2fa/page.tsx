'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import { cn, formatZodErrors } from '@/src/lib/utils';
import { showToast } from '@/src/lib/toast';
import authService from '@/src/services/authService';
import { ROUTES } from '@/src/lib/constants';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import { useAuthStore } from '@/src/stores/useAuthStore';
import QRCode from 'qrcode';
// Pequeño helper seguro para extraer status y mensaje de errores tipo Axios sin usar `any`
type ErrorLike = { message?: string };
type ResponseLike = { status?: number; data?: unknown };
type AxiosLikeError = ErrorLike & { response?: ResponseLike };

function getErrorInfo(err: unknown): { status?: number; message?: string } {
  const e = err as AxiosLikeError;
  const status = e?.response?.status;
  let message: string | undefined = undefined;
  const rawMsg = (e?.response as ResponseLike | undefined)?.data as unknown as
    | { message?: unknown }
    | string
    | undefined;
  if (typeof rawMsg === 'string') {
    message = rawMsg;
  } else if (rawMsg && typeof (rawMsg as { message?: unknown }).message !== 'undefined') {
    const inner = (rawMsg as { message?: unknown }).message;
    message = Array.isArray(inner)
      ? inner.join(' ')
      : typeof inner === 'string'
        ? inner
        : e?.message;
  } else {
    message = e?.message;
  }
  return { status, message };
}

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

export default function Setup2FAPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  // Selectores finos para evitar snapshots inestables en React 19
  const twoFactorEnabled = useAuthStore((s) => s.twoFactorEnabled);
  const setTwoFactorEnabled = useAuthStore((s) => s.setTwoFactorEnabled);

  const [setupData, setSetupData] = React.useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  // Cuando el backend ya tiene 2FA activado, el endpoint setup-2fa responde 400.
  // Guardamos este estado para mostrar la vista de "gestión" (desactivar) en vez del setup.
  const [alreadyEnabled, setAlreadyEnabled] = React.useState<boolean>(twoFactorEnabled === true);
  const [values, setValues] = React.useState<TotpValues>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = React.useState(true);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = React.useState(false);
  const [disableCode, setDisableCode] = React.useState('');
  const [isDisabling, setIsDisabling] = React.useState(false);

  // Cargar el QR y secret al montar
  React.useEffect(() => {
    if (isAuthenticated) {
      authService
        .setup2FA()
        .then((data) => {
          setSetupData(data);
          setIsLoadingSetup(false);
        })
        .catch((err: unknown) => {
          const { status, message } = getErrorInfo(err);
          const msg = message ? String(message) : '';
          // Caso esperado: 400 cuando ya está activada
          if (status === 400 || /already\s*enabled/i.test(msg)) {
            setAlreadyEnabled(true);
            setTwoFactorEnabled(true);
          } else if (status === 401) {
            // Token inválido/expirado; el interceptor intentará refrescar, pero por si acaso
            showToast.error('Sesión expirada. Inicia sesión nuevamente.');
            router.push('/login');
          } else {
            showToast.error('Error al cargar configuración 2FA');
          }
          setIsLoadingSetup(false);
        });
    }
  }, [isAuthenticated, router, setTwoFactorEnabled]);

  // Generar imagen QR (data URL) a partir del otpauth://
  React.useEffect(() => {
    async function generateQR() {
      if (!setupData?.qrCodeUrl) return;
      try {
        setIsGeneratingQR(true);
        const dataUrl = await QRCode.toDataURL(setupData.qrCodeUrl, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 192,
        });
        setQrDataUrl(dataUrl);
      } catch {
        showToast.error('No se pudo generar el código QR');
      } finally {
        setIsGeneratingQR(false);
      }
    }
    generateQR();
  }, [setupData?.qrCodeUrl]);

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

    try {
      setIsLoading(true);
      await authService.enable2FA(values.totpCode);

      showToast.success('2FA activado correctamente');
      setTwoFactorEnabled(true);

      // Redirigir al dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const { message } = getErrorInfo(err);
      const msg = message || 'Código incorrecto. Intenta de nuevo.';
      console.error('Enable 2FA error:', err);
      showToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading || isLoadingSetup) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Si ya estaba activada, mostramos la pantalla de gestión (desactivar) en vez de error.
  if (!setupData && !alreadyEnabled) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">Error al cargar configuración. Intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        {!alreadyEnabled ? (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">Configurar autenticación 2FA</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sigue estos pasos para añadir una capa extra de seguridad a tu cuenta.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">Autenticación 2FA activa</h1>
            <p className="mt-2 text-sm text-slate-600">
              Ya tienes 2FA activada. Si deseas desactivarla, confirma con un código TOTP de tu app
              o con un código de respaldo.
            </p>
          </>
        )}
      </div>

      <div className="space-y-6">
        {!alreadyEnabled && setupData && (
          <>
            {/* Paso 1: Escanear QR */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">
                  1
                </span>
                Escanea el código QR
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                Abre tu aplicación autenticadora (Google Authenticator, Authy, etc.) y escanea este
                código QR:
              </p>
              <div className="flex justify-center rounded-lg bg-slate-50 p-6">
                {qrDataUrl ? (
                  // Mostramos el QR generado como data URL
                  <img src={qrDataUrl} alt="QR Code para 2FA" className="h-48 w-48" />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-md border border-slate-200 bg-white text-sm text-slate-500">
                    {isGeneratingQR ? 'Generando QR…' : 'QR no disponible'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!alreadyEnabled && (
          <>
            {/* Paso 2: Verificar código */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">
                  2
                </span>
                Verifica el código
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                Introduce el código de 6 dígitos que aparece en tu aplicación para confirmar:
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label htmlFor="totpCode" className="block text-sm font-medium text-slate-700">
                    Código de verificación
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
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => router.push(ROUTES.DASHBOARD)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading || values.totpCode.length !== 6}
                  >
                    {isLoading ? 'Activando…' : 'Activar 2FA'}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
        {!alreadyEnabled && setupData && (
          <>
            {/* Códigos de respaldo */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <h3 className="mb-2 flex items-center gap-2 text-base font-medium text-amber-900">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Códigos de respaldo
              </h3>
              <p className="mb-3 text-sm text-amber-800">
                Guarda estos códigos en un lugar seguro. Puedes usarlos si pierdes acceso a tu
                aplicación autenticadora:
              </p>
              <div className="grid grid-cols-2 gap-2 rounded-md bg-white p-4">
                {setupData.backupCodes.map((code, idx) => (
                  <code key={idx} className="font-mono text-sm text-slate-900">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          </>
        )}

        {alreadyEnabled && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">
                •
              </span>
              Desactivar 2FA
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              Ingresa un código TOTP de tu aplicación o uno de tus códigos de respaldo para
              desactivar 2FA.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!disableCode || disableCode.trim().length < 4) return;
                try {
                  setIsDisabling(true);
                  await authService.disable2FA(disableCode.trim());
                  showToast.success('2FA desactivado correctamente');
                  setTwoFactorEnabled(false);
                  router.push(ROUTES.DASHBOARD);
                } catch (err: unknown) {
                  const { message } = getErrorInfo(err);
                  const msg = message || 'No se pudo desactivar 2FA';
                  console.error('Disable 2FA error:', err);
                  showToast.error(msg);
                } finally {
                  setIsDisabling(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label htmlFor="disableCode" className="block text-sm font-medium text-slate-700">
                  Código (TOTP o respaldo)
                </label>
                <input
                  id="disableCode"
                  name="disableCode"
                  type="text"
                  placeholder="000000 o ABCD1234"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.trim())}
                  className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center font-mono text-lg text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                >
                  Cancelar
                </Button>
                <Button type="submit" fullWidth disabled={isDisabling || !disableCode}>
                  {isDisabling ? 'Desactivando…' : 'Desactivar 2FA'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
