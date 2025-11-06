'use client';

import * as React from 'react';
import { EventStatus } from '@/src/lib/types';
import type { EventCategory, Venue } from '@/src/lib/types';
import { cn } from '@/src/lib/utils';

export interface EventFilters {
  search?: string;
  status?: EventStatus | '';
  categoryId?: string;
  venueId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  categories: EventCategory[];
  venues: Venue[];
  showStatusFilter?: boolean;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: EventStatus.DRAFT, label: 'Borrador' },
  { value: EventStatus.PENDING_APPROVAL, label: 'Pendiente Aprobación' },
  { value: EventStatus.REJECTED, label: 'Rechazado' },
  { value: EventStatus.ACTIVE, label: 'Activo' },
  { value: EventStatus.IN_PROGRESS, label: 'En Curso' },
  { value: EventStatus.SUSPENDED, label: 'Suspendido' },
  { value: EventStatus.CANCELLED, label: 'Cancelado' },
  { value: EventStatus.FINISHED, label: 'Finalizado' },
];

export default function EventFilters({
  filters,
  onFiltersChange,
  categories,
  venues,
  showStatusFilter = true,
  isLoading = false,
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value as EventStatus | '' });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, categoryId: e.target.value });
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, venueId: e.target.value });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateFrom: e.target.value });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateTo: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      categoryId: '',
      venueId: '',
      dateFrom: '',
      dateTo: '',
    });
    setIsExpanded(false);
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.categoryId ||
    filters.venueId ||
    filters.dateFrom ||
    filters.dateTo;

  const activeFiltersCount = [
    filters.search,
    filters.status,
    filters.categoryId,
    filters.venueId,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header - Always visible */}
      <div className="flex items-center gap-4 p-4">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar eventos por título..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            disabled={isLoading}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        {/* Toggle advanced filters button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
            isExpanded
              ? 'border-slate-800 bg-slate-800 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          )}
          disabled={isLoading}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Filtros
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            disabled={isLoading}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Advanced filters - Collapsible */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status filter */}
            {showStatusFilter && (
              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  id="status"
                  value={filters.status || ''}
                  onChange={handleStatusChange}
                  disabled={isLoading}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category filter */}
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
                Categoría
              </label>
              <select
                id="category"
                value={filters.categoryId || ''}
                onChange={handleCategoryChange}
                disabled={isLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Venue filter */}
            <div>
              <label htmlFor="venue" className="mb-1 block text-sm font-medium text-slate-700">
                Recinto
              </label>
              <select
                id="venue"
                value={filters.venueId || ''}
                onChange={handleVenueChange}
                disabled={isLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Todos los recintos</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from filter */}
            <div>
              <label htmlFor="dateFrom" className="mb-1 block text-sm font-medium text-slate-700">
                Desde
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={handleDateFromChange}
                disabled={isLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {/* Date to filter */}
            <div>
              <label htmlFor="dateTo" className="mb-1 block text-sm font-medium text-slate-700">
                Hasta
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={handleDateToChange}
                disabled={isLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:ring-2 focus:ring-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Búsqueda: {filters.search}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, search: '' })}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                  Estado:{' '}
                  {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label || filters.status}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, status: '' })}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.categoryId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Categoría:{' '}
                  {categories.find((c) => c.id === filters.categoryId)?.name || 'Desconocida'}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, categoryId: '' })}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.venueId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                  Recinto: {venues.find((v) => v.id === filters.venueId)?.name || 'Desconocido'}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, venueId: '' })}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  Fecha:{' '}
                  {filters.dateFrom && new Date(filters.dateFrom).toLocaleDateString('es-ES')}
                  {filters.dateFrom && filters.dateTo && ' - '}
                  {filters.dateTo && new Date(filters.dateTo).toLocaleDateString('es-ES')}
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, dateFrom: '', dateTo: '' })}
                    className="ml-1 hover:text-yellow-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
