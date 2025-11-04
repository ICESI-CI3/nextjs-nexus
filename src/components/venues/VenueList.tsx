'use client';

import * as React from 'react';
import { toast } from 'react-hot-toast';
import { useVenueStore } from '@/src/stores/useVenueStore';
import type { Venue } from '@/src/lib/types';
import Table, { createActionsColumn, type Column } from '@/src/components/ui/Table';
import Button from '@/src/components/ui/Button';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import VenueModal from './VenueModal';

export default function VenueList() {
  // Store state and actions
  const { venues, isLoading, error: storeError, fetchVenues, deleteVenue } = useVenueStore();

  // Local UI state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<Venue | null>(null);

  // Fetch venues on component mount
  React.useEffect(() => {
    fetchVenues().catch(console.error);
  }, [fetchVenues]);

  // Show toast on store error
  React.useEffect(() => {
    if (storeError) {
      toast.error(storeError);
    }
  }, [storeError]);

  // Handlers
  const handleCreate = () => {
    setSelectedVenue(null);
    setIsModalOpen(true);
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  const handleDelete = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedVenue) {
      try {
        await deleteVenue(selectedVenue.id);
        toast.success('Recinto eliminado con éxito');
        setIsConfirmOpen(false);
        setSelectedVenue(null);
      } catch {
        setIsConfirmOpen(false);
      }
    }
  };

  // Define table columns
  const columns: Column<Venue>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (venue) => <span className="font-medium">{venue.name}</span>,
    },
    {
      key: 'address',
      header: 'Dirección',
      render: (venue) => <p className="text-sm text-slate-600">{venue.address}</p>,
    },
    {
      key: 'capacity',
      header: 'Capacidad',
      render: (venue) => (
        <p className="text-sm text-slate-600">{venue.capacity?.toLocaleString('es-ES') ?? 'N/A'}</p>
      ),
    },
    createActionsColumn<Venue>((venue) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(venue)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(venue)}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Eliminar
        </Button>
      </div>
    )),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Recintos</h1>
        <Button variant="primary" onClick={handleCreate}>
          Crear Recinto
        </Button>
      </div>

      <Table
        columns={columns}
        data={venues}
        isLoading={isLoading}
        emptyMessage="No se encontraron recintos. Comienza creando uno nuevo."
      />

      {/* Modal for Create/Edit */}
      <VenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venueToEdit={selectedVenue}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el recinto "${selectedVenue?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
}
