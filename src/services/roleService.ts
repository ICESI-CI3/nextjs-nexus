import apiClient from '../lib/apiClient'; // Default import
import { Role, PaginatedResponse, QueryParams, ApiResponse } from '../lib/types';
import { buildQueryString } from '../lib/utils';

/**
 * Service for managing Role CRUD operations.
 */

const API_ENDPOINT = '/roles';

/**
 * Fetches a paginated list of roles.
 * @param params - Query parameters (pagination, filters, etc.)
 */
export const getRoles = async (params: QueryParams): Promise<PaginatedResponse<Role>> => {
  const queryString = buildQueryString(params);
  const response = await apiClient.get<PaginatedResponse<Role>>(`${API_ENDPOINT}?${queryString}`);
  return response.data;
};

/**
 * Fetches a single role by its ID.
 * @param id - The role's ID.
 */
export const getRoleById = async (id: string): Promise<Role> => {
  const response = await apiClient.get<ApiResponse<Role>>(`${API_ENDPOINT}/${id}`);
  return response.data.data; // Unwrapping from the { data: ... } response
};

// NOTE: You will add createRole, updateRole, deleteRole here
// when you build the CRUD for Roles.

/**
 * Group the service into an object
 */
const roleService = {
  getRoles,
  getRoleById,
};

export default roleService;
