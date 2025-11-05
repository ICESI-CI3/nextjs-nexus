'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EventList from '@/src/components/events/EventList';
import Button from '@/src/components/ui/Button';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import { useEventStore } from '@/src/stores/useEventStore';
import useRequireAuth from '@/src/hooks/useRequireAuth';
import { ROUTES } from '@/src/lib/constants';
import type { EventStatus } from '@/src/lib/types';

export default function AdminEventsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const {
    events,
    isLoading,
    totalPages,
    currentPage,
    fetchEvents,
    updateEventStatus,
    deleteEvent,
  } = useEventStore();

  const [deleteEventId, setDeleteEventId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchEvents({ page: 1, limit: 10 }).catch(() => {
        toast.error('Error al cargar eventos');
      });
    }
  }, [isAuthenticated, fetchEvents]);

  const handlePageChange = (page: number) => {
    fetchEvents({ page, limit: 10 }).catch(() => {
      toast.error('Error al cargar eventos');
    });
  };

  const handleCreate = () => {
    router.push(ROUTES.ADMIN_EVENT_CREATE);
  };

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
    } catch {
      toast.error('Error al cambiar el estado del evento');
      throw new Error('Failed to update status');
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Mis Eventos</h1>
        <Button onClick={handleCreate}>Crear Evento</Button>
      </div>

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
        emptyMessage="No tienes eventos creados. Comienza creando uno nuevo."
      />

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
    </div>
  );
}
