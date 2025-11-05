'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import TicketTypeManager from '@/src/components/events/TicketTypeManager';
import Button from '@/src/components/ui/Button';
import { useEventStore } from '@/src/stores/useEventStore';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import { ROUTES } from '@/src/lib/constants';

export default function ManageEventTicketsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const { currentEvent, ticketTypes, isLoading, fetchEventWithTicketTypes } = useEventStore();

  React.useEffect(() => {
    if (isAuthenticated && eventId) {
      fetchEventWithTicketTypes(eventId).catch(() => {
        toast.error('Error al cargar el evento y los tickets');
        router.push(ROUTES.ADMIN + '/events');
      });
    }
  }, [isAuthenticated, eventId, fetchEventWithTicketTypes, router]);

  const handleGoBack = () => {
    router.push(ROUTES.ADMIN + '/events');
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
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-800">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          ← Volver a Mis Eventos
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Tickets</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configura los tipos de tickets para &quot;{currentEvent.title}&quot;
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <TicketTypeManager eventId={eventId} tickets={ticketTypes} />
      </div>
    </div>
  );
}
