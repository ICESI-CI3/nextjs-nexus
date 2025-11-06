import { Suspense } from 'react';
import RegisterForm from '@/src/components/auth/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="TicketHub"
                className="h-10 w-auto"
                width={144}
                height={40}
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Crea tu cuenta</h1>
            <p className="mt-1 text-sm text-slate-600">
              Completa el formulario para comenzar a disfrutar de nuestros eventos.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
