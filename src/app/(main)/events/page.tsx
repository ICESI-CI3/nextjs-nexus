'use client';

/**
 * Events List Page
 * Displays all available events
 */

import { useEffect } from 'react';
import { useEventStore } from '@/src/stores/useEventStore';
import EventCard from '@/src/components/events/EventCard';
import { showToast } from '@/src/lib/toast';

export default function EventsPage() {
  const { events, isLoading, error, fetchEvents, clearError } = useEventStore();

  useEffect(() => {
    // Fetch events on mount
    fetchEvents().catch(() => {
      showToast.error('Error al cargar los eventos');
    });

    // Clean up error on unmount
    return () => {
      clearError();
    };
  }, [fetchEvents, clearError]);

  // Loading state
  if (isLoading && (!events || events.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div>
            <p className="text-slate-600">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!events || events.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-red-900">Error al cargar eventos</h3>
          <p className="mb-6 text-red-700">{error}</p>
          <button
            onClick={() => fetchEvents()}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-slate-900">No hay eventos disponibles</h3>
          <p className="text-slate-600">Por el momento no hay eventos publicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Eventos Disponibles</h1>
        <p className="text-slate-600">Descubre los mejores eventos y compra tus entradas</p>
      </div>

      {/* Events grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Loading indicator when refetching */}
      {isLoading && events && events.length > 0 && (
        <div className="mt-6 text-center">
          <span className="text-sm text-slate-600">Actualizando...</span>
        </div>
      )}
    </div>
  );
}
