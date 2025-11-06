// ==================== API CONFIGURATION ====================

export const API_CONFIG = {
  // Use same-origin '/api' by default and rely on Next.js rewrites to proxy to the backend.
  // Override with NEXT_PUBLIC_API_URL in environments where a direct URL is desired.
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
} as const;

// ==================== AUTH CONFIGURATION ====================

export const AUTH_CONFIG = {
  TOKEN_KEY: 'app_access_token',
  REFRESH_TOKEN_KEY: 'app_refresh_token',
  USER_KEY: 'app_user',
} as const;

// ==================== ROUTE PATHS ====================

/**
 * Application routes
 * Add your own routes as needed
 */
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_2FA: '/verify-2fa',

  // Protected routes - ADD YOUR ROUTES HERE
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETUP_2FA: '/profile/setup-2fa',

  // Admin routes (if needed)
  ADMIN: '/admin',

  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,

  // Admin event routes
  ADMIN_EVENTS: '/admin/events',
  ADMIN_EVENT_CREATE: '/admin/events/create',
  ADMIN_EVENT_EDIT: (id: string) => `/admin/events/${id}/edit`,
  ADMIN_EVENT_TICKETS: (id: string) => `/admin/events/${id}/tickets`,
  ADMIN_EVENT_DETAIL: (id: string) => `/admin/events/${id}`,

  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_VENUES: '/admin/venues',

  // Add more routes based on your application needs
  // Example: USERS: '/users',
  // Example: USER_DETAIL: (id: string) => `/users/${id}`,
} as const;

// ==================== PAGINATION ====================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  DEFAULT_LIMIT_OPTIONS: [5, 10, 20, 50, 100],
  MAX_LIMIT: 100,
} as const;

// ==================== VALIDATION ====================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
} as const;

// ==================== TOAST CONFIGURATION ====================

export const TOAST_CONFIG = {
  DURATION: 4000, // 4 seconds
  POSITION: 'top-right',
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de red. Por favor, verifica tu conexión.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  VALIDATION_ERROR: 'Error de validación. Por favor, verifica los datos.',
  TIMEOUT_ERROR: 'La solicitud ha tardado demasiado tiempo.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Inicio de sesión exitoso',
  LOGOUT: 'Sesión cerrada exitosamente',
  REGISTER: 'Registro exitoso',
  CREATE: 'Creado exitosamente',
  UPDATE: 'Actualizado exitosamente',
  DELETE: 'Eliminado exitosamente',
  SAVE: 'Guardado exitosamente',
} as const;

// ==================== SUCCESS MESSAGES ====================

// Event status labels
export const EVENT_STATUS_LABELS = {
  active: 'Activo',
  inactive: 'Inactivo',
  cancelled: 'Cancelado',
} as const;

// Event status colors (para badges)
export const EVENT_STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  cancelled: 'red',
} as const;

// ==================== EXAMPLE CONSTANTS ====================

/**
 * IMPORTANT: These are EXAMPLE constants for specific domains.
 * Delete or modify these according to YOUR application needs.
 */

/*
// Example: Roles (if your app uses role-based authorization)
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  // Add your roles here
} as const;

// Example: Permissions (if your app uses permission-based authorization)
export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  // Add your permissions here
} as const;

// Example: Status labels for UI
export const STATUS_LABELS = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PENDING: 'Pendiente',
  // Add your status labels here
} as const;

// Example: Status colors for UI
export const STATUS_COLORS = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  PENDING: 'yellow',
  // Add your status colors here
} as const;
*/
