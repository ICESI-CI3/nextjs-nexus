/**
 * Event Service
 * Handles all API calls related to events and ticket types
 */

import { get, post, patch, del } from '@/src/lib/apiClient';
import type {
  Event,
  CreateEventDTO,
  UpdateEventDTO,
  TicketType,
  CreateTicketTypeDTO,
  UpdateTicketTypeDTO,
  PaginatedResponse,
  QueryParams,
  EventStatus,
} from '@/src/lib/types';
import { buildQueryString } from '@/src/lib/utils';

/**
 * Extended query params for events with filters
 */
export interface EventQueryParams extends QueryParams {
  status?: EventStatus | string;
  categoryId?: string;
  venueId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Get all events (paginated with filters)
 * Retrieves events based on user role:
 * - BUYER/authenticated users see only approved events
 * - ORGANIZER sees only their own events
 * - ADMIN sees all events
 * Results are ordered by event date (ascending)
 */
async function getEvents(params?: EventQueryParams): Promise<PaginatedResponse<Event>> {
  const queryString = params ? buildQueryString(params) : '';
  return get<PaginatedResponse<Event>>(`/events?${queryString}`);
}

/**
 * Get event by ID
 * Access rules:
 * - BUYER sees only approved events
 * - ORGANIZER sees only their own events
 * - ADMIN sees all events
 */
async function getEventById(id: string): Promise<Event> {
  return get<Event>(`/events/${id}`);
}

/**
 * Create new event (ADMIN/ORGANIZER only)
 */
async function createEvent(data: CreateEventDTO): Promise<Event> {
  return post<Event, CreateEventDTO>('/events', data);
}

/**
 * Update event (ADMIN/ORGANIZER only)
 */
async function updateEvent(id: string, data: UpdateEventDTO): Promise<Event> {
  return patch<Event, UpdateEventDTO>(`/events/${id}`, data);
}

/**
 * Update event status (ADMIN only)
 */
async function updateEventStatus(
  id: string,
  status: EventStatus,
  comment?: string
): Promise<Event> {
  return patch<Event, { status: EventStatus; comment?: string }>(`/events/${id}/status`, {
    status,
    comment,
  });
}

/**
 * Delete event (ADMIN/ORGANIZER only)
 */
async function deleteEvent(id: string): Promise<void> {
  return del<void>(`/events/${id}`);
}

/**
 * Get ticket types for an event
 * Retrieves all ticket types (VIP, General, etc.) configured for an event
 * Results are ordered by price (ascending)
 */
async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  return get<TicketType[]>(`/events/${eventId}/ticket-types`);
}

/**
 * Create ticket type for an event (ADMIN/ORGANIZER only)
 */
async function createTicketType(eventId: string, data: CreateTicketTypeDTO): Promise<TicketType> {
  return post<TicketType, CreateTicketTypeDTO>(`/events/${eventId}/ticket-types`, data);
}

/**
 * Update ticket type (ADMIN/ORGANIZER only)
 */
async function updateTicketType(
  eventId: string,
  typeId: string,
  data: UpdateTicketTypeDTO
): Promise<TicketType> {
  return patch<TicketType, UpdateTicketTypeDTO>(`/events/${eventId}/ticket-types/${typeId}`, data);
}

/**
 * Delete ticket type (ADMIN/ORGANIZER only)
 */
async function deleteTicketType(eventId: string, typeId: string): Promise<void> {
  return del<void>(`/events/${eventId}/ticket-types/${typeId}`);
}

/**
 * Get event with ticket types included
 * Convenience function that fetches both event details and its ticket types
 */
async function getEventWithTicketTypes(
  eventId: string
): Promise<{ event: Event; ticketTypes: TicketType[] }> {
  const [event, ticketTypes] = await Promise.all([getEventById(eventId), getTicketTypes(eventId)]);

  return { event, ticketTypes };
}

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getEventWithTicketTypes,
};

export default eventService;

// Export individual functions for convenience
export {
  getEvents as getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getEventWithTicketTypes,
};
