/**
 * Table Component
 */

'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  className?: string;
  onRowClick?: (item: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  onSort,
  sortKey,
  sortOrder,
  className,
  onRowClick,
}: TableProps<T>) {
  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('overflow-x-auto rounded-lg border border-slate-200', className)}>
        <table className="w-full">
          <TableHeader columns={columns} />
          <tbody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="border-t border-slate-200">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={cn('overflow-x-auto rounded-lg border border-slate-200', className)}>
        <table className="w-full">
          <TableHeader columns={columns} />
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-12 w-12 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm text-slate-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Table with data
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-slate-200', className)}>
      <table className="w-full">
        <TableHeader
          columns={columns}
          onSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
        />
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(item)}
              className={cn('transition-colors hover:bg-slate-50', onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-6 py-4 text-sm text-slate-900', col.className)}>
                  {col.render ? col.render(item) : String(item[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableHeaderProps<T> {
  columns: Column<T>[];
  onSort?: (key: string, sortable?: boolean) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
}

function TableHeader<T>({ columns, onSort, sortKey, sortOrder }: TableHeaderProps<T>) {
  return (
    <thead className="bg-slate-50">
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className={cn(
              'px-6 py-3 text-center text-xs font-medium tracking-wider text-slate-700 uppercase',
              col.sortable && onSort && 'cursor-pointer select-none hover:bg-slate-100',
              col.headerClassName
            )}
            onClick={() => onSort?.(col.key, col.sortable)}
          >
            <div className="flex items-center gap-2">
              <span>{col.header}</span>
              {col.sortable && onSort && (
                <SortIcon active={sortKey === col.key} order={sortOrder} />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

interface SortIconProps {
  active?: boolean;
  order?: 'asc' | 'desc';
}

function SortIcon({ active, order }: SortIconProps) {
  if (!active) {
    return (
      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  if (order === 'asc') {
    return (
      <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
        />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
      />
    </svg>
  );
}

/**
 * Helper to create action buttons column
 */
export function createActionsColumn<T>(actions: (item: T) => React.ReactNode): Column<T> {
  return {
    key: 'actions',
    header: 'Acciones',
    render: actions,
    className: 'text-right',
    headerClassName: 'text-center',
  };
}

/**
 * Helper to create status badge column
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStatusColumn<T extends Record<string, any>>(
  key: string,
  statusMap: Record<string, { label: string; color: string }>
): Column<T> {
  return {
    key,
    header: 'Estado',
    render: (item) => {
      const status = String(item[key]);
      const config = statusMap[status] || { label: status, color: 'gray' };

      const colorClasses: Record<string, string> = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
      };

      return (
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
            colorClasses[config.color]
          )}
        >
          {config.label}
        </span>
      );
    },
  };
}

/**
 * Helper to create date column with formatting
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDateColumn<T extends Record<string, any>>(
  key: string,
  header: string,
  format: 'short' | 'long' = 'short'
): Column<T> {
  return {
    key,
    header,
    render: (item) => {
      const date = item[key];
      if (!date) return '-';

      const d = new Date(String(date));
      if (isNaN(d.getTime())) return '-';

      const options: Intl.DateTimeFormatOptions =
        format === 'long'
          ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
          : { year: 'numeric', month: 'short', day: 'numeric' };

      return d.toLocaleDateString('es-ES', options);
    },
  };
}

/**
 * Helper to create currency column
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCurrencyColumn<T extends Record<string, any>>(
  key: string,
  header: string,
  currency: string = 'COP'
): Column<T> {
  return {
    key,
    header,
    render: (item) => {
      const amount = Number(item[key]);
      if (isNaN(amount)) return '-';

      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency,
      }).format(amount);
    },
  };
}
