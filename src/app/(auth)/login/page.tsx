'use client';

import * as React from 'react';
import LoginForm from '@/src/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              {/* Logo oficial proporcionado por el equipo */}
              <Image
                src="/logo.svg"
                alt="TicketHub"
                className="h-10 w-auto"
                width={144}
                height={40}
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Bienvenido de nuevo</h1>
            <p className="mt-1 text-sm text-slate-600">
              Introduce tus credenciales para acceder a tu cuenta.
            </p>
          </div>

          <React.Suspense fallback={<div className="text-sm text-slate-600">Cargando...</div>}>
            <LoginForm />
          </React.Suspense>
        </div>
      </div>
    </main>
  );
}
