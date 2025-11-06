'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventForm from '@/src/components/events/EventForm';
import { useEventStore } from '@/src/stores/useEventStore';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { ROUTES } from '@/src/lib/constants';
import type { CreateEventDTO } from '@/src/lib/types';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { isAuthorized, isLoading: authLoading } = useRequireRole('ADMINISTRATOR');

  const { currentEvent, isLoading, fetchEventById, updateEvent } = useEventStore();

  React.useEffect(() => {
    if (isAuthorized && eventId) {
      fetchEventById(eventId).catch(() => {
        toast.error('Error al cargar el evento');
        router.push(ROUTES.ADMIN_EVENTS);
      });
    }
  }, [isAuthorized, eventId, fetchEventById, router]);

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      await updateEvent(eventId, data);
      toast.success('Evento actualizado con éxito');
      router.push(ROUTES.ADMIN_EVENTS);
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

  if (!isAuthorized) {
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Editar Evento</h1>
        <p className="mt-2 text-sm text-slate-600">
          Actualiza la información del evento &quot;{currentEvent.title}&quot;
        </p>
      </div>

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
