'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import type { EventStatus } from '@/src/lib/types';

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  active: {
    label: 'Activo',
    className: 'bg-green-100 text-green-800',
  },
  inactive: {
    label: 'Inactivo',
    className: 'bg-slate-100 text-slate-600',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800',
  },
  draft: {
    label: 'Borrador',
    className: 'bg-yellow-100 text-yellow-800',
  },
  pre_sale: {
    label: 'Pre-venta',
    className: 'bg-blue-100 text-blue-800',
  },
};

const UNKNOWN_STATUS_CONFIG = {
  label: 'Desconocido',
  className: 'bg-gray-100 text-gray-800',
};

export default function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  // Normalize status to handle potential casing issues from the API
  const normalizedStatus = (status?.toLowerCase() ?? '') as EventStatus;
  const config = STATUS_CONFIG[normalizedStatus] ?? UNKNOWN_STATUS_CONFIG;

  // Use the original status for the label if it was unknown, but formatted
  const label = STATUS_CONFIG[normalizedStatus]
    ? config.label
    : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {label}
    </span>
  );
}
