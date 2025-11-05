// ==================== ENUMS ====================

/**
 * Event status enum - matches backend EventStatus
 */
export enum EventStatus {
  DRAFT = 'DRAFT',
  PRE_SALE = 'PRE_SALE',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
}

/**
 * Purchase status enum - matches backend PurchaseStatus
 */
export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

/**
 * Payment status enum - matches backend PaymentStatus
 */
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROCESS = 'in_process',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// ==================== CORE ENTITIES ====================

/**
 * User type - matches backend ResponseUserDto
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  twoFactorEnabled?: boolean;
  createdAt: Date | string;
  roleIds: string[];
}

/**
 * Role type - matches backend ResponseRoleDto
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
}

/**
 * Permission type
 */
export interface Permission {
  id: string;
  name: string;
  description?: string;
}

/**
 * Venue type - matches backend ResponseVenueDto
 */
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  maxCapacity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Event category type - matches backend ResponseEventCategoryDto
 */
export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Event type - matches backend ResponseEventDto
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  status: EventStatus;
  category: EventCategory;
  venue: Venue;
  ticketTypes?: TicketType[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== TICKET TYPES ====================

/**
 * Ticket type - matches backend ResponseTicketDto
 */
export interface Ticket {
  id: string;
  ticketCode: string;
  price: number | string; // Can be string due to PostgreSQL decimal conversion
  seat: string;
  isValidated: boolean;
}

/**
 * Ticket type (category) - matches backend ResponseTicketTypeDto
 */
export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number | string; // Can be string due to PostgreSQL decimal conversion
  quantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== CART TYPES ====================

/**
 * Cart item type - matches backend ResponseCartItemDto
 */
export interface CartItem {
  id: string;
  ticketType: TicketType;
  quantity: number;
  unitPrice: number | string; // Can be string due to PostgreSQL decimal conversion
  subtotal: number | string; // Can be string due to PostgreSQL decimal conversion
  addedAt: Date | string;
}

/**
 * Cart type - matches backend ResponseCartDto
 */
export interface Cart {
  id: string;
  event: Event;
  items: CartItem[];
  totalAmount: number | string; // Can be string due to PostgreSQL decimal conversion
  expiresAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== PURCHASE TYPES ====================

/**
 * Purchase type - matches backend ResponsePurchaseDto
 */
export interface Purchase {
  id: string;
  totalAmount: number | string; // Can be string due to PostgreSQL decimal conversion
  status: PurchaseStatus;
  purchaseDate: Date | string;
  event: Event;
  tickets: Ticket[];
}

// ==================== PAYMENT TYPES ====================

/**
 * Payment preference response - matches backend ResponsePreferenceDto
 */
export interface PaymentPreference {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  cartId: string;
}

/**
 * Payment type
 */
export interface Payment {
  id: string;
  mpPaymentId: string;
  mpPreferenceId: string;
  mpMerchantOrderId: string;
  amount: number | string; // Can be string due to PostgreSQL decimal conversion
  status: PaymentStatus;
  paymentMethod: string;
  paymentType: string;
  statusDetail: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== AUTH TYPES ====================

/**
 * Auth tokens structure
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register data
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
}

// ==================== DTO TYPES (CREATE/UPDATE) ====================

/**
 * Add to cart DTO - matches backend AddToCartDto
 */
export interface AddToCartDto {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

/**
 * Update cart item DTO
 */
export interface UpdateCartItemDto {
  quantity: number;
}

/**
 * Create purchase DTO - matches backend CreatePurchaseDto
 */
export interface CreatePurchaseDto {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

// ==================== API RESPONSE TYPES (GENERIC) ====================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination metadata
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
  [key: string]: unknown;
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

// ==================== EVENT MANAGEMENT DTOs ====================

/**
 * Create Event DTO
 */
export interface CreateEventDTO {
  title: string;
  description: string;
  date: string;
  venueId: string;
  categoryId: string;
}

/**
 * Update Event DTO
 */
export interface UpdateEventDTO {
  title?: string;
  description?: string;
  date?: string;
  venueId?: string;
  categoryId?: string;
  status?: EventStatus;
}

/**
 * Create Ticket Type DTO
 */
export interface CreateTicketTypeDTO {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

/**
 * Update Ticket Type DTO
 */
export interface UpdateTicketTypeDTO {
  name?: string;
  description?: string;
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
  city: string;
  maxCapacity: number;
}

/**
 * Update Venue DTO
 */
export interface UpdateVenueDTO {
  name?: string;
  address?: string;
  city?: string;
  maxCapacity?: number;
}
