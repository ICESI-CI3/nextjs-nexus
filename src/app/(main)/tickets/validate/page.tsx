'use client';

import * as React from 'react';
import TicketValidationForm from '@/src/components/tickets/TicketValidationForm';
import useRequireAuth from '@/src/hooks/useRequireAuth';

export default function ValidateTicketPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-dvh bg-white">
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4">
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      </main>
    );
  }

  // User not authenticated
  if (!isAuthenticated) {
    return null; // useRequireAuth redirects to login
  }

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-8">
        {/* Main Content */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-center text-center">
              <h1 className="text-3xl font-semibold text-slate-900">Validación de Tickets</h1>
              <p className="mt-1 text-sm text-slate-600">
                Escanea el código QR o ingresa el código manualmente para validar un ticket
              </p>
            </div>

            {/* Validation Form */}
            <React.Suspense fallback={<div className="text-center text-sm">Cargando...</div>}>
              <TicketValidationForm />
            </React.Suspense>
          </div>

          {/* Help section */}
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <h3 className="mb-2 text-sm font-medium text-slate-900">¿Cómo validar un ticket?</h3>
            <ul className="space-y-1 pl-5 text-sm">
              <li className="list-disc">
                <strong>Escanear QR:</strong> Permite el acceso a la cámara y apunta al código QR
                del ticket
              </li>
              <li className="list-disc">
                <strong>Entrada manual:</strong> Escribe o pega el código del ticket y presiona
                validar
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
