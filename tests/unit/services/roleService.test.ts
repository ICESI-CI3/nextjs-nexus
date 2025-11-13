import roleService from '@/src/services/roleService';
import apiClient from '@/src/lib/apiClient';
import { Role, CreateRoleDto, UpdateRoleDto } from '@/src/lib/types';

// Mock del cliente API
jest.mock('@/src/lib/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('roleService', () => {
  const mockRole: Role = {
    id: 'role-1',
    name: 'Admin',
    description: 'Administrador del sistema',
    permissionIds: ['perm-1', 'perm-2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('debería obtener roles (lista simple)', async () => {
      const mockResponse = [mockRole];
      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await roleService.getRoles({});

      expect(mockedApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/roles'));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRoleById', () => {
    it('debería obtener un rol por ID', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { data: mockRole } });

      const result = await roleService.getRoleById('role-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/roles/role-1');
      expect(result).toEqual(mockRole);
    });
  });

  describe('createRole', () => {
    it('debería crear un nuevo rol', async () => {
      const createDto: CreateRoleDto = {
        name: 'Nuevo Rol',
        description: 'Desc',
        permissionIds: ['p1'],
      };
      mockedApiClient.post.mockResolvedValue({ data: { data: mockRole } });

      const result = await roleService.createRole(createDto);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/roles', createDto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('updateRole', () => {
    it('debería actualizar un rol parcialmente', async () => {
      const updateDto: UpdateRoleDto = { name: 'Rol Actualizado' };
      mockedApiClient.patch.mockResolvedValue({ data: { data: mockRole } });

      const result = await roleService.updateRole('role-1', updateDto);

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/roles/role-1', updateDto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('deleteRole', () => {
    it('debería eliminar un rol', async () => {
      mockedApiClient.delete.mockResolvedValue({ data: {} });

      await roleService.deleteRole('role-1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/roles/role-1');
    });
  });

  describe('getPublicRoles', () => {
    it('debería obtener roles públicos', async () => {
      const mockRoles = [mockRole];
      mockedApiClient.get.mockResolvedValue({ data: mockRoles });

      const result = await roleService.getPublicRoles();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/roles/public');
      expect(result).toEqual(mockRoles);
    });
  });

  describe('getAdminCreatableRoles', () => {
    it('debería obtener roles creables por admin', async () => {
      const mockRoles = [mockRole];
      mockedApiClient.get.mockResolvedValue({ data: mockRoles });

      const result = await roleService.getAdminCreatableRoles();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/roles/admin-creatable');
      expect(result).toEqual(mockRoles);
    });
  });
});
