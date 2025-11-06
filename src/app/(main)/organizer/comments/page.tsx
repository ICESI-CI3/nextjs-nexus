'use client';

import * as React from 'react';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { EventStatus, type Event } from '@/src/lib/types';
import { showToast } from '@/src/lib/toast';
import { getAllEvents } from '@/src/services/eventService';

export default function OrganizerCommentsPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireRole('ORGANIZER');
  const [relevantEvents, setRelevantEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isAuthorized) {
      const fetchRelevantEvents = async () => {
        setIsLoading(true);
        try {
          const statusesToFetch = [
            EventStatus.REJECTED,
            EventStatus.SUSPENDED,
            EventStatus.CANCELLED,
          ];

          const promises = statusesToFetch.map((status) =>
            getAllEvents({ page: 1, limit: 1000, status })
          );

          const results = await Promise.all(promises);

          const allEvents = results.flatMap((result) => {
            if (Array.isArray(result)) {
              return result; // It's already an array of events
            }
            if (result && result.data) {
              return result.data; // It's a PaginatedResponse
            }
            return []; // It's something else, return empty array
          });

          // Remove duplicates
          const uniqueEvents = Array.from(new Map(allEvents.map((e) => [e.id, e])).values());

          setRelevantEvents(uniqueEvents);
        } catch (error) {
          showToast.error('Error al cargar los comentarios de eventos.');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRelevantEvents();
    }
  }, [isAuthorized]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando comentarios...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-800">Historial de Comentarios de Eventos</h1>
      <p className="mt-1 text-sm text-slate-600">
        Revisa los comentarios de eventos rechazados, suspendidos o cancelados.
      </p>

      <div className="mt-8 space-y-6">
        {relevantEvents.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-slate-600">
              No hay comentarios de eventos rechazados, suspendidos o cancelados.
            </p>
          </div>
        ) : (
          relevantEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Estado: <span className="font-medium">{event.status}</span>
              </p>
              {event.statusLogs && event.statusLogs.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {event.statusLogs.map((log, index) => (
                    <p key={index} className="text-sm text-slate-700">
                      - {log}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  No hay comentarios específicos para este estado.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
