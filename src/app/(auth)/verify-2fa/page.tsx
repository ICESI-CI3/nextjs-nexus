'use client';

import Verify2FAForm from '@/src/components/auth/Verify2FAForm';

export default function Verify2FAPage() {
  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              {/* Logo oficial proporcionado por el equipo */}
              <img
                src="/logo.svg"
                alt="TicketHub"
                className="h-10 w-auto"
                width={144}
                height={40}
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Verificación en dos pasos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Introduce el código de 6 dígitos de tu aplicación autenticadora.
            </p>
          </div>

          <Verify2FAForm />
        </div>
      </div>
    </main>
  );
}
