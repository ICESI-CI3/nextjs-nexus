import apiClient from '../lib/apiClient';
import {
  User,
  PaginatedResponse,
  QueryParams,
  CreateUserDto,
  UpdateUserDto,
  ApiResponse,
} from '../lib/types';
import { buildQueryString } from '../lib/utils';

const API_ENDPOINT = '/users';

export const getUsers = async (params: QueryParams): Promise<PaginatedResponse<User>> => {
  const queryString = buildQueryString(params);
  const response = await apiClient.get<PaginatedResponse<User>>(`${API_ENDPOINT}?${queryString}`);
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`${API_ENDPOINT}/${id}`);
  return response.data.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINT, data);
  return response.data.data;
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await apiClient.patch<ApiResponse<User>>(`${API_ENDPOINT}/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINT}/${id}`);
};

/**
 * Bloquear / Desbloquear usuario usando los endpoints dedicados del backend.
 * No mandes isBlocked en el body porque el DTO lo rechaza.
 */
export const toggleBlockUser = async (id: string, nextBlocked: boolean): Promise<User> => {
  const url = `${API_ENDPOINT}/${id}/${nextBlocked ? 'block' : 'unblock'}`;
  const response = await apiClient.patch<ApiResponse<User>>(url, {}); // cuerpo vacío
  return response.data.data;
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleBlockUser,
};

export default userService;
