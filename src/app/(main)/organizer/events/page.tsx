'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventList from '@/src/components/events/EventList';
import EventFilters, {
  type EventFilters as EventFiltersType,
} from '@/src/components/events/EventFilters';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import Button from '@/src/components/ui/Button';
import { useEventStore } from '@/src/stores/useEventStore';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { useCategoryStore } from '@/src/stores/useCategoryStore';
import { useVenueStore } from '@/src/stores/useVenueStore';
import { Event, EventStatus } from '@/src/lib/types';
import SuspensionCancellationModal from '@/src/components/events/SuspensionCancellationModal';

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading, isAuthenticated } = useRequireRole('ORGANIZER');

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

  const [suspensionCancellationEventId, setSuspensionCancellationEventId] = React.useState<
    string | null
  >(null);
  const [isSuspensionCancellationModalOpen, setIsSuspensionCancellationModalOpen] =
    React.useState(false);
  const [suspensionCancellationStatusType, setSuspensionCancellationStatusType] = React.useState<
    'SUSPENDED' | 'CANCELLED' | null
  >(null);
  const [isProcessingStatusChange, setIsProcessingStatusChange] = React.useState(false);

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

  const handleCreate = () => {
    router.push('/organizer/events/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/organizer/events/${id}/edit`);
  };

  const handleManageTickets = (id: string) => {
    router.push(`/organizer/events/${id}/tickets`);
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
    if (status === EventStatus.SUSPENDED || status === EventStatus.CANCELLED) {
      setSuspensionCancellationEventId(id);
      setSuspensionCancellationStatusType(status);
      setIsSuspensionCancellationModalOpen(true);
      return;
    }

    try {
      await updateEventStatus(id, status);
      toast.success('Estado del evento actualizado');
    } catch {
      toast.error('Error al cambiar el estado del evento');
      throw new Error('Failed to update status');
    }
  };

  const confirmSuspensionCancellation = async (comment: string) => {
    if (!suspensionCancellationEventId || !suspensionCancellationStatusType) return;

    try {
      setIsProcessingStatusChange(true);
      await updateEventStatus(
        suspensionCancellationEventId,
        suspensionCancellationStatusType as EventStatus,
        comment
      );
      toast.success('Estado del evento actualizado');
      setIsSuspensionCancellationModalOpen(false);
      setSuspensionCancellationEventId(null);
      setSuspensionCancellationStatusType(null);
    } catch {
      toast.error('Error al cambiar el estado del evento');
    } finally {
      setIsProcessingStatusChange(false);
    }
  };

  const handleRowClick = (event: Event) => {
    router.push(`/organizer/events/${event.id}`);
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
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Eventos</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona tus eventos, configura tickets y monitorea ventas
          </p>
        </div>
        <Button onClick={handleCreate}>Crear Evento</Button>
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
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageTickets={handleManageTickets}
          onChangeStatus={handleChangeStatus}
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

      <SuspensionCancellationModal
        isOpen={isSuspensionCancellationModalOpen}
        onClose={() => setIsSuspensionCancellationModalOpen(false)}
        onConfirm={confirmSuspensionCancellation}
        isLoading={isProcessingStatusChange}
        statusType={suspensionCancellationStatusType!}
      />
    </div>
  );
}
