'use client';

import * as React from 'react';
import { toast } from 'react-hot-toast';
import EventList from '@/src/components/events/EventList';
import { useEventStore } from '@/src/stores/useEventStore';

export default function PublicEventsPage() {
  const { events, isLoading, totalPages, currentPage, fetchEvents } = useEventStore();

  React.useEffect(() => {
    // Fetch only active events for public view
    fetchEvents({ page: 1, limit: 12, status: 'active' }).catch(() => {
      toast.error('Error al cargar eventos');
    });
  }, [fetchEvents]);

  const handlePageChange = (page: number) => {
    fetchEvents({ page, limit: 12, status: 'active' }).catch(() => {
      toast.error('Error al cargar eventos');
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Eventos Disponibles</h1>
          <p className="mt-2 text-slate-600">
            Descubre los mejores eventos y consigue tus entradas
          </p>
        </div>

        <EventList
          events={events}
          viewMode="grid"
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          emptyMessage="No hay eventos disponibles en este momento"
        />
      </div>
    </div>
  );
}
