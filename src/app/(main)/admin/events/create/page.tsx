'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventForm from '@/src/components/events/EventForm';
import { useEventStore } from '@/src/stores/useEventStore';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { ROUTES } from '@/src/lib/constants';
import type { CreateEventDTO } from '@/src/lib/types';

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useRequireRole('ADMINISTRATOR');

  const { createEvent, isLoading } = useEventStore();

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      const newEvent = await createEvent(data);
      toast.success('Evento creado con éxito');
      router.push(ROUTES.ADMIN_EVENT_TICKETS(newEvent.id));
    } catch {
      toast.error('Error al crear el evento');
      throw new Error('Failed to create event');
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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Crear Nuevo Evento</h1>
        <p className="mt-2 text-sm text-slate-600">
          Completa la información del evento. Después podrás configurar los tipos de tickets.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <EventForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </div>
  );
}
