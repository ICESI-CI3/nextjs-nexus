'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventForm from '@/src/components/events/EventForm';
import { useEventStore } from '@/src/stores/useEventStore';
import { showToast } from '@/src/lib/toast';
import { CreateEventDTO } from '@/src/lib/types';
import { ROUTES } from '@/src/lib/constants';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { currentEvent, isLoading, error, fetchEventById, updateEvent, clearError } =
    useEventStore();

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId).catch(() => {
        showToast.error('Error al cargar el evento para editar');
      });
    }
    return () => clearError();
  }, [eventId, fetchEventById, clearError]);

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      await updateEvent(eventId, data);
      showToast.success('Evento actualizado exitosamente');
      router.push(ROUTES.ADMIN_EVENTS);
    } catch {
      showToast.error('Error al actualizar el evento');
      // The form will display a general error message
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.ADMIN_EVENTS);
  };

  if (isLoading && !currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div>
            <p className="text-slate-600">Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h3 className="mb-2 text-xl font-semibold text-red-900">Error al cargar el evento</h3>
          <p className="mb-6 text-red-700">{error}</p>
          <button
            onClick={() => router.push(ROUTES.ADMIN_EVENTS)}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Volver a eventos
          </button>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    // This can happen if the event is not found or on the initial load
    return null; // Or a not found component
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Editar Evento</h1>
          <p className="text-slate-600">Modifica los detalles del evento como necesites.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <EventForm
            initialData={currentEvent}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
