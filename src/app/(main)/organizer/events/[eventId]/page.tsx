'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventStore } from '@/src/stores/useEventStore';
import { showToast } from '@/src/lib/toast';
import EventStatusBadge from '@/src/components/events/EventStatusBadge';
import Button from '@/src/components/ui/Button';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import { EventStatus } from '@/src/lib/types';
import SuspensionCancellationModal from '@/src/components/events/SuspensionCancellationModal';

export default function OrganizerEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const {
    currentEvent,
    ticketTypes,
    isLoading,
    error,
    fetchEventWithTicketTypes,
    updateEventStatus,
    clearError,
  } = useEventStore();

  const [statusAction, setStatusAction] = useState<{
    action: 'suspend' | 'cancel' | null;
    newStatus: EventStatus | null;
  }>({ action: null, newStatus: null });
  const [isChangingStatus, setIsChangingStatus] = useState(false);

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

  const handleSuspend = () => {
    setStatusAction({ action: 'suspend', newStatus: EventStatus.SUSPENDED });
  };

  const handleCancel = () => {
    setStatusAction({ action: 'cancel', newStatus: EventStatus.CANCELLED });
  };

  const confirmStatusChange = async (comment: string) => {
    if (!statusAction.newStatus) return;

    try {
      setIsChangingStatus(true);
      await updateEventStatus(eventId, statusAction.newStatus, comment);
      showToast.success(
        statusAction.action === 'suspend'
          ? 'Evento suspendido exitosamente'
          : 'Evento cancelado exitosamente'
      );
      setStatusAction({ action: null, newStatus: null });
      // Refrescar datos
      await fetchEventWithTicketTypes(eventId);
    } catch {
      showToast.error('Error al cambiar el estado del evento');
    } finally {
      setIsChangingStatus(false);
    }
  };

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
            onClick={() => router.push('/organizer/events')}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
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

  // Verificar qué acciones están disponibles
  const canSuspend = event.status === EventStatus.ACTIVE;
  const canCancel =
    event.status === EventStatus.ACTIVE ||
    event.status === EventStatus.SUSPENDED ||
    event.status === EventStatus.DRAFT;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/organizer/events')}
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
          Volver a mis eventos
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <EventStatusBadge status={event.status} />
                  <h1 className="mt-3 mb-2 text-3xl font-bold text-slate-900">{event.title}</h1>
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
                    <p className="font-semibold text-slate-900">Ubicación</p>
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

              {/* Acciones del organizador */}
              <div className="mt-6 flex gap-3 border-t pt-6">
                <Button
                  onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
                  variant="secondary"
                  disabled={
                    event.status !== EventStatus.DRAFT && event.status !== EventStatus.REJECTED
                  }
                >
                  Editar Evento
                </Button>
                <Button
                  onClick={() => router.push(`/organizer/events/${eventId}/tickets`)}
                  variant="secondary"
                >
                  Gestionar Tickets
                </Button>
                {canSuspend && (
                  <Button onClick={handleSuspend} variant="secondary" className="text-orange-600">
                    Suspender Ventas
                  </Button>
                )}
                {canCancel && (
                  <Button onClick={handleCancel} variant="danger">
                    Cancelar Evento
                  </Button>
                )}
              </div>
            </div>

            {event.statusLogs && event.statusLogs.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-slate-900">Historial de Estado</h2>
                <ul className="space-y-2">
                  {event.statusLogs.map((log, index) => (
                    <li key={index} className="text-sm text-slate-600">
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Tipos de Tickets</h2>

              {ticketTypes.length === 0 ? (
                <div className="rounded-lg bg-white p-4 text-center">
                  <p className="text-sm text-slate-600">
                    No hay tipos de tickets configurados para este evento.
                  </p>
                  <Button
                    onClick={() => router.push(`/organizer/events/${eventId}/tickets`)}
                    className="mt-3"
                    size="sm"
                  >
                    Configurar Tickets
                  </Button>
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

      {/* Suspension/Cancellation Modal */}
      {statusAction.action && statusAction.newStatus && (
        <SuspensionCancellationModal
          isOpen={!!statusAction.action}
          onClose={() => setStatusAction({ action: null, newStatus: null })}
          onConfirm={confirmStatusChange}
          isLoading={isChangingStatus}
          statusType={statusAction.newStatus as 'SUSPENDED' | 'CANCELLED'}
        />
      )}

      {/* Original ConfirmDialog for other actions (if any) */}
      <ConfirmDialog
        isOpen={false} // Always false, as we are using SuspensionCancellationModal for suspend/cancel
        onClose={() => {}}
        onConfirm={() => {}}
        title=""
        message=""
        confirmText=""
        variant="info"
        isLoading={false}
      />
    </div>
  );
}
