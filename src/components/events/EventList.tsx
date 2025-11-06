'use client';

import * as React from 'react';
import { toast } from 'react-hot-toast';
import EventCard from './EventCard';
import Pagination from '@/src/components/ui/Pagination';
import Table, { createActionsColumn, type Column } from '@/src/components/ui/Table';
import Button from '@/src/components/ui/Button';
import EventStatusBadge from './EventStatusBadge';
import { type Event, EventStatus } from '@/src/lib/types';

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
  onRowClick?: (event: Event) => void;
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
  onRowClick,
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
        key: 'title',
        header: 'Evento',
        render: (event) => <p className="font-semibold text-slate-800">{event.title}</p>,
      },
      {
        key: 'category',
        header: 'Categoría',
        render: (event) => event.category?.name ?? 'Sin categoría',
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
          {event.status === EventStatus.DRAFT && (
            <Button
              size="sm"
              onClick={() => handleStatusChange(event.id, EventStatus.ACTIVE)}
              disabled={isSubmitting === `${event.id}-${EventStatus.ACTIVE}`}
            >
              {isSubmitting === `${event.id}-${EventStatus.ACTIVE}` ? 'Activando...' : 'Activar'}
            </Button>
          )}
          {event.status === EventStatus.ACTIVE && (
            <Button
              size="sm"
              onClick={() => handleStatusChange(event.id, EventStatus.DRAFT)}
              disabled={isSubmitting === `${event.id}-${EventStatus.DRAFT}`}
            >
              {isSubmitting === `${event.id}-${EventStatus.DRAFT}`
                ? 'Desactivando...'
                : 'Desactivar'}
            </Button>
          )}

          {/* Other Actions */}
        </div>
      )),
    ];

    return (
      <div className="space-y-6">
        <Table
          columns={columns}
          data={events}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
        />
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
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-slate-400"
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
          <h3 className="mt-4 text-xl font-semibold text-slate-900">No hay eventos disponibles</h3>
          <p className="mt-2 text-sm text-slate-600">{emptyMessage}</p>
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
