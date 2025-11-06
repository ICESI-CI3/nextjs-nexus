'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import TicketTypeManager from '@/src/components/events/TicketTypeManager';
import Button from '@/src/components/ui/Button';
import { useEventStore } from '@/src/stores/useEventStore';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import { EventStatus } from '@/src/lib/types';

export default function OrganizerManageTicketsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const { currentEvent, ticketTypes, isLoading, fetchEventWithTicketTypes, updateEventStatus } =
    useEventStore();

  const [isRequestingApproval, setIsRequestingApproval] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && eventId) {
      // If the event in the store is not the one we need, fetch it.
      if (currentEvent?.id !== eventId) {
        fetchEventWithTicketTypes(eventId).catch(() => {
          toast.error('Error al cargar el evento y los tickets');
          router.push('/organizer/events');
        });
      }
    }
  }, [isAuthenticated, eventId, fetchEventWithTicketTypes, router, currentEvent]);

  const handleGoBack = () => {
    router.push('/organizer/events');
  };

  const handleRequestApproval = async () => {
    if (!currentEvent) return;

    // Validar que tenga al menos un tipo de ticket
    if (ticketTypes.length === 0) {
      toast.error('Debes agregar al menos un tipo de ticket antes de solicitar aprobación');
      return;
    }

    try {
      setIsRequestingApproval(true);
      await updateEventStatus(eventId, EventStatus.PENDING_APPROVAL);
      toast.success('Solicitud de aprobación enviada con éxito');
      router.push('/organizer/events');
    } catch {
      toast.error('Error al solicitar aprobación');
    } finally {
      setIsRequestingApproval(false);
    }
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

  const canModifyTickets =
    currentEvent.status === EventStatus.DRAFT || currentEvent.status === EventStatus.REJECTED;

  const canRequestApproval = currentEvent.status === EventStatus.DRAFT && ticketTypes.length > 0;

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

      {/* Estado del evento */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Estado del evento</p>
            <p className="text-xs text-slate-600">
              {currentEvent.status === EventStatus.DRAFT &&
                'El evento está en borrador. Configura los tickets y solicita aprobación.'}
              {currentEvent.status === EventStatus.PENDING_APPROVAL &&
                'Solicitud de aprobación enviada. Esperando revisión del administrador.'}
              {currentEvent.status === EventStatus.REJECTED &&
                'Evento rechazado. Revisa los comentarios y vuelve a solicitar aprobación.'}
              {currentEvent.status === EventStatus.ACTIVE &&
                'Evento activo. Las ventas están habilitadas.'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              currentEvent.status === EventStatus.DRAFT
                ? 'bg-yellow-100 text-yellow-800'
                : currentEvent.status === EventStatus.PENDING_APPROVAL
                  ? 'bg-blue-100 text-blue-800'
                  : currentEvent.status === EventStatus.REJECTED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
            }`}
          >
            {currentEvent.status}
          </span>
        </div>
      </div>

      {!canModifyTickets && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-yellow-600"
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
            <div className="text-sm text-yellow-800">
              <p className="font-medium">No se pueden modificar los tickets</p>
              <p className="mt-1">
                Los tipos de ticket solo pueden modificarse cuando el evento está en estado BORRADOR
                o RECHAZADO.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <TicketTypeManager eventId={eventId} tickets={ticketTypes} />
      </div>

      {/* Botón de solicitar aprobación */}
      {canRequestApproval && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <svg
              className="h-6 w-6 flex-shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">¿Listo para publicar?</h3>
              <p className="mt-1 text-sm text-blue-800">
                Has configurado {ticketTypes.length} tipo{ticketTypes.length > 1 ? 's' : ''} de
                ticket. Solicita la aprobación del administrador para hacer público tu evento.
              </p>
              <Button
                onClick={handleRequestApproval}
                disabled={isRequestingApproval}
                className="mt-4"
              >
                {isRequestingApproval ? 'Solicitando...' : 'Solicitar Aprobación'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {ticketTypes.length === 0 && canModifyTickets && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-slate-400"
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
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">Agrega tipos de tickets</p>
              <p className="mt-1">
                Define al menos un tipo de ticket (ej: VIP, General) con su precio y cantidad
                disponible antes de solicitar aprobación.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
