'use client';

import * as React from 'react';
import VenueList from '@/src/components/venues/VenueList';
import useRequireAuth from '@/src/hooks/useRequireAuth';

export default function OrganizerVenuesPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <VenueList />
    </div>
  );
}
