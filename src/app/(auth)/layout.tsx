import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticación | TicketHub',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
