'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useEventStore } from '@/src/stores/useEventStore';
import { formatDate, formatCurrency } from '@/src/lib/utils';
import EventStatusBadge from '@/src/components/events/EventStatusBadge';
import Button from '@/src/components/ui/Button';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { currentEvent, isLoading, fetchEventById } = useEventStore();

  React.useEffect(() => {
    if (eventId) {
      fetchEventById(eventId).catch(() => {
        toast.error('Error al cargar el evento');
        router.push('/events');
      });
    }
  }, [eventId, fetchEventById, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  // --- Defensive Data Handling ---
  const { venue, category, ticketTypes } = currentEvent;
  const venueName = venue?.name ?? 'No especificado';
  const venueAddress = venue?.address ?? 'Dirección no disponible';
  const venueCapacity = venue?.capacity?.toLocaleString('es-ES') ?? 'N/A';
  const categoryName = category?.name ?? 'Sin categoría';
  const availableTickets = ticketTypes ?? [];
  // ---------------------------

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/events')} className="mb-6">
          ← Volver a eventos
        </Button>

        {/* Event Header */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900">{currentEvent.name}</h1>
            <EventStatusBadge status={currentEvent.status} />
          </div>

          <p className="mb-6 text-lg text-slate-700">{currentEvent.description}</p>

          {/* Event Info Grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <svg
                  className="h-5 w-5 text-slate-600"
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
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Fecha</p>
                <p className="text-base font-semibold text-slate-900">
                  {formatDate(currentEvent.date, 'long')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <svg
                  className="h-5 w-5 text-slate-600"
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
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Recinto</p>
                <p className="text-base font-semibold text-slate-900">{venueName}</p>
                <p className="text-sm text-slate-600">{venueAddress}</p>
                <p className="text-sm text-slate-600">Capacidad: {venueCapacity}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <svg
                  className="h-5 w-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Categoría</p>
                <p className="text-base font-semibold text-slate-900">{categoryName}</p>
              </div>
            </div>
          </div>

          {/* Ticket Types Section */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Tipos de Tickets</h2>

            {availableTickets.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm text-slate-500">
                  No hay tipos de tickets disponibles para este evento
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{ticket.name}</h3>
                      <p className="text-sm text-slate-600">
                        {ticket.quantity} tickets disponibles
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(ticket.price)}
                      </p>
                      <Button size="sm" className="mt-2">
                        Comprar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
