// src/services/roleService.ts
import apiClient from '../lib/apiClient';
import {
  Role,
  PaginatedResponse,
  QueryParams,
  ApiResponse,
  CreateRoleDto,
  UpdateRoleDto,
} from '../lib/types';
import { buildQueryString } from '../lib/utils';

const API_ENDPOINT = '/roles';

/**
 * Lista de roles (acepta respuesta paginada o lista simple).
 */
export const getRoles = async (params: QueryParams): Promise<PaginatedResponse<Role> | Role[]> => {
  const queryString = buildQueryString(params);
  const response = await apiClient.get<PaginatedResponse<Role> | Role[]>(
    `${API_ENDPOINT}?${queryString}`
  );
  return response.data;
};

/**
 * Detalle de un rol por ID.
 */
export const getRoleById = async (id: string): Promise<Role> => {
  const response = await apiClient.get<ApiResponse<Role>>(`${API_ENDPOINT}/${id}`);
  return response.data.data;
};

/**
 * Crear rol personalizado.
 * IMPORTANTE: jamás enviamos isGeneric; el backend lo define.
 */
export const createRole = async (data: CreateRoleDto): Promise<Role> => {
  const { name, description, permissionIds } = data;
  const payload: CreateRoleDto = { name, description, permissionIds };
  const response = await apiClient.post<ApiResponse<Role>>(API_ENDPOINT, payload);
  return response.data.data;
};

/**
 * Actualizar rol (solo campos permitidos).
 * IMPORTANTE: no incluir isGeneric aquí tampoco.
 */
export const updateRole = async (id: string, data: UpdateRoleDto): Promise<Role> => {
  const { name, description, permissionIds } = data;
  const payload: Partial<UpdateRoleDto> = {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(permissionIds !== undefined ? { permissionIds } : {}),
  };
  const response = await apiClient.patch<ApiResponse<Role>>(`${API_ENDPOINT}/${id}`, payload);
  return response.data.data;
};

/**
 * Eliminar rol (el backend debe impedir borrar genéricos).
 */
export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINT}/${id}`);
};

/**
 * Get public roles for registration (no auth required)
 */
export const getPublicRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>('/roles/public');
  return response.data;
};

/**
 * Get roles for admin user creation (auth required)
 */
export const getAdminCreatableRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>('/roles/admin-creatable');
  return response.data;
};

const roleService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPublicRoles,
  getAdminCreatableRoles,
};

export default roleService;
