'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventForm from '@/src/components/events/EventForm';
import { useEventStore } from '@/src/stores/useEventStore';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import type { CreateEventDTO } from '@/src/lib/types';

export default function OrganizerCreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const { createEvent, isLoading } = useEventStore();

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      const newEvent = await createEvent(data);
      console.log('New event created:', newEvent);

      if (newEvent && newEvent.id) {
        toast.success('Evento creado con éxito en estado BORRADOR');
        router.push(`/organizer/events/${newEvent.id}/tickets`);
      } else {
        console.error('Create event returned an invalid event object:', newEvent);
        toast.error('Error al crear el evento: no se recibió un ID de evento válido.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error al crear el evento.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading) {
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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Crear Nuevo Evento</h1>
        <p className="mt-2 text-sm text-slate-600">
          Completa la información del evento. Se creará en estado BORRADOR y después podrás
          configurar los tipos de tickets.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <EventForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>

      {/* Info card */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Siguiente paso: Configurar Tickets</p>
            <p className="mt-1">
              Después de crear el evento, podrás definir los tipos de tickets (VIP, General, etc.)
              con sus precios y cantidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
