import ticketService from '@/src/services/ticketService';
import { post } from '@/src/lib/apiClient';
import { Ticket, TicketStatus } from '@/src/lib/types';

// Mock del cliente de API
jest.mock('@/src/lib/apiClient', () => ({
  post: jest.fn(),
}));

// Casting del mock
const mockedPost = post as jest.MockedFunction<typeof post>;

describe('ticketService', () => {
  const mockTicket: Ticket = {
    id: 'ticket-123',
    ticketCode: 'VALID-CODE',
    price: 100,
    seat: 'A1',
    status: TicketStatus.NOT_REDEEMED,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTicket', () => {
    it('debería validar un ticket correctamente', async () => {
      // Arrange
      const ticketCode = 'VALID-CODE';
      mockedPost.mockResolvedValue(mockTicket);

      // Act
      const result = await ticketService.validateTicket(ticketCode);

      // Assert
      expect(mockedPost).toHaveBeenCalledTimes(1);
      expect(mockedPost).toHaveBeenCalledWith(`/tickets/validate/${ticketCode}`, {});
      expect(result).toEqual(mockTicket);
    });

    it('debería propagar errores del cliente API durante la validación', async () => {
      // Arrange
      const error = new Error('Ticket inválido');
      mockedPost.mockRejectedValue(error);

      // Act & Assert
      await expect(ticketService.validateTicket('INVALID-CODE')).rejects.toThrow('Ticket inválido');
    });
  });
});
