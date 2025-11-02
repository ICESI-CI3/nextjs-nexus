/**
 * ============================================
 * ZUSTAND STORE TEMPLATE
 * ============================================
 *
 * This is a template for creating Zustand stores for your application data.
 * Copy this file and customize it based on your NestJS backend API.
 *
 * STEPS TO CREATE A NEW STORE:
 * 1. Copy this file and rename it (e.g., useUserStore.ts, useProductStore.ts)
 * 2. Replace "Resource" with your entity name (e.g., User, Product, Order)
 * 3. Adjust the state properties to match your needs
 * 4. Update the API endpoints to match your NestJS backend
 * 5. Modify the response types based on your backend API structure
 * 6. Add/remove actions as needed for your use case
 *
 * EXAMPLE USE CASES:
 * - useUserStore - Manage users (admin panel)
 * - useProductStore - Manage products/items
 * - useOrderStore - Manage orders/purchases
 * - useCategoryStore - Manage categories
 * - etc.
 *
 * ============================================
 */

import { create } from 'zustand';
import type { PaginatedResponse, QueryParams, ApiError } from '@/src/lib/types';
import { get, post, put, del } from '@/src/lib/apiClient';
import { buildQueryString } from '@/src/lib/utils';

// ============================================
// STEP 1: Define your resource types
// ============================================

/**
 * TODO: Replace this with your actual resource type from src/lib/types.ts
 * Example: User, Product, Order, etc.
 */
interface Resource {
  id: string;
  // Add your resource fields here based on your backend
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // ... other fields
}

/**
 * TODO: Define the DTO for creating a resource
 * Should match what your NestJS backend expects
 */
interface CreateResourceDTO {
  // Add required fields for creation
  name: string;
  // ... other fields
}

/**
 * TODO: Define the DTO for updating a resource
 * Usually a Partial of CreateResourceDTO, or you can add specific update fields
 */
type UpdateResourceDTO = Partial<CreateResourceDTO>;

// ============================================
// STEP 2: Define store state and actions
// ============================================

interface ResourceState {
  // List of resources
  resources: Resource[];

  // Single resource (for detail views)
  currentResource: Resource | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Pagination
  totalPages: number;
  currentPage: number;
}

interface ResourceActions {
  // Fetch paginated list
  fetchResources: (params?: QueryParams) => Promise<void>;

  // Fetch single resource by ID
  fetchResourceById: (id: string) => Promise<void>;

  // Create new resource
  createResource: (data: CreateResourceDTO) => Promise<Resource>;

  // Update resource
  updateResource: (id: string, data: UpdateResourceDTO) => Promise<Resource>;

  // Delete resource
  deleteResource: (id: string) => Promise<void>;

  // Set current resource
  setCurrentResource: (resource: Resource | null) => void;

  // Clear error
  clearError: () => void;
}

type ResourceStore = ResourceState & ResourceActions;

// ============================================
// STEP 3: Create the store
// ============================================

export const useResourceStore = create<ResourceStore>((set) => ({
  // Initial state
  resources: [],
  currentResource: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  // Actions
  fetchResources: async (params) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Update endpoint to match your backend API
      const queryString = params ? buildQueryString(params) : '';
      const response = await get<PaginatedResponse<Resource>>(`/resources?${queryString}`);

      set({
        resources: response.data,
        totalPages: response.meta.totalPages,
        currentPage: response.meta.currentPage,
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar recursos',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchResourceById: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Update endpoint to match your backend API
      const resource = await get<Resource>(`/resources/${id}`);

      set({
        currentResource: resource,
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al cargar el recurso',
        isLoading: false,
      });
      throw error;
    }
  },

  createResource: async (data) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Update endpoint to match your backend API
      const resource = await post<Resource, CreateResourceDTO>('/resources', data);

      // Add to the list
      set((state) => ({
        resources: [resource, ...state.resources],
        isLoading: false,
      }));

      return resource;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al crear recurso',
        isLoading: false,
      });
      throw error;
    }
  },

  updateResource: async (id, data) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Update endpoint to match your backend API
      const resource = await put<Resource, UpdateResourceDTO>(`/resources/${id}`, data);

      // Update in the list
      set((state) => ({
        resources: state.resources.map((r) => (r.id === id ? resource : r)),
        currentResource: state.currentResource?.id === id ? resource : state.currentResource,
        isLoading: false,
      }));

      return resource;
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al actualizar recurso',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteResource: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Update endpoint to match your backend API
      await del(`/resources/${id}`);

      // Remove from the list
      set((state) => ({
        resources: state.resources.filter((r) => r.id !== id),
        currentResource: state.currentResource?.id === id ? null : state.currentResource,
        isLoading: false,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.message || 'Error al eliminar recurso',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentResource: (resource) => set({ currentResource: resource }),

  clearError: () => set({ error: null }),
}));

/**
 * ============================================
 * USAGE EXAMPLE IN COMPONENTS:
 * ============================================
 *
 * import { useResourceStore } from '@/src/stores/useResourceStore';
 * import { useEffect } from 'react';
 * import { showToast } from '@/src/lib/toast';
 *
 * export default function ResourcesList() {
 *   const { resources, isLoading, error, fetchResources } = useResourceStore();
 *
 *   useEffect(() => {
 *     fetchResources({ page: 1, limit: 10 })
 *       .catch(() => showToast.error('Error al cargar recursos'));
 *   }, [fetchResources]);
 *
 *   if (isLoading) return <div>Cargando...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {resources.map(resource => (
 *         <div key={resource.id}>{resource.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 *
 * ============================================
 */
