import { act } from '@testing-library/react';
import { usePurchaseStore } from '@/src/stores/usePurchaseStore';
import * as purchaseService from '@/src/services/purchaseService';
import { Purchase, PurchaseStatus, EventStatus, ApiError } from '@/src/lib/types';

// Mock del servicio completo
jest.mock('@/src/services/purchaseService');
const mockedPurchaseService = purchaseService as jest.Mocked<typeof purchaseService>;

describe('usePurchaseStore', () => {
  const mockDate = '2024-01-01T10:00:00Z';
  const mockPurchase: Purchase = {
    id: 'purchase-123',
    totalAmount: 150,
    status: PurchaseStatus.COMPLETED,
    purchaseDate: mockDate,
    event: {
      id: 'event-1',
      title: 'Evento Test',
      date: mockDate,
      status: EventStatus.ACTIVE,
      category: { id: 'c1', name: 'Cat1', createdAt: mockDate, updatedAt: mockDate },
      venue: {
        id: 'v1',
        name: 'Venue1',
        address: 'Add1',
        city: 'City1',
        maxCapacity: 100,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    tickets: [],
  };

  const mockApiError: ApiError = { message: 'Error al obtener compras', statusCode: 500 };

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      usePurchaseStore.getState().reset();
    });
  });

  it('debería tener el estado inicial correcto', () => {
    const state = usePurchaseStore.getState();
    expect(state.purchases).toEqual([]);
    expect(state.currentPurchase).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchPurchases', () => {
    it('debería cargar el historial de compras con éxito', async () => {
      mockedPurchaseService.getUserPurchases.mockResolvedValue([mockPurchase]);

      await act(async () => {
        await usePurchaseStore.getState().fetchPurchases();
      });

      const state = usePurchaseStore.getState();
      expect(state.purchases).toEqual([mockPurchase]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('debería manejar errores al cargar compras', async () => {
      mockedPurchaseService.getUserPurchases.mockRejectedValue(mockApiError);

      await expect(usePurchaseStore.getState().fetchPurchases()).rejects.toEqual(mockApiError);

      const state = usePurchaseStore.getState();
      expect(state.purchases).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockApiError.message);
    });
  });

  describe('fetchPurchaseById', () => {
    it('debería cargar una compra específica con éxito', async () => {
      mockedPurchaseService.getPurchaseById.mockResolvedValue(mockPurchase);

      await act(async () => {
        await usePurchaseStore.getState().fetchPurchaseById('purchase-123');
      });

      const state = usePurchaseStore.getState();
      expect(state.currentPurchase).toEqual(mockPurchase);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('debería manejar errores al cargar una compra específica', async () => {
      mockedPurchaseService.getPurchaseById.mockRejectedValue(mockApiError);

      await expect(usePurchaseStore.getState().fetchPurchaseById('invalid-id')).rejects.toEqual(
        mockApiError
      );

      expect(usePurchaseStore.getState().currentPurchase).toBeNull();
      expect(usePurchaseStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('acciones síncronas', () => {
    it('setCurrentPurchase debería establecer la compra actual', () => {
      act(() => {
        usePurchaseStore.getState().setCurrentPurchase(mockPurchase);
      });
      expect(usePurchaseStore.getState().currentPurchase).toEqual(mockPurchase);
    });

    it('clearError debería limpiar el error', () => {
      usePurchaseStore.setState({ error: 'Error persistente' });
      act(() => {
        usePurchaseStore.getState().clearError();
      });
      expect(usePurchaseStore.getState().error).toBeNull();
    });

    it('reset debería devolver el store al estado inicial', () => {
      // Arrange: ensuciamos el estado
      usePurchaseStore.setState({
        purchases: [mockPurchase],
        currentPurchase: mockPurchase,
        error: 'Algo salió mal',
        isLoading: true,
      });

      // Act
      act(() => {
        usePurchaseStore.getState().reset();
      });

      // Assert
      const state = usePurchaseStore.getState();
      expect(state.purchases).toEqual([]);
      expect(state.currentPurchase).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
