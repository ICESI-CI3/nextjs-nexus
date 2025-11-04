/**
 * Event Service
 */

import { get, post, patch, del } from '@/src/lib/apiClient';
import type {
  Event,
  CreateEventDTO,
  UpdateEventDTO,
  UpdateEventStatusDTO,
  TicketType,
  CreateTicketTypeDTO,
  UpdateTicketTypeDTO,
  PaginatedResponse,
  QueryParams,
} from '@/src/lib/types';
import { buildQueryString } from '@/src/lib/utils';

/**
 * Get all events (paginated)
 */
async function getEvents(params?: QueryParams): Promise<PaginatedResponse<Event>> {
  const queryString = params ? buildQueryString(params) : '';
  return get<PaginatedResponse<Event>>(`/events?${queryString}`);
}

/**
 * Get event by ID
 */
async function getEventById(id: string): Promise<Event> {
  return get<Event>(`/events/${id}`);
}

/**
 * Create new event
 */
async function createEvent(data: CreateEventDTO): Promise<Event> {
  return post<Event, CreateEventDTO>('/events', data);
}

/**
 * Update event
 */
async function updateEvent(id: string, data: UpdateEventDTO): Promise<Event> {
  return patch<Event, UpdateEventDTO>(`/events/${id}`, data);
}

/**
 * Update event status
 */
async function updateEventStatus(id: string, data: UpdateEventStatusDTO): Promise<Event> {
  return patch<Event, UpdateEventStatusDTO>(`/events/${id}/status`, data);
}

/**
 * Delete event
 */
async function deleteEvent(id: string): Promise<void> {
  return del<void>(`/events/${id}`);
}

/**
 * Get ticket types for an event
 */
async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  return get<TicketType[]>(`/events/${eventId}/ticket-types`);
}

/**
 * Create ticket type for an event
 */
async function createTicketType(eventId: string, data: CreateTicketTypeDTO): Promise<TicketType> {
  return post<TicketType, CreateTicketTypeDTO>(`/events/${eventId}/ticket-types`, data);
}

/**
 * Update ticket type
 */
async function updateTicketType(typeId: string, data: UpdateTicketTypeDTO): Promise<TicketType> {
  return patch<TicketType, UpdateTicketTypeDTO>(`/ticket-types/${typeId}`, data);
}

/**
 * Delete ticket type
 */
async function deleteTicketType(typeId: string): Promise<void> {
  return del<void>(`/ticket-types/${typeId}`);
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
};

export default eventService;
