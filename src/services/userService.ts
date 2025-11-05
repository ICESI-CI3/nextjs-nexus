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

/**
 * Service for managing User CRUD operations.
 */

const API_ENDPOINT = '/users';

/**
 * Fetches a paginated list of users.
 * @param params - Query parameters (pagination, filters, etc.)
 */
export const getUsers = async (params: QueryParams): Promise<PaginatedResponse<User>> => {
  const queryString = buildQueryString(params);
  const response = await apiClient.get<PaginatedResponse<User>>(`${API_ENDPOINT}?${queryString}`);
  return response.data;
};

/**
 * Fetches a single user by their ID.
 * @param id - The user's ID.
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`${API_ENDPOINT}/${id}`);
  return response.data.data; // Unwrapping from the { data: ... } response
};

/**
 * Creates a new user.
 * @param data - The new user's data (CreateUserDto)
 */
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINT, data);
  return response.data.data; // Unwrapping from the { data: ... } response
};

/**
 * Updates an existing user.
 * @param id - The ID of the user to update.
 * @param data - The data to update (UpdateUserDto)
 */
export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await apiClient.patch<ApiResponse<User>>(`${API_ENDPOINT}/${id}`, data);
  return response.data.data; // Unwrapping from the { data: ... } response
};

/**
 * Deletes a user.
 * @param id - The ID of the user to delete.
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINT}/${id}`);
};

/**
 * Group the service into an object
 */
const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
