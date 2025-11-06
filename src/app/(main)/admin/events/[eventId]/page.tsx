'use client';

/**
 * Admin Event Detail Page
 * Displays detailed information about a specific event and its ticket types for admin users.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventStore } from '@/src/stores/useEventStore';
import { showToast } from '@/src/lib/toast';

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { currentEvent, ticketTypes, isLoading, error, fetchEventWithTicketTypes, clearError } =
    useEventStore();

  useEffect(() => {
    if (!eventId) return;

    fetchEventWithTicketTypes(eventId).catch((err) => {
      showToast.error('Error al cargar el evento');
      console.error(err);
    });

    return () => {
      clearError();
    };
  }, [eventId, fetchEventWithTicketTypes, clearError]);

  if (isLoading || !currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div>
            <p className="text-slate-600">Cargando evento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <h3 className="mb-2 text-xl font-semibold text-red-900">Error al cargar evento</h3>
          <p className="mb-6 text-red-700">{error}</p>
          <button
            onClick={() => router.push('/admin/events')}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Volver a eventos
          </button>
        </div>
      </div>
    );
  }

  const event = currentEvent;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-800',
    PRE_SALE: 'bg-purple-100 text-purple-800',
    ACTIVE: 'bg-green-200 text-green-800',
    SUSPENDED: 'bg-yellow-200 text-yellow-800',
    CANCELLED: 'bg-red-200 text-red-800',
    FINISHED: 'bg-slate-200 text-slate-800',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Borrador',
    PRE_SALE: 'Pre-venta',
    ACTIVE: 'Activo',
    SUSPENDED: 'Suspendido',
    CANCELLED: 'Cancelado',
    FINISHED: 'Finalizado',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/admin/events')}
          className="mb-6 flex items-center text-slate-600 transition-colors hover:text-slate-900"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a gestión de eventos
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span
                    className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[event.status] || 'bg-slate-100 text-slate-800'}`}
                  >
                    {statusLabels[event.status] || event.status}
                  </span>
                  <h1 className="mb-2 text-3xl font-bold text-slate-900">{event.title}</h1>
                  <span className="inline-flex items-center rounded-md bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    {event.category.name}
                  </span>
                </div>
              </div>

              {event.description && <p className="mb-6 text-slate-700">{event.description}</p>}

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-start">
                  <svg
                    className="mr-3 h-6 w-6 flex-shrink-0 text-slate-600"
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
                  <div>
                    <p className="font-semibold text-slate-900">Fecha y hora</p>
                    <p className="text-slate-600">
                      {formattedDate}
                      <br />
                      {formattedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="mr-3 h-6 w-6 flex-shrink-0 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-slate-900">Ubicacion</p>
                    <p className="text-slate-600">
                      {event.venue.name}
                      <br />
                      {event.venue.address}
                      <br />
                      {event.venue.city}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Capacidad: {event.venue.maxCapacity.toLocaleString()} personas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Tipos de Tickets</h2>

              {ticketTypes.length === 0 ? (
                <div className="rounded-lg bg-white p-4 text-center">
                  <p className="text-sm text-slate-600">
                    No hay tipos de tickets disponibles para este evento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketTypes.map((ticketType) => (
                    <div key={ticketType.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900">{ticketType.name}</h3>
                        <span className="text-lg font-bold text-slate-900">
                          ${Number(ticketType.price).toFixed(2)}
                        </span>
                      </div>

                      {ticketType.description && (
                        <p className="mb-2 text-sm text-slate-600">{ticketType.description}</p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Disponibles:</span>
                        <span
                          className={`font-medium ${ticketType.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {ticketType.quantity > 0 ? `${ticketType.quantity} tickets` : 'Agotado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
