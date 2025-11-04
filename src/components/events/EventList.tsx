'use client';

import * as React from 'react';
import { toast } from 'react-hot-toast';
import EventCard from './EventCard';
import Pagination from '@/src/components/ui/Pagination';
import Table, { createActionsColumn, type Column } from '@/src/components/ui/Table';
import Button from '@/src/components/ui/Button';
import EventStatusBadge from './EventStatusBadge';
import type { Event, EventStatus } from '@/src/lib/types';

interface EventListProps {
  events: Event[];
  viewMode?: 'grid' | 'table';
  isLoading?: boolean;
  showActions?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onManageTickets?: (id: string) => void;
  onChangeStatus?: (id: string, status: EventStatus) => Promise<void>;
  emptyMessage?: string;
}

export default function EventList({
  events,
  viewMode = 'grid',
  isLoading = false,
  showActions = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onEdit,
  onDelete,
  onManageTickets,
  onChangeStatus,
  emptyMessage = 'No hay eventos disponibles',
}: EventListProps) {
  const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);

  const handleStatusChange = async (id: string, status: EventStatus) => {
    if (!onChangeStatus) return;
    setIsSubmitting(`${id}-${status}`);
    try {
      await onChangeStatus(id, status);
      toast.success(`Estado del evento actualizado a ${status}`);
    } catch {
      // Error toast is likely handled by the store
    } finally {
      setIsSubmitting(null);
    }
  };

  // TABLE VIEW (FOR ADMIN DASHBOARD)
  if (viewMode === 'table') {
    const columns: Column<Event>[] = [
      {
        key: 'name',
        header: 'Evento',
        render: (event) => (
          <div>
            <p className="font-semibold text-slate-800">{event.name}</p>
            <p className="text-xs text-slate-500">{event.category?.name ?? 'Sin categoría'}</p>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Fecha',
        render: (event) =>
          new Date(event.date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
      {
        key: 'status',
        header: 'Estado',
        render: (event) => <EventStatusBadge status={event.status} />,
      },
      createActionsColumn<Event>((event) => (
        <div className="flex items-center justify-end gap-2">
          {/* Status Change Actions */}
          {event.status === 'inactive' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange(event.id, 'active')}
              disabled={isSubmitting === `${event.id}-active`}
            >
              {isSubmitting === `${event.id}-active` ? 'Activando...' : 'Activar'}
            </Button>
          )}
          {event.status === 'active' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange(event.id, 'inactive')}
              disabled={isSubmitting === `${event.id}-inactive`}
            >
              {isSubmitting === `${event.id}-inactive` ? 'Desactivando...' : 'Desactivar'}
            </Button>
          )}

          {/* Other Actions */}
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(event.id)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onManageTickets?.(event.id)}>
            Tickets
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(event.id)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Eliminar
          </Button>
        </div>
      )),
    ];

    return (
      <div className="space-y-6">
        <Table columns={columns} data={events} isLoading={isLoading} emptyMessage={emptyMessage} />
        {onPageChange && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  }

  // GRID VIEW (FOR PUBLIC PAGE)
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-80 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-300"
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
          <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Events grid
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageTickets={onManageTickets}
          />
        ))}
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
