import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from './constants';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from './utils';
import type { ApiError } from './types';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Use debug level to avoid triggering error overlays/toasts in dev UIs
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        'DEBUG: Full error response from backend:',
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        statusCode: 0,
      } as ApiError);
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - Try to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getLocalStorage<string | null>(AUTH_CONFIG.REFRESH_TOKEN_KEY, null);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint (backend expects snake_case)
        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        // Backend returns { access_token, refresh_token }
        const { access_token, refresh_token: newRefreshToken } = response.data as {
          access_token: string;
          refresh_token: string;
        };

        // Save new tokens
        setLocalStorage(AUTH_CONFIG.TOKEN_KEY, access_token);
        setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh failed - clear auth data and redirect to login
        removeLocalStorage(AUTH_CONFIG.TOKEN_KEY);
        removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        removeLocalStorage(AUTH_CONFIG.USER_KEY);

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          statusCode: 401,
        } as ApiError);
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        message: error.response.data?.message || ERROR_MESSAGES.FORBIDDEN,
        statusCode: 403,
      } as ApiError);
    }

    // Handle 404 Not Found
    if (status === 404) {
      return Promise.reject({
        message: error.response.data?.message || ERROR_MESSAGES.NOT_FOUND,
        statusCode: 404,
      } as ApiError);
    }

    // Handle 422 Validation Error
    if (status === 422) {
      return Promise.reject({
        message: error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
        statusCode: 422,
        validationErrors: error.response.data?.validationErrors,
      } as ApiError);
    }

    // Handle 500+ Server Errors
    if (status >= 500) {
      return Promise.reject({
        message: error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR,
        statusCode: status,
      } as ApiError);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
        statusCode: 0,
      } as ApiError);
    }

    // Default error handling
    return Promise.reject({
      message: error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      statusCode: status,
      error: error.response.data?.error,
    } as ApiError);
  }
);

/**
 * Generic GET request
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

/**
 * Generic POST request
 */
export async function post<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

/**
 * Generic PUT request
 */
export async function put<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

/**
 * Generic PATCH request
 */
export async function patch<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
}

/**
 * Generic DELETE request
 */
export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}

/**
 * Upload file with multipart/form-data
 */
export async function uploadFile<T>(url: string, formData: FormData): Promise<T> {
  const response = await apiClient.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Set auth token in headers
 */
export function setAuthToken(token: string): void {
  setLocalStorage(AUTH_CONFIG.TOKEN_KEY, token);
}

/**
 * Remove auth token from headers
 */
export function removeAuthToken(): void {
  removeLocalStorage(AUTH_CONFIG.TOKEN_KEY);
  removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  removeLocalStorage(AUTH_CONFIG.USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null);
}

export default apiClient;
