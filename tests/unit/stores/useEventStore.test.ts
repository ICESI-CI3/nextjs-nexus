import { act } from '@testing-library/react';
import { useEventStore } from '@/src/stores/useEventStore';
import eventService from '@/src/services/eventService';
import { EventStatus } from '@/src/lib/types';

// Mock del servicio completo
jest.mock('@/src/services/eventService');

// Tipado para el mock
const mockedEventService = eventService as jest.Mocked<typeof eventService>;

// Datos de prueba reutilizables
const mockDate = new Date('2025-01-01T12:00:00Z').toISOString();
const mockCategory = {
  id: 'cat-1',
  name: 'Conciertos',
  createdAt: mockDate,
  updatedAt: mockDate,
};
const mockVenue = {
  id: 'venue-1',
  name: 'Estadio Principal',
  address: 'Calle 123',
  city: 'Ciudad',
  maxCapacity: 10000,
  createdAt: mockDate,
  updatedAt: mockDate,
};
const mockEvent1 = {
  id: 'evt-1',
  title: 'Evento 1',
  description: 'Descripción 1',
  date: mockDate,
  status: EventStatus.ACTIVE,
  category: mockCategory,
  venue: mockVenue,
  createdAt: mockDate,
  updatedAt: mockDate,
};
const mockEvent2 = { ...mockEvent1, id: 'evt-2', title: 'Evento 2', status: EventStatus.DRAFT };

const mockTicketType1 = {
  id: 'tt-1',
  name: 'General',
  price: 100,
  quantity: 500,
  createdAt: mockDate,
  updatedAt: mockDate,
};
const mockTicketType2 = { ...mockTicketType1, id: 'tt-2', name: 'VIP', price: 200 };

describe('useEventStore', () => {
  // Reiniciar el estado del store antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useEventStore.setState({
        events: [],
        currentEvent: null,
        ticketTypes: [],
        isLoading: false,
        error: null,
        totalPages: 1,
        currentPage: 1,
        totalItems: 0,
      });
    });
  });

  describe('Initial State', () => {
    it('debe tener el estado inicial correcto', () => {
      const state = useEventStore.getState();
      expect(state.events).toEqual([]);
      expect(state.currentEvent).toBeNull();
      expect(state.ticketTypes).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchEvents', () => {
    it('debe manejar respuesta paginada correctamente', async () => {
      const mockResponse = {
        data: [mockEvent1, mockEvent2],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 2,
          totalPages: 1,
        },
      };
      mockedEventService.getEvents.mockResolvedValue(mockResponse);

      await act(async () => {
        await useEventStore.getState().fetchEvents({ page: 1 });
      });

      const state = useEventStore.getState();
      expect(state.events).toEqual(mockResponse.data);
      expect(state.totalItems).toBe(2);
      expect(state.totalPages).toBe(1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockedEventService.getEvents).toHaveBeenCalledWith({ page: 1 });
    });

    it('debe manejar respuesta de array simple correctamente', async () => {
      const mockResponse = [mockEvent1, mockEvent2];
      // @ts-expect-error - forzando respuesta de array para probar compatibilidad
      mockedEventService.getEvents.mockResolvedValue(mockResponse);

      await act(async () => {
        await useEventStore.getState().fetchEvents();
      });

      const state = useEventStore.getState();
      expect(state.events).toEqual(mockResponse);
      expect(state.totalItems).toBe(2);
      expect(state.isLoading).toBe(false);
    });

    it('debe manejar errores en fetchEvents', async () => {
      const errorMessage = 'Error de red';
      mockedEventService.getEvents.mockRejectedValue({ message: errorMessage });

      await expect(useEventStore.getState().fetchEvents()).rejects.toEqual({
        message: errorMessage,
      });

      const state = useEventStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.events).toEqual([]);
    });
  });

  describe('fetchEventById', () => {
    it('debe cargar un evento por ID exitosamente', async () => {
      mockedEventService.getEventById.mockResolvedValue(mockEvent1);

      await act(async () => {
        await useEventStore.getState().fetchEventById('evt-1');
      });

      const state = useEventStore.getState();
      expect(state.currentEvent).toEqual(mockEvent1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('debe manejar errores al cargar evento por ID', async () => {
      mockedEventService.getEventById.mockRejectedValue(new Error('No encontrado'));

      await expect(useEventStore.getState().fetchEventById('invalid-id')).rejects.toThrow();

      const state = useEventStore.getState();
      expect(state.currentEvent).toBeNull();
      expect(state.error).toBe('No encontrado');
    });
  });

  describe('fetchEventWithTicketTypes', () => {
    it('debe cargar evento y sus tipos de tickets en paralelo', async () => {
      mockedEventService.getEventById.mockResolvedValue(mockEvent1);
      mockedEventService.getTicketTypes.mockResolvedValue([mockTicketType1, mockTicketType2]);

      await act(async () => {
        await useEventStore.getState().fetchEventWithTicketTypes('evt-1');
      });

      const state = useEventStore.getState();
      expect(state.currentEvent).toEqual(mockEvent1);
      expect(state.ticketTypes).toEqual([mockTicketType1, mockTicketType2]);
      expect(state.isLoading).toBe(false);
      expect(mockedEventService.getEventById).toHaveBeenCalledWith('evt-1');
      expect(mockedEventService.getTicketTypes).toHaveBeenCalledWith('evt-1');
    });

    it('debe manejar error si alguna de las llamadas falla', async () => {
      mockedEventService.getEventById.mockResolvedValue(mockEvent1);
      mockedEventService.getTicketTypes.mockRejectedValue({ message: 'Error tickets' });

      await expect(
        useEventStore.getState().fetchEventWithTicketTypes('evt-1')
      ).rejects.toBeTruthy();

      expect(useEventStore.getState().error).toBe('Error tickets');
    });
  });

  describe('createEvent', () => {
    it('debe crear un evento y agregarlo al inicio de la lista', async () => {
      // Estado inicial con un evento
      useEventStore.setState({ events: [mockEvent2] });

      const newEventData = {
        title: 'Nuevo Evento',
        description: 'Desc',
        date: mockDate,
        venueId: 'v1',
        categoryId: 'c1',
      };
      const createdEvent = { ...mockEvent1, ...newEventData, id: 'new-evt' };
      mockedEventService.createEvent.mockResolvedValue(createdEvent);

      await act(async () => {
        await useEventStore.getState().createEvent(newEventData);
      });

      const state = useEventStore.getState();
      expect(state.events).toHaveLength(2);
      expect(state.events[0]).toEqual(createdEvent); // Verifica que se agrega al inicio
      expect(state.currentEvent).toEqual(createdEvent);
    });
  });

  describe('updateEvent & updateEventStatus', () => {
    beforeEach(() => {
      // Configurar estado inicial con el evento a actualizar
      useEventStore.setState({
        events: [mockEvent1, mockEvent2],
        currentEvent: mockEvent1,
      });
    });

    it('debe actualizar un evento en la lista y en currentEvent', async () => {
      const updateData = { title: 'Evento 1 Actualizado' };
      const updatedEvent = { ...mockEvent1, ...updateData };
      mockedEventService.updateEvent.mockResolvedValue(updatedEvent);

      await act(async () => {
        await useEventStore.getState().updateEvent('evt-1', updateData);
      });

      const state = useEventStore.getState();
      expect(state.events.find((e) => e.id === 'evt-1')?.title).toBe('Evento 1 Actualizado');
      expect(state.currentEvent?.title).toBe('Evento 1 Actualizado');
    });

    it('debe actualizar el estado del evento', async () => {
      const updatedEvent = { ...mockEvent1, status: EventStatus.CANCELLED };
      mockedEventService.updateEventStatus.mockResolvedValue(updatedEvent);

      await act(async () => {
        await useEventStore
          .getState()
          .updateEventStatus('evt-1', EventStatus.CANCELLED, 'Mal clima');
      });

      const state = useEventStore.getState();
      expect(state.currentEvent?.status).toBe(EventStatus.CANCELLED);
      expect(mockedEventService.updateEventStatus).toHaveBeenCalledWith(
        'evt-1',
        EventStatus.CANCELLED,
        'Mal clima'
      );
    });
  });

  describe('deleteEvent', () => {
    it('debe eliminar evento de la lista y limpiar currentEvent si coincide', async () => {
      useEventStore.setState({
        events: [mockEvent1, mockEvent2],
        currentEvent: mockEvent1,
      });

      mockedEventService.deleteEvent.mockResolvedValue(undefined);

      await act(async () => {
        await useEventStore.getState().deleteEvent('evt-1');
      });

      const state = useEventStore.getState();
      expect(state.events).toHaveLength(1);
      expect(state.events.find((e) => e.id === 'evt-1')).toBeUndefined();
      expect(state.currentEvent).toBeNull();
    });
  });

  describe('Ticket Type Actions', () => {
    beforeEach(() => {
      useEventStore.setState({ ticketTypes: [mockTicketType1] });
    });

    it('fetchTicketTypes debe cargar tipos de tickets', async () => {
      mockedEventService.getTicketTypes.mockResolvedValue([mockTicketType1, mockTicketType2]);

      await act(async () => {
        await useEventStore.getState().fetchTicketTypes('evt-1');
      });

      expect(useEventStore.getState().ticketTypes).toHaveLength(2);
    });

    it('createTicketType debe agregar un nuevo tipo de ticket', async () => {
      mockedEventService.createTicketType.mockResolvedValue(mockTicketType2);

      await act(async () => {
        await useEventStore.getState().createTicketType('evt-1', {
          name: 'VIP',
          description: '',
          price: 200,
          quantity: 100,
        });
      });

      expect(useEventStore.getState().ticketTypes).toContainEqual(mockTicketType2);
    });

    it('updateTicketType debe actualizar un tipo de ticket existente', async () => {
      const updatedTicket = { ...mockTicketType1, price: 150 };
      mockedEventService.updateTicketType.mockResolvedValue(updatedTicket);

      await act(async () => {
        await useEventStore.getState().updateTicketType('evt-1', 'tt-1', { price: 150 });
      });

      const state = useEventStore.getState();
      expect(state.ticketTypes.find((t) => t.id === 'tt-1')?.price).toBe(150);
    });

    it('deleteTicketType debe eliminar un tipo de ticket', async () => {
      mockedEventService.deleteTicketType.mockResolvedValue(undefined);

      await act(async () => {
        await useEventStore.getState().deleteTicketType('evt-1', 'tt-1');
      });

      expect(useEventStore.getState().ticketTypes).toHaveLength(0);
    });
  });

  describe('Utility Actions', () => {
    it('setCurrentEvent debe establecer el evento actual', () => {
      act(() => {
        useEventStore.getState().setCurrentEvent(mockEvent1);
      });
      expect(useEventStore.getState().currentEvent).toEqual(mockEvent1);
    });

    it('clearError debe limpiar el error', () => {
      useEventStore.setState({ error: 'Algo salió mal' });
      act(() => {
        useEventStore.getState().clearError();
      });
      expect(useEventStore.getState().error).toBeNull();
    });
  });
});
