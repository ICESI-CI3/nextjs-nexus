'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { EventStatus } from '@/src/lib/types';

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  [EventStatus.ACTIVE]: {
    label: 'Activo',
    className: 'bg-green-200 text-green-800',
  },
  [EventStatus.CANCELLED]: {
    label: 'Cancelado',
    className: 'bg-red-200 text-red-800',
  },
  [EventStatus.DRAFT]: {
    label: 'Borrador',
    className: 'bg-yellow-200 text-yellow-800',
  },
  [EventStatus.PRE_SALE]: {
    label: 'Pre-venta',
    className: 'bg-purple-100 text-purple-800',
  },
  [EventStatus.SUSPENDED]: {
    label: 'Suspendido',
    className: 'bg-orange-200 text-orange-800',
  },
  [EventStatus.FINISHED]: {
    label: 'Finalizado',
    className: 'bg-slate-200 text-slate-800',
  },
};

const UNKNOWN_STATUS_CONFIG = {
  label: 'Desconocido',
  className: 'bg-slate-200 text-slate-800',
};

export default function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  // Normalize status to handle potential casing issues from the API
  const normalizedStatus = (status?.toUpperCase() ?? '') as EventStatus;
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
