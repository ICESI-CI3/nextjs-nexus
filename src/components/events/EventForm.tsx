'use client';

import * as React from 'react';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';
import { cn, formatZodErrors } from '@/src/lib/utils';
import { useCategoryStore } from '@/src/stores/useCategoryStore';
import { useVenueStore } from '@/src/stores/useVenueStore';
import type { Event, CreateEventDTO } from '@/src/lib/types';

const eventSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  date: z.string().min(1, 'La fecha es requerida'),
  venueId: z.string().min(1, 'Debes seleccionar un recinto'),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
});

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: CreateEventDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EventForm({ initialData, onSubmit, onCancel, isLoading }: EventFormProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const { venues, fetchVenues } = useVenueStore();

  const getDateValue = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      return isoDate.split('T')[0];
    } catch {
      return '';
    }
  };

  const [values, setValues] = React.useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    date: getDateValue(initialData?.date),
    venueId: initialData?.venue?.id || '',
    categoryId: initialData?.category?.id || '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState('');

  React.useEffect(() => {
    fetchCategories().catch(() => {});
    fetchVenues().catch(() => {});
  }, [fetchCategories, fetchVenues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    const parse = eventSchema.safeParse(values);
    if (!parse.success) {
      setErrors(formatZodErrors(parse.error));
      return;
    }

    // Convert date to full ISO string before submitting
    const dataToSend = {
      ...parse.data,
      date: `${parse.data.date}T00:00:00.000Z`,
    };

    try {
      await onSubmit(dataToSend);
    } catch {
      setGeneralError('Error al guardar el evento. Intenta nuevamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormError message={generalError} />

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nombre del evento
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none',
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
          )}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={handleChange}
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none',
            errors.description
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
          )}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-slate-700">
          Fecha
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none',
            errors.date
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
          )}
        />
        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
      </div>

      {/* Venue */}
      <div>
        <label htmlFor="venueId" className="block text-sm font-medium text-slate-700">
          Recinto
        </label>
        <select
          id="venueId"
          name="venueId"
          value={values.venueId}
          onChange={handleChange}
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none',
            errors.venueId
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
          )}
        >
          <option value="">Selecciona un recinto</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name} - Capacidad: {venue.capacity}
            </option>
          ))}
        </select>
        {errors.venueId && <p className="mt-1 text-xs text-red-600">{errors.venueId}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          className={cn(
            'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none',
            errors.categoryId
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
          )}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Evento'}
        </Button>
      </div>
    </form>
  );
}
