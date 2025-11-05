'use client';

import { useRouter } from 'next/navigation';
import EventForm from '@/src/components/events/EventForm';
import { useEventStore } from '@/src/stores/useEventStore';
import { showToast } from '@/src/lib/toast';
import { CreateEventDTO } from '@/src/lib/types';
import { ROUTES } from '@/src/lib/constants';

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent, isLoading } = useEventStore();

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      const newEvent = await createEvent(data);
      showToast.success('Evento creado exitosamente');
      router.push(`${ROUTES.ADMIN_EVENTS}/${newEvent.id}/edit`);
    } catch {
      showToast.error('Error al crear el evento');
      // The form will display a general error message
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.ADMIN_EVENTS);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Crear Nuevo Evento</h1>
          <p className="text-slate-600">Completa los detalles para crear un nuevo evento.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <EventForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
