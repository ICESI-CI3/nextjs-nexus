'use client';

/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/src/components/ui/Button';
import { showToast } from '@/src/lib/toast';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Show success toast
      showToast.success('¡Pago completado exitosamente!');
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Success Card */}
        <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="mb-3 text-3xl font-bold text-slate-900">¡Pago Exitoso!</h1>
          <p className="mb-8 text-lg text-slate-600">
            Tu pago ha sido procesado correctamente. Recibirás tus tickets por correo electrónico y
            también podrás verlos en tu historial de compras.
          </p>

          {/* Session ID (for debugging) */}
          {sessionId && (
            <div className="mb-6 rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">ID de sesión</p>
              <p className="font-mono text-sm break-all text-slate-700">{sessionId}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={() => router.push('/purchases/history')} variant="primary" fullWidth>
              Ver mis compras
            </Button>
            <Button onClick={() => router.push('/events')} variant="secondary" fullWidth>
              Explorar más eventos
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">Información importante</p>
                <p className="mt-1 text-sm text-blue-700">
                  Tus tickets han sido generados con códigos QR únicos. Guárdalos en un lugar seguro
                  y preséntalos en la entrada del evento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
