import * as React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-50">{children}</div>;
}
