// ==================== AUTH & USER TYPES (BASE) ====================

/**
 * User type - ADJUST THIS based on your NestJS backend response
 * This is just a base example - modify according to your API
 */
export interface User {
  id: string;
  email: string;
  twoFactorEnabled: boolean;
  // Add other fields that your backend returns
  [key: string]: unknown; // Allow additional properties
}

/**
 * Role type - ADJUST THIS based on your backend
 */
export interface Role {
  id: string;
  name: string;
  // Add permissions, description, etc. as needed
  [key: string]: unknown;
}

/**
 * Auth tokens structure - ADJUST THIS based on your backend
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string; // Optional if your backend uses it
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register data - ADJUST THIS based on your backend requirements
 */
export interface RegisterData {
  email: string;
  password: string;
  // Add username, firstName, lastName, etc. as needed by your backend
  [key: string]: unknown;
}

// ==================== API RESPONSE TYPES (GENERIC) ====================

/**
 * Standard API response wrapper
 * Adjust this to match your NestJS backend response structure
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated response structure
 * Adjust this to match your NestJS pagination structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination metadata
 * Adjust fields to match your backend pagination structure
 */
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

// ==================== QUERY PARAMETERS (GENERIC) ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface FilterParams {
  search?: string;
  [key: string]: unknown; // Allow any filter parameters
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// ==================== FORM TYPES (GENERIC) ====================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  validation?: unknown;
  options?: { label: string; value: string }[];
}

export interface FormError {
  field: string;
  message: string;
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// ==================== EVENT MANAGEMENT TYPES ====================

/**
 * Event Category
 */
export interface EventCategory {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Venue
 */
export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Ticket Type
 */
export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Event Status
 */
export type EventStatus = 'active' | 'inactive' | 'cancelled' | 'draft' | 'pre_sale';

/**
 * Event
 */
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  status: EventStatus;
  venue: Venue;
  category: EventCategory;
  ticketTypes: TicketType[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create Event DTO
 */
export interface CreateEventDTO {
  name: string;
  description: string;
  date: string;
  venueId: string;
  categoryId: string;
}

/**
 * Update Event DTO
 */
export interface UpdateEventDTO {
  name?: string;
  description?: string;
  date?: string;
  venueId?: string;
  categoryId?: string;
}

/**
 * Update Event Status DTO
 */
export interface UpdateEventStatusDTO {
  status: EventStatus;
}

/**
 * Create Ticket Type DTO
 */
export interface CreateTicketTypeDTO {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Update Ticket Type DTO
 */
export interface UpdateTicketTypeDTO {
  name?: string;
  price?: number;
  quantity?: number;
}

/**
 * Create Event Category DTO
 */
export interface CreateEventCategoryDTO {
  name: string;
  description: string;
}

/**
 * Update Event Category DTO
 */
export interface UpdateEventCategoryDTO {
  name?: string;
  description?: string;
}

/**
 * Create Venue DTO
 */
export interface CreateVenueDTO {
  name: string;
  address: string;
  capacity: number;
}

/**
 * Update Venue DTO
 */
export interface UpdateVenueDTO {
  name?: string;
  address?: string;
  capacity?: number;
}

// ==================== EXAMPLES - DOMAIN-SPECIFIC TYPES ====================

/**
 * IMPORTANT: The types below are just EXAMPLES for a ticketing system.
 * Delete these and create your own types based on YOUR backend API.
 *
 * Steps to create your types:
 * 1. Check your NestJS backend API responses
 * 2. Create interfaces that match the JSON structure
 * 3. Use the generic types above (ApiResponse, PaginatedResponse, etc.)
 */

/*
// Example: Event type (DELETE THIS and create your own)
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  // ... other fields from your backend
}

// Example: Ticket type (DELETE THIS and create your own)
export interface Ticket {
  id: string;
  eventId: string;
  code: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  // ... other fields from your backend
}

// Example: Create DTO (DELETE THIS and create your own)
export interface CreateEventDTO {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  // ... fields required by your backend
}
*/
