import * as React from 'react';
import Navbar from '@/src/components/layout/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      {children}
    </div>
  );
}
