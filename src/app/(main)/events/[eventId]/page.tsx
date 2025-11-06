'use client';

/**
 * Event Detail Page
 * Displays detailed information about a specific event and its ticket types
 */

import { EventStatus } from '@/src/lib/types';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventStore } from '@/src/stores/useEventStore';
import { useCartStore } from '@/src/stores/useCartStore';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { showToast } from '@/src/lib/toast';
import EventStatusBadge from '@/src/components/events/EventStatusBadge';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { currentEvent, ticketTypes, isLoading, error, fetchEventWithTicketTypes, clearError } =
    useEventStore();

  const { addItem } = useCartStore();
  const user = useAuthStore((s) => s.user);

  // Verificar si el usuario tiene el rol BUYER
  const hasBuyerRole = user?.roles?.some((role) => role.name === 'BUYER') ?? false;

  // Track quantities for each ticket type
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!eventId) return;

    // Fetch event and ticket types
    fetchEventWithTicketTypes(eventId).catch((err) => {
      showToast.error('Error al cargar el evento');
      console.error(err);
    });

    // Clean up
    return () => {
      clearError();
    };
  }, [eventId, fetchEventWithTicketTypes, clearError]);

  // Initialize quantities when ticket types load
  useEffect(() => {
    if (ticketTypes.length > 0) {
      const initialQuantities: Record<string, number> = {};
      ticketTypes.forEach((tt) => {
        initialQuantities[tt.id] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [ticketTypes]);

  const handleAddToCart = async (ticketTypeId: string) => {
    if (!eventId) return;

    const quantity = quantities[ticketTypeId] || 1;

    setAddingToCart((prev) => ({ ...prev, [ticketTypeId]: true }));

    try {
      await addItem({
        eventId,
        ticketTypeId,
        quantity,
      });

      showToast.success(`${quantity} ticket(s) agregado(s) al carrito`);
    } catch {
      showToast.error('Error al agregar al carrito');
    } finally {
      setAddingToCart((prev) => ({ ...prev, [ticketTypeId]: false }));
    }
  };

  const handleQuantityChange = (ticketTypeId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(1, newQuantity),
    }));
  };

  // Loading state
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

  // Error state
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
            onClick={() => router.push('/events')}
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Volver a eventos
          </button>
        </div>
      </div>
    );
  }

  const event = currentEvent;

  // Format date
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

  // Check if event allows purchases and user can buy
  const canPurchase =
    (event.status === EventStatus.ACTIVE || event.status === EventStatus.IN_PROGRESS) &&
    user &&
    hasBuyerRole;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/events')}
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
          Volver a eventos
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Event header */}
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

              {/* Description */}
              {event.description && <p className="mb-6 text-slate-700">{event.description}</p>}

              {/* Event details */}
              <div className="space-y-4 border-t pt-4">
                {/* Date and time */}
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

                {/* Venue */}
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
                    <p className="font-semibold text-slate-900">Ubicacion</p>
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
            </div>
          </div>

          {/* Sidebar - Ticket types */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Tipos de Tickets</h2>

              {ticketTypes.length === 0 ? (
                <div className="rounded-lg bg-white p-4 text-center">
                  <p className="text-sm text-slate-600">
                    No hay tipos de tickets disponibles para este evento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketTypes.map((ticketType) => (
                    <div
                      key={ticketType.id}
                      className="rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-400 hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900">{ticketType.name}</h3>
                        <span className="text-lg font-bold text-slate-900">
                          ${Number(ticketType.price).toFixed(2)}
                        </span>
                      </div>

                      {ticketType.description && (
                        <p className="mb-2 text-sm text-slate-600">{ticketType.description}</p>
                      )}

                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Disponibles:</span>
                        <span
                          className={`font-medium ${ticketType.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {ticketType.quantity > 0 ? `${ticketType.quantity} tickets` : 'Agotado'}
                        </span>
                      </div>

                      {ticketType.quantity > 0 ? (
                        <>
                          {canPurchase ? (
                            <div className="space-y-2">
                              {/* Quantity selector */}
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      ticketType.id,
                                      (quantities[ticketType.id] || 1) - 1
                                    )
                                  }
                                  disabled={(quantities[ticketType.id] || 1) <= 1}
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-medium">
                                  {quantities[ticketType.id] || 1}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      ticketType.id,
                                      (quantities[ticketType.id] || 1) + 1
                                    )
                                  }
                                  disabled={(quantities[ticketType.id] || 1) >= ticketType.quantity}
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>

                              {/* Add to cart button */}
                              <button
                                onClick={() => handleAddToCart(ticketType.id)}
                                disabled={addingToCart[ticketType.id]}
                                className="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {addingToCart[ticketType.id]
                                  ? 'Agregando...'
                                  : 'Agregar al carrito'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Mostrar botón según estado del usuario */}
                              <button
                                onClick={() => {
                                  if (!user) {
                                    router.push('/login');
                                  } else {
                                    showToast.error(
                                      'Solo usuarios con rol Comprador pueden agregar al carrito'
                                    );
                                  }
                                }}
                                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                              >
                                {!user ? 'Iniciar sesión para comprar' : 'Requiere rol Comprador'}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full cursor-not-allowed rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 opacity-60"
                        >
                          Agotado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
