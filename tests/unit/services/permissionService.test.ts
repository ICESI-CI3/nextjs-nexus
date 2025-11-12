import permissionService from '@/src/services/permissionService';
import apiClient from '@/src/lib/apiClient';
import { Permission, PaginatedResponse } from '@/src/lib/types';

// Mock del cliente API
jest.mock('@/src/lib/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('permissionService', () => {
  const mockPermission: Permission = {
    id: 'perm-1',
    name: 'Leer Usuarios',
    code: 'READ_USER',
    description: 'Permite leer usuarios',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPermissions', () => {
    it('debería obtener permisos paginados sin parámetros', async () => {
      const mockResponse: PaginatedResponse<Permission> = {
        data: [mockPermission],
        meta: { currentPage: 1, itemsPerPage: 10, totalItems: 1, totalPages: 1 },
      };
      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await permissionService.getPermissions({});

      expect(mockedApiClient.get).toHaveBeenCalledWith('/permissions');
      expect(result).toEqual(mockResponse);
    });

    it('debería obtener permisos con parámetros de consulta', async () => {
      const queryParams = { page: 2, limit: 20, search: 'admin' };
      mockedApiClient.get.mockResolvedValue({ data: { data: [], meta: {} } });

      await permissionService.getPermissions(queryParams);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/permissions?page=2&limit=20&search=admin')
      );
    });
  });

  describe('getPermissionById', () => {
    it('debería obtener un permiso por ID', async () => {
      const mockApiResponse = { data: mockPermission };
      mockedApiClient.get.mockResolvedValue({ data: mockApiResponse });

      const result = await permissionService.getPermissionById('perm-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/permissions/perm-1');
      expect(result).toEqual(mockPermission);
    });
  });
});
