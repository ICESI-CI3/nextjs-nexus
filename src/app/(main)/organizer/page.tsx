'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/src/stores/useEventStore';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { ROUTES } from '@/src/lib/constants';
import { EventStatus } from '@/src/lib/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
                <span className="text-xs text-slate-500">vs. mes anterior</span>
              </div>
            )}
          </div>
          <div className={`rounded-lg ${colors[color]} p-3 text-white`}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'blue' | 'green' | 'purple';
}

function QuickAction({ title, description, icon, onClick, color }: QuickActionProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className={`rounded-lg p-3 ${colors[color]}`}>{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <svg
        className="h-5 w-5 flex-shrink-0 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useRequireRole('ORGANIZER');
  const { events, fetchEvents } = useEventStore();

  React.useEffect(() => {
    // Fetch only organizer's own events
    if (isAuthorized) {
      fetchEvents({ page: 1, limit: 100 }).catch(() => {});
    }
  }, [isAuthorized, fetchEvents]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Calculate statistics for organizer's events
  const draftEvents = events.filter((e) => e.status === EventStatus.DRAFT).length;
  const pendingEvents = events.filter((e) => e.status === EventStatus.PENDING_APPROVAL).length;
  const activeEvents = events.filter((e) => e.status === EventStatus.ACTIVE).length;
  const rejectedEvents = events.filter((e) => e.status === EventStatus.REJECTED).length;
  const totalEvents = events.length;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Panel del Organizador</h2>
        <p className="mt-1 text-slate-600">
          Gestiona tus eventos, tipos de tickets y monitorea el rendimiento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Eventos"
          value={totalEvents}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          color="blue"
        />

        <StatCard
          title="Eventos Activos"
          value={activeEvents}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
        />

        <StatCard
          title="Pendientes Aprobación"
          value={pendingEvents}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="yellow"
        />

        <StatCard
          title="Borradores"
          value={draftEvents}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Alert for rejected events */}
      {rejectedEvents > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-red-600"
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
              <h3 className="font-semibold text-red-900">
                Tienes {rejectedEvents} evento{rejectedEvents > 1 ? 's' : ''} rechazado
                {rejectedEvents > 1 ? 's' : ''}
              </h3>
              <p className="mt-1 text-sm text-red-800">
                Revisa los comentarios del administrador y realiza los cambios necesarios para
                volver a enviar tu evento.
              </p>
              <button
                onClick={() => router.push(ROUTES.ORGANIZER_EVENTS)}
                className="mt-3 text-sm font-medium text-red-900 underline hover:text-red-700"
              >
                Ver eventos rechazados →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Acciones Rápidas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Crear Nuevo Evento"
            description="Configura un nuevo evento desde cero"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
            onClick={() => router.push('/organizer/events/create')}
            color="green"
          />

          <QuickAction
            title="Gestionar Eventos"
            description="Ver y editar todos tus eventos"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            onClick={() => router.push('/organizer/events')}
            color="blue"
          />

          <QuickAction
            title="Ver Categorías"
            description="Gestiona las categorías de tus eventos"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            }
            onClick={() => router.push('/organizer/categories')}
            color="purple"
          />
          <QuickAction
            title="Ver Recintos"
            description="Gestiona los recintos disponibles para tus eventos"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            onClick={() => router.push('/organizer/venues')}
            color="blue"
          />
        </div>
      </div>

      {/* Event Status Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Estado de Eventos</h3>
          <button
            onClick={() => router.push(ROUTES.ORGANIZER_EVENTS)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Ver todos
          </button>
        </div>

        {totalEvents === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="mb-4 h-16 w-16 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mb-4 text-sm text-slate-500">
              Aún no has creado ningún evento. ¡Comienza ahora!
            </p>
            <button
              onClick={() => router.push(ROUTES.ADMIN_EVENT_CREATE)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Crear mi primer evento
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{draftEvents}</p>
                  <p className="text-sm text-slate-600">Borradores</p>
                </div>
                <div className="rounded-full bg-purple-100 p-2">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{pendingEvents}</p>
                  <p className="text-sm text-slate-600">Pendientes</p>
                </div>
                <div className="rounded-full bg-yellow-100 p-2">
                  <svg
                    className="h-5 w-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{activeEvents}</p>
                  <p className="text-sm text-slate-600">Activos</p>
                </div>
                <div className="rounded-full bg-green-100 p-2">
                  <svg
                    className="h-5 w-5 text-green-600"
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
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{rejectedEvents}</p>
                  <p className="text-sm text-slate-600">Rechazados</p>
                </div>
                <div className="rounded-full bg-red-100 p-2">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Guide */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Flujo de Trabajo</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              1
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Crear Evento</h4>
              <p className="text-sm text-slate-600">
                Configura tu evento con título, descripción, fecha, categoría y recinto. El evento
                se crea en estado BORRADOR.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              2
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Configurar Tickets</h4>
              <p className="text-sm text-slate-600">
                Define los tipos de entrada (VIP, General, etc.) con sus precios y cantidades
                disponibles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              3
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Solicitar Aprobación</h4>
              <p className="text-sm text-slate-600">
                Una vez completo, cambia el estado a PENDIENTE_APROBACIÓN. Un administrador revisará
                tu evento.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              4
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Evento Aprobado</h4>
              <p className="text-sm text-slate-600">
                Si es aprobado, tu evento se vuelve ACTIVO y visible para los compradores. ¡Las
                ventas comienzan!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              5
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Validar Tickets</h4>
              <p className="text-sm text-slate-600">
                El día del evento, usa el escáner de tickets para validar la entrada de los
                asistentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
