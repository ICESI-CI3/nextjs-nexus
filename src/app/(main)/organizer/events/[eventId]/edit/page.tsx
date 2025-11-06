'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventForm from '@/src/components/events/EventForm';
import { useEventStore } from '@/src/stores/useEventStore';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import type { CreateEventDTO } from '@/src/lib/types';
import { EventStatus } from '@/src/lib/types';

export default function OrganizerEditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const { currentEvent, isLoading, fetchEventById, updateEvent } = useEventStore();

  React.useEffect(() => {
    if (isAuthenticated && eventId) {
      fetchEventById(eventId).catch(() => {
        toast.error('Error al cargar el evento');
        router.push('/organizer/events');
      });
    }
  }, [isAuthenticated, eventId, fetchEventById, router]);

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      await updateEvent(eventId, data);
      toast.success('Evento actualizado con éxito');
      router.push('/organizer/events');
    } catch {
      toast.error('Error al actualizar el evento');
      throw new Error('Failed to update event');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!currentEvent) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  const canEdit =
    currentEvent.status === EventStatus.DRAFT || currentEvent.status === EventStatus.REJECTED;

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900">No se puede editar este evento</h3>
              <p className="mt-1 text-sm text-yellow-800">
                Solo puedes editar eventos en estado BORRADOR o RECHAZADO. Este evento está en
                estado: <strong>{currentEvent.status}</strong>
              </p>
              <button
                onClick={() => router.push('/organizer/events')}
                className="mt-3 text-sm font-medium text-yellow-900 underline hover:text-yellow-700"
              >
                Volver a mis eventos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Editar Evento</h1>
        <p className="mt-2 text-sm text-slate-600">
          Actualiza la información del evento &quot;{currentEvent.title}&quot;
        </p>
      </div>

      {currentEvent.status === EventStatus.REJECTED && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-600"
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
            <div className="text-sm text-red-800">
              <p className="font-medium">Evento rechazado por el administrador</p>
              <p className="mt-1">
                Revisa los comentarios y realiza los cambios necesarios antes de volver a solicitar
                aprobación.
              </p>
              {currentEvent.statusLogs && currentEvent.statusLogs.length > 0 && (
                <div className="mt-2 rounded bg-red-100 p-2">
                  <p className="text-xs font-medium">Comentarios:</p>
                  {currentEvent.statusLogs.map((log, idx) => (
                    <p key={idx} className="text-xs">
                      {log}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <EventForm
          initialData={currentEvent}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
