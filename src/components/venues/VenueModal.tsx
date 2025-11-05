'use client';

import * as React from 'react';
import { toast } from 'react-hot-toast';
import { useVenueStore } from '@/src/stores/useVenueStore';
import type { Venue, CreateVenueDTO } from '@/src/lib/types';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueToEdit?: Venue | null;
}

export default function VenueModal({ isOpen, onClose, venueToEdit }: VenueModalProps) {
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [capacity, setCapacity] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const { createVenue, updateVenue, isLoading } = useVenueStore();

  const isEditMode = Boolean(venueToEdit);

  React.useEffect(() => {
    if (isOpen) {
      if (isEditMode && venueToEdit) {
        setName(venueToEdit.name);
        setAddress(venueToEdit.address);
        setCity(venueToEdit.city);
        setCapacity(String(venueToEdit.maxCapacity));
      } else {
        setName('');
        setAddress('');
        setCity('');
        setCapacity('');
      }
      setError(null);
    }
  }, [isOpen, venueToEdit, isEditMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !address.trim() || !city.trim() || !capacity.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setError('La capacidad debe ser un número positivo.');
      return;
    }

    const venueData: CreateVenueDTO = {
      name,
      address,
      city,
      maxCapacity: parsedCapacity,
    };

    try {
      if (isEditMode && venueToEdit) {
        await updateVenue(venueToEdit.id, venueData);
        toast.success('Recinto actualizado con éxito');
      } else {
        await createVenue(venueData);
        toast.success('Recinto creado con éxito');
      }
      onClose();
    } catch (err: unknown) {
      let errorMessage = isEditMode
        ? 'Error al actualizar el recinto'
        : 'Error al crear el recinto';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Recinto' : 'Crear Nuevo Recinto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}

        <div>
          <label htmlFor="venue-name" className="block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="venue-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="venue-address" className="block text-sm font-medium text-slate-700">
            Dirección
          </label>
          <input
            id="venue-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="venue-city" className="block text-sm font-medium text-slate-700">
            Ciudad
          </label>
          <input
            id="venue-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="venue-capacity" className="block text-sm font-medium text-slate-700">
            Capacidad
          </label>
          <input
            id="venue-capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            required
            min="1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Recinto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
