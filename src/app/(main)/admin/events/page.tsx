'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventList from '@/src/components/events/EventList';
import EventFilters, {
  type EventFilters as EventFiltersType,
} from '@/src/components/events/EventFilters';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import { useEventStore } from '@/src/stores/useEventStore';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { useCategoryStore } from '@/src/stores/useCategoryStore';
import { useVenueStore } from '@/src/stores/useVenueStore';
import useAuth from '@/src/hooks/useAuth';
import { ROUTES } from '@/src/lib/constants';
import type { Event, EventStatus } from '@/src/lib/types';

function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isLoading: boolean;
}) {
  const [comment, setComment] = React.useState('');

  const handleConfirm = () => {
    if (!comment.trim()) {
      toast.error('El comentario es obligatorio para rechazar el evento.');
      return;
    }
    onConfirm(comment);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Rechazar Evento</h2>
        <p className="mb-4 text-slate-600">
          Por favor, proporciona un motivo para rechazar este evento. Este comentario será visible
          para el organizador.
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="Ej: Faltan detalles en la descripción del evento..."
        ></textarea>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isAuthorized, isLoading: authLoading } = useRequireRole('ADMINISTRATOR');

  const {
    events,
    isLoading,
    totalPages,
    currentPage,
    fetchEvents,
    updateEventStatus,
    deleteEvent,
  } = useEventStore();

  const { categories, fetchCategories } = useCategoryStore();
  const { venues, fetchVenues } = useVenueStore();

  const [deleteEventId, setDeleteEventId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [rejectionEventId, setRejectionEventId] = React.useState<string | null>(null);
  const [isRejectionModalOpen, setRejectionModalOpen] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const [filters, setFilters] = React.useState<EventFiltersType>({
    search: '',
    status: '',
    categoryId: '',
    venueId: '',
    dateFrom: '',
    dateTo: '',
  });

  // Load categories and venues for filters
  React.useEffect(() => {
    fetchCategories().catch(() => {});
    fetchVenues().catch(() => {});
  }, [fetchCategories, fetchVenues]);

  // Fetch events when filters change
  React.useEffect(() => {
    if (isAuthenticated) {
      const params: Record<string, unknown> = {
        page: 1,
        limit: 10,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.venueId) params.venueId = filters.venueId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      fetchEvents(params).catch(() => {
        toast.error('Error al cargar eventos');
      });
    }
  }, [isAuthenticated, fetchEvents, filters]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      const params: Record<string, unknown> = {
        page,
        limit: 10,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.venueId) params.venueId = filters.venueId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      fetchEvents(params).catch(() => {
        toast.error('Error al cargar eventos');
      });
    },
    [fetchEvents, filters]
  );

  const handleEdit = (id: string) => {
    router.push(ROUTES.ADMIN_EVENT_EDIT(id));
  };

  const handleManageTickets = (id: string) => {
    router.push(ROUTES.ADMIN_EVENT_TICKETS(id));
  };

  const handleDelete = (id: string) => {
    setDeleteEventId(id);
  };

  const confirmDelete = async () => {
    if (!deleteEventId) return;

    try {
      setIsDeleting(true);
      await deleteEvent(deleteEventId);
      toast.success('Evento eliminado con éxito');
      setDeleteEventId(null);
    } catch {
      toast.error('Error al eliminar el evento');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeStatus = async (id: string, status: EventStatus) => {
    try {
      await updateEventStatus(id, status);
      toast.success('Estado del evento actualizado');
    } catch {
      toast.error('Error al cambiar el estado del evento');
      throw new Error('Failed to update status');
    }
  };

  const handleReject = (id: string) => {
    setRejectionEventId(id);
    setRejectionModalOpen(true);
  };

  const confirmRejection = async (comment: string) => {
    if (!rejectionEventId) return;

    try {
      setIsRejecting(true);
      await updateEventStatus(rejectionEventId, 'REJECTED' as EventStatus, comment);
      toast.success('Evento rechazado con éxito');
      setRejectionModalOpen(false);
      setRejectionEventId(null);
    } catch {
      toast.error('Error al rechazar el evento');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRowClick = (event: Event) => {
    router.push(ROUTES.ADMIN_EVENT_DETAIL(event.id));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Eventos</h1>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <EventFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          venues={venues}
          showStatusFilter={true}
          isLoading={isLoading}
        />
      </div>

      {/* Event list */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-slate-500">Cargando eventos...</p>
        </div>
      ) : (
        <EventList
          events={events}
          viewMode="table"
          showActions={true}
          showAdminActions={true}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageTickets={handleManageTickets}
          onChangeStatus={handleChangeStatus}
          onReject={handleReject}
          onRowClick={handleRowClick}
          emptyMessage="No se encontraron eventos con los filtros aplicados."
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteEventId}
        onClose={() => setDeleteEventId(null)}
        onConfirm={confirmDelete}
        title="Eliminar Evento"
        message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />

      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={confirmRejection}
        isLoading={isRejecting}
      />
    </div>
  );
}
