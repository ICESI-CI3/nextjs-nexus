'use client';

/**
 * Payment Cancel Page
 * Displayed when user cancels Stripe checkout
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/ui/Button';
import { showToast } from '@/src/lib/toast';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Show info toast
    showToast.info('Pago cancelado');
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Cancel Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {/* Cancel Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-12 w-12 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="mb-3 text-3xl font-bold text-slate-900">Pago Cancelado</h1>
          <p className="mb-8 text-lg text-slate-600">
            Has cancelado el proceso de pago. No se ha realizado ningún cargo. Tus items permanecen
            en el carrito.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={() => router.push('/cart')} variant="primary" fullWidth>
              Volver al carrito
            </Button>
            <Button onClick={() => router.push('/events')} variant="secondary" fullWidth>
              Continuar explorando eventos
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-amber-900">¿Tuviste algún problema?</p>
                <p className="mt-1 text-sm text-amber-700">
                  Si experimentaste algún inconveniente durante el proceso de pago, por favor
                  contáctanos o intenta nuevamente más tarde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
