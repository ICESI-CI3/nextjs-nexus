import venueService from '@/src/services/venueService';
import { get, post, patch, del } from '@/src/lib/apiClient';
import { Venue, CreateVenueDTO, UpdateVenueDTO } from '@/src/lib/types';

// Mock del cliente de API
jest.mock('@/src/lib/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPost = post as jest.MockedFunction<typeof post>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;
const mockedDel = del as jest.MockedFunction<typeof del>;

describe('venueService', () => {
  const mockDate = '2024-01-01T12:00:00Z';
  const mockVenue: Venue = {
    id: 'venue-123',
    name: 'Gran Estadio',
    address: 'Calle Principal 123',
    city: 'Ciudad Capital',
    maxCapacity: 50000,
    createdAt: mockDate,
    updatedAt: mockDate,
  };
  const mockVenues: Venue[] = [
    mockVenue,
    { ...mockVenue, id: 'venue-456', name: 'Pequeño Teatro' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVenues', () => {
    it('debería obtener todos los recintos', async () => {
      mockedGet.mockResolvedValue(mockVenues);
      const result = await venueService.getVenues();
      expect(mockedGet).toHaveBeenCalledWith('/venues');
      expect(result).toEqual(mockVenues);
    });
  });

  describe('getVenueById', () => {
    it('debería obtener un recinto por ID', async () => {
      mockedGet.mockResolvedValue(mockVenue);
      const result = await venueService.getVenueById('venue-123');
      expect(mockedGet).toHaveBeenCalledWith('/venues/venue-123');
      expect(result).toEqual(mockVenue);
    });
  });

  describe('createVenue', () => {
    it('debería crear un nuevo recinto', async () => {
      const createDto: CreateVenueDTO = {
        name: 'Nuevo Estadio',
        address: 'Av. Nueva',
        city: 'Madrid',
        maxCapacity: 1000,
      };
      mockedPost.mockResolvedValue(mockVenue);
      const result = await venueService.createVenue(createDto);
      expect(mockedPost).toHaveBeenCalledWith('/venues', createDto);
      expect(result).toEqual(mockVenue);
    });
  });

  describe('updateVenue', () => {
    it('debería actualizar un recinto existente', async () => {
      const updateDto: UpdateVenueDTO = { maxCapacity: 60000 };
      const updatedVenue = { ...mockVenue, ...updateDto };
      mockedPatch.mockResolvedValue(updatedVenue);
      const result = await venueService.updateVenue('venue-123', updateDto);
      expect(mockedPatch).toHaveBeenCalledWith('/venues/venue-123', updateDto);
      expect(result).toEqual(updatedVenue);
    });
  });

  describe('deleteVenue', () => {
    it('debería eliminar un recinto', async () => {
      mockedDel.mockResolvedValue(undefined);
      await venueService.deleteVenue('venue-123');
      expect(mockedDel).toHaveBeenCalledWith('/venues/venue-123');
    });
  });
});
