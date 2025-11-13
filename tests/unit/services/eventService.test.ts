import eventService from '@/src/services/eventService';
import * as apiClient from '@/src/lib/apiClient';
import { EventStatus } from '@/src/lib/types';

// Mock de todo el módulo apiClient
jest.mock('@/src/lib/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

describe('eventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('debería llamar a get con la URL correcta sin parámetros', async () => {
      const mockResponse = { data: [], meta: { total: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.getEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/events?');
      expect(result).toEqual(mockResponse);
    });

    it('debería llamar a get con query string cuando se pasan parámetros', async () => {
      const params = { page: 1, limit: 10, search: 'rock', status: EventStatus.ACTIVE };
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await eventService.getEvents(params);

      // Verificamos que la URL contenga los parámetros (el orden puede variar según la implementación de buildQueryString,
      // así que verificamos partes clave o usamos expect.stringContaining si fuera necesario,
      // pero idealmente buildQueryString es determinista).
      // Asumiendo que buildQueryString usa URLSearchParams, el orden suele ser de inserción.
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/events\?.*page=1.*limit=10.*search=rock.*status=ACTIVE/)
      );
    });
  });

  describe('getEventById', () => {
    it('debería obtener un evento por ID', async () => {
      const mockEvent = { id: '123', title: 'Test Event' };
      (apiClient.get as jest.Mock).mockResolvedValue(mockEvent);

      const result = await eventService.getEventById('123');

      expect(apiClient.get).toHaveBeenCalledWith('/events/123');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('createEvent', () => {
    it('debería hacer POST para crear un evento', async () => {
      const payload = {
        title: 'New Event',
        description: 'Desc',
        date: '2025-01-01',
        venueId: 'v1',
        categoryId: 'c1',
      };
      const mockCreated = { id: 'new', ...payload };
      (apiClient.post as jest.Mock).mockResolvedValue(mockCreated);

      const result = await eventService.createEvent(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/events', payload);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateEvent', () => {
    it('debería hacer PATCH para actualizar un evento', async () => {
      const payload = { title: 'Updated Title' };
      const mockUpdated = { id: '123', ...payload };
      (apiClient.patch as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await eventService.updateEvent('123', payload);

      expect(apiClient.patch).toHaveBeenCalledWith('/events/123', payload);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('updateEventStatus', () => {
    it('debería hacer PATCH al endpoint de estado', async () => {
      const status = EventStatus.CANCELLED;
      const comment = 'Rain';
      const mockUpdated = { id: '123', status, statusLogs: [comment] };
      (apiClient.patch as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await eventService.updateEventStatus('123', status, comment);

      expect(apiClient.patch).toHaveBeenCalledWith('/events/123/status', { status, comment });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteEvent', () => {
    it('debería hacer DELETE para eliminar un evento', async () => {
      (apiClient.del as jest.Mock).mockResolvedValue(undefined);

      await eventService.deleteEvent('123');

      expect(apiClient.del).toHaveBeenCalledWith('/events/123');
    });
  });

  describe('Ticket Types operations', () => {
    const eventId = 'evt1';
    const typeId = 'tt1';

    it('getTicketTypes debería llamar al endpoint correcto', async () => {
      const mockTypes = [{ id: typeId, name: 'VIP' }];
      (apiClient.get as jest.Mock).mockResolvedValue(mockTypes);

      const result = await eventService.getTicketTypes(eventId);

      expect(apiClient.get).toHaveBeenCalledWith(`/events/${eventId}/ticket-types`);
      expect(result).toEqual(mockTypes);
    });

    it('createTicketType debería hacer POST al subrecurso', async () => {
      const payload = { name: 'General', price: 100, quantity: 50, description: 'Basic' };
      (apiClient.post as jest.Mock).mockResolvedValue({ id: 'new-tt', ...payload });

      await eventService.createTicketType(eventId, payload);

      expect(apiClient.post).toHaveBeenCalledWith(`/events/${eventId}/ticket-types`, payload);
    });

    it('updateTicketType debería hacer PATCH al recurso anidado', async () => {
      const payload = { price: 120 };
      (apiClient.patch as jest.Mock).mockResolvedValue({ id: typeId, ...payload });

      await eventService.updateTicketType(eventId, typeId, payload);

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/events/${eventId}/ticket-types/${typeId}`,
        payload
      );
    });

    it('deleteTicketType debería hacer DELETE al recurso anidado', async () => {
      (apiClient.del as jest.Mock).mockResolvedValue(undefined);

      await eventService.deleteTicketType(eventId, typeId);

      expect(apiClient.del).toHaveBeenCalledWith(`/events/${eventId}/ticket-types/${typeId}`);
    });
  });

  describe('getEventWithTicketTypes', () => {
    it('debería obtener evento y tickets en paralelo y combinarlos', async () => {
      const eventId = '123';
      const mockEvent = { id: eventId, title: 'Concert' };
      const mockTicketTypes = [{ id: 'tt1', name: 'VIP' }];

      // Mockeamos las respuestas individuales
      (apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/events/${eventId}`) return Promise.resolve(mockEvent);
        if (url === `/events/${eventId}/ticket-types`) return Promise.resolve(mockTicketTypes);
        return Promise.reject(new Error('Unexpected URL'));
      });

      const result = await eventService.getEventWithTicketTypes(eventId);

      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith(`/events/${eventId}`);
      expect(apiClient.get).toHaveBeenCalledWith(`/events/${eventId}/ticket-types`);
      expect(result).toEqual({
        event: mockEvent,
        ticketTypes: mockTicketTypes,
      });
    });

    it('debería fallar si alguna de las llamadas falla', async () => {
      (apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url.includes('ticket-types')) return Promise.reject(new Error('Failed tickets'));
        return Promise.resolve({});
      });

      await expect(eventService.getEventWithTicketTypes('123')).rejects.toThrow('Failed tickets');
    });
  });
});
