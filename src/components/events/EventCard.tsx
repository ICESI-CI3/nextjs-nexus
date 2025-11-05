'use client';

import Link from 'next/link';
import { formatDate, formatCurrency } from '@/src/lib/utils';
import EventStatusBadge from './EventStatusBadge';
import Button from '@/src/components/ui/Button';
import type { Event } from '@/src/lib/types';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onManageTickets?: (id: string) => void;
}

export default function EventCard({
  event,
  showActions = false,
  onEdit,
  onDelete,
  onManageTickets,
}: EventCardProps) {
  // Safely handle potentially missing nested data
  const ticketTypes = event.ticketTypes ?? [];
  const minPrice = ticketTypes.length ? Math.min(...ticketTypes.map((t) => Number(t.price))) : 0;
  const venueName = event.venue?.name ?? 'Lugar por confirmar';
  const categoryName = event.category?.name ?? 'Sin categoria';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Event Info */}
      <Link href={`/events/${event.id}`} className="block p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-900">
            {event.title}
          </h3>
          <EventStatusBadge status={event.status} />
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-slate-600">{event.description}</p>

        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{venueName}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span>{categoryName}</span>
          </div>

          {minPrice > 0 && (
            <div className="mt-3 text-base font-semibold text-slate-900">
              Desde {formatCurrency(minPrice)}
            </div>
          )}
        </div>
      </Link>

      {/* Actions (Admin/Organizer only) */}
      {showActions && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(event.id)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Editar
              </Button>
            )}
            {onManageTickets && (
              <Button
                onClick={() => onManageTickets(event.id)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Tickets
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(event.id)}
                variant="secondary"
                size="sm"
                className="border-red-300 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-300"
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
