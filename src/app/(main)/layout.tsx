'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/src/components/layout/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-zinc-50">
      {!isAdminPage && <Navbar />}
      {children}
    </div>
  );
}
