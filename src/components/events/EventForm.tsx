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
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  date: z.string().min(1, 'La fecha y hora son requeridas'),
  venueId: z.string().uuid('Debes seleccionar un recinto válido'),
  categoryId: z.string().uuid('Debes seleccionar una categoría válida'),
});

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: CreateEventDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EventForm({ initialData, onSubmit, onCancel, isLoading }: EventFormProps) {
  const {
    categories,
    fetchCategories,
    error: categoryError,
    isLoading: categoriesLoading,
  } = useCategoryStore();
  const { venues, fetchVenues, error: venueError, isLoading: venuesLoading } = useVenueStore();

  const getDateValue = (date?: string | Date) => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      // Format to YYYY-MM-DDTHH:mm, required by datetime-local input
      return dateObj.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [values, setValues] = React.useState({
    title: initialData?.title || '',
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

    // Convert local datetime string to a Date object
    const localDate = new Date(parse.data.date).toISOString();
    const dataToSend = {
      ...parse.data,
      date: localDate,
    };

    try {
      await onSubmit(dataToSend);
    } catch {
      setGeneralError('Error al guardar el evento. Intenta nuevamente.');
    }
  };

  const dataLoading = categoriesLoading || venuesLoading;
  const dataError = categoryError || venueError;

  if (dataError) {
    return (
      <FormError
        message={`No se pudieron cargar los datos necesarios para el formulario (recintos o categorías). Error: ${dataError}`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormError message={generalError} />

      <fieldset disabled={dataLoading || isLoading} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Título del evento
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={values.title}
            onChange={handleChange}
            className={cn(
              'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
              errors.title
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600',
              'disabled:cursor-not-allowed disabled:bg-slate-100'
            )}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
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
              'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
              errors.description
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600',
              'disabled:cursor-not-allowed disabled:bg-slate-100'
            )}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">
            Fecha y Hora
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            value={values.date}
            onChange={handleChange}
            className={cn(
              'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
              errors.date
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600',
              'disabled:cursor-not-allowed disabled:bg-slate-100'
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
              'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
              errors.venueId
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600',
              'disabled:cursor-not-allowed disabled:bg-slate-100'
            )}
          >
            <option value="">
              {dataLoading ? 'Cargando recintos...' : 'Selecciona un recinto'}
            </option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name} - Capacidad: {venue.maxCapacity}
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
              'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
              errors.categoryId
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600',
              'disabled:cursor-not-allowed disabled:bg-slate-100'
            )}
          >
            <option value="">
              {dataLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={isLoading || dataLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={isLoading || dataLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Evento'}
        </Button>
      </div>
    </form>
  );
}
