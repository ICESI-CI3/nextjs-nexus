import { act } from '@testing-library/react';
import { useVenueStore } from '@/src/stores/useVenueStore';
import venueService from '@/src/services/venueService';
import { Venue, CreateVenueDTO, UpdateVenueDTO, ApiError } from '@/src/lib/types';

jest.mock('@/src/services/venueService');
const mockedVenueService = venueService as jest.Mocked<typeof venueService>;

describe('useVenueStore', () => {
  const mockVenue1: Venue = {
    id: '1',
    name: 'Estadio A',
    address: 'Calle A',
    city: 'Ciudad A',
    maxCapacity: 1000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };
  const mockVenue2: Venue = {
    id: '2',
    name: 'Teatro B',
    address: 'Calle B',
    city: 'Ciudad B',
    maxCapacity: 500,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  };
  const mockApiError: ApiError = { message: 'Error API', statusCode: 500 };

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useVenueStore.setState({ venues: [], isLoading: false, error: null });
    });
  });

  describe('fetchVenues', () => {
    it('debería cargar los recintos correctamente', async () => {
      mockedVenueService.getVenues.mockResolvedValue([mockVenue1, mockVenue2]);
      await act(async () => {
        await useVenueStore.getState().fetchVenues();
      });
      const state = useVenueStore.getState();
      expect(state.venues).toEqual([mockVenue1, mockVenue2]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('debería manejar errores al cargar recintos', async () => {
      mockedVenueService.getVenues.mockRejectedValue(mockApiError);
      await expect(useVenueStore.getState().fetchVenues()).rejects.toEqual(mockApiError);
      expect(useVenueStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('createVenue', () => {
    it('debería crear y añadir un recinto', async () => {
      const newVenueData: CreateVenueDTO = {
        name: 'Nuevo',
        address: 'Calle N',
        city: 'C',
        maxCapacity: 100,
      };
      mockedVenueService.createVenue.mockResolvedValue(mockVenue1);
      await act(async () => {
        await useVenueStore.getState().createVenue(newVenueData);
      });
      expect(useVenueStore.getState().venues).toContainEqual(mockVenue1);
    });

    it('debería manejar errores al crear', async () => {
      mockedVenueService.createVenue.mockRejectedValue(mockApiError);
      await expect(useVenueStore.getState().createVenue({} as CreateVenueDTO)).rejects.toEqual(
        mockApiError
      );
      expect(useVenueStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('updateVenue', () => {
    it('debería actualizar un recinto existente', async () => {
      useVenueStore.setState({ venues: [mockVenue1] });
      const updateData: UpdateVenueDTO = { name: 'Estadio A Renovado' };
      const updatedVenue = { ...mockVenue1, ...updateData };
      mockedVenueService.updateVenue.mockResolvedValue(updatedVenue);

      await act(async () => {
        await useVenueStore.getState().updateVenue(mockVenue1.id, updateData);
      });
      expect(useVenueStore.getState().venues[0]).toEqual(updatedVenue);
    });

    it('debería manejar errores al actualizar', async () => {
      mockedVenueService.updateVenue.mockRejectedValue(mockApiError);
      await expect(useVenueStore.getState().updateVenue('1', {})).rejects.toEqual(mockApiError);
      expect(useVenueStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('deleteVenue', () => {
    it('debería eliminar un recinto del estado', async () => {
      useVenueStore.setState({ venues: [mockVenue1, mockVenue2] });
      mockedVenueService.deleteVenue.mockResolvedValue(undefined);
      await act(async () => {
        await useVenueStore.getState().deleteVenue(mockVenue1.id);
      });
      expect(useVenueStore.getState().venues).toEqual([mockVenue2]);
    });

    it('debería manejar errores al eliminar', async () => {
      mockedVenueService.deleteVenue.mockRejectedValue(mockApiError);
      await expect(useVenueStore.getState().deleteVenue('1')).rejects.toEqual(mockApiError);
      expect(useVenueStore.getState().error).toBe(mockApiError.message);
    });
  });

  describe('clearError', () => {
    it('debería limpiar el error', () => {
      useVenueStore.setState({ error: 'Error' });
      act(() => useVenueStore.getState().clearError());
      expect(useVenueStore.getState().error).toBeNull();
    });
  });
});
