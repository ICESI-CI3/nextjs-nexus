/**
 * Event Store
 */

import { create } from 'zustand';
import type {
  Event,
  CreateEventDTO,
  UpdateEventDTO,
  TicketType,
  CreateTicketTypeDTO,
  UpdateTicketTypeDTO,
  ApiError,
  QueryParams,
  EventStatus,
} from '@/src/lib/types';
import eventService from '@/src/services/eventService';

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  ticketTypes: TicketType[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface EventActions {
  fetchEvents: (params?: QueryParams) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  fetchEventWithTicketTypes: (id: string) => Promise<void>;
  createEvent: (data: CreateEventDTO) => Promise<Event>;
  updateEvent: (id: string, data: UpdateEventDTO) => Promise<Event>;
  updateEventStatus: (id: string, status: EventStatus) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  setCurrentEvent: (event: Event | null) => void;
  clearError: () => void;

  // Ticket Types
  fetchTicketTypes: (eventId: string) => Promise<TicketType[]>;
  createTicketType: (eventId: string, data: CreateTicketTypeDTO) => Promise<TicketType>;
  updateTicketType: (
    eventId: string,
    typeId: string,
    data: UpdateTicketTypeDTO
  ) => Promise<TicketType>;
  deleteTicketType: (eventId: string, typeId: string) => Promise<void>;
}

type EventStore = EventState & EventActions;

export const useEventStore = create<EventStore>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  ticketTypes: [],
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalItems: 0,

  // Actions
  fetchEvents: async (params) => {
    try {
      set({ isLoading: true, error: null });

      const response = await eventService.getEvents(params);

      // Handle both paginated and non-paginated responses
      if (Array.isArray(response)) {
        // Backend returned a simple array
        set({
          events: response,
          totalPages: 1,
          currentPage: 1,
          totalItems: response.length,
          isLoading: false,
        });
      } else {
        // Backend returned a paginated object
        set({
          events: response.data,
          totalPages: response.meta.totalPages,
          currentPage: response.meta.currentPage,
          totalItems: response.meta.totalItems,
          isLoading: false,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar eventos',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchEventById: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const event = await eventService.getEventById(id);

      console.log('DEBUG: Raw event data from API:', JSON.stringify(event, null, 2));

      set({
        currentEvent: event,
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar el evento',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchEventWithTicketTypes: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // Fetch both event and ticket types in parallel
      const [event, ticketTypes] = await Promise.all([
        eventService.getEventById(id),
        eventService.getTicketTypes(id),
      ]);

      set({
        currentEvent: event,
        ticketTypes,
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar el evento y tipos de tickets',
        isLoading: false,
      });
      throw error;
    }
  },

  createEvent: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const event = await eventService.createEvent(data);

      set((state) => ({
        events: [event, ...state.events],
        isLoading: false,
      }));

      return event;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al crear evento',
        isLoading: false,
      });
      throw error;
    }
  },

  updateEvent: async (id, data) => {
    try {
      set({ isLoading: true, error: null });

      const event = await eventService.updateEvent(id, data);

      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
        currentEvent: state.currentEvent?.id === id ? event : state.currentEvent,
        isLoading: false,
      }));

      return event;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al actualizar evento',
        isLoading: false,
      });
      throw error;
    }
  },

  updateEventStatus: async (id, status) => {
    try {
      set({ isLoading: true, error: null });

      const event = await eventService.updateEvent(id, { status });

      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
        currentEvent: state.currentEvent?.id === id ? event : state.currentEvent,
        isLoading: false,
      }));

      return event;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al actualizar estado del evento',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      set({ isLoading: true, error: null });

      await eventService.deleteEvent(id);

      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
        isLoading: false,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al eliminar evento',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentEvent: (event) => set({ currentEvent: event }),

  clearError: () => set({ error: null }),

  // Ticket Types
  fetchTicketTypes: async (eventId) => {
    try {
      const ticketTypes = await eventService.getTicketTypes(eventId);
      set({ ticketTypes });
      return ticketTypes;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || 'Error al cargar tipos de tickets' });
      throw error;
    }
  },

  createTicketType: async (eventId, data) => {
    try {
      const ticketType = await eventService.createTicketType(eventId, data);

      set((state) => ({
        ticketTypes: [...state.ticketTypes, ticketType],
      }));

      return ticketType;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || 'Error al crear tipo de ticket' });
      throw error;
    }
  },

  updateTicketType: async (eventId, typeId, data) => {
    try {
      const ticketType = await eventService.updateTicketType(eventId, typeId, data);

      set((state) => ({
        ticketTypes: state.ticketTypes.map((tt) => (tt.id === typeId ? ticketType : tt)),
      }));

      return ticketType;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || 'Error al actualizar tipo de ticket' });
      throw error;
    }
  },

  deleteTicketType: async (eventId, typeId) => {
    try {
      await eventService.deleteTicketType(eventId, typeId);

      set((state) => ({
        ticketTypes: state.ticketTypes.filter((tt) => tt.id !== typeId),
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || 'Error al eliminar tipo de ticket' });
      throw error;
    }
  },
}));
