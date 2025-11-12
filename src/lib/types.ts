// ==================== ENUMS ====================

/**
 * Event status enum - matches backend EventStatus
 */
export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
}

/**
 * Ticket status enum - matches backend TicketStatus
 */
export enum TicketStatus {
  NOT_REDEEMED = 'NOT_REDEEMED',
  REDEEMED = 'REDEEMED',
  PENDING_REFUND = 'PENDING_REFUND',
  REFUNDED = 'REFUNDED',
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
 * Role type - matches backend ResponseRoleDto
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissionIds?: string[]; // Optional when coming from backend with full permissions
  isGeneric?: boolean; // <- visible en lecturas, NO se envía
  permissions?: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * User type - matches backend ResponseUserDto and ProfileResponseDto
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  twoFactorEnabled?: boolean;
  createdAt: Date | string;
  roleIds: string[];
  roles?: Role[];
  isBlocked?: boolean;
  isBloqued?: boolean;
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
  statusLogs?: string[];
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
  status: TicketStatus;
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
 * Payment preference response - matches backend ResponsePreferenceDto (Stripe)
 */
export interface PaymentPreference {
  paymentLinkId: string; // Stripe session ID
  checkoutUrl: string; // URL to redirect user to Stripe checkout
  cartId: string;
  provider: string; // "stripe"
}

/**
 * Payment type (Stripe)
 */
export interface Payment {
  id: string;
  paymentProviderId: string; // Stripe session ID
  preferenceId?: string; // Also the session ID
  merchantOrderId?: string; // Payment Intent ID
  paymentProvider?: string; // "stripe"
  amount: number | string; // Can be string due to PostgreSQL decimal conversion
  status: PaymentStatus;
  paymentMethod?: string; // "card", etc.
  paymentType?: string; // "checkout_session"
  statusDetail?: string; // "paid", "unpaid"
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

export interface Permission {
  id: string;
  name: string;
  code: string; // p.ej. 'READ_USER', 'UPDATE_EVENT'
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

/**
 * DTO (Data Transfer Object) for creating a new user.
 * Based on the backend's create-user.dto.ts.
 */
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional if creation/invitation doesn't require a password
  roleIds?: string[]; // IDs of the roles to assign
  isBlocked?: boolean;
  isBloqued?: boolean;
}

/**
 * DTO for updating an existing user.
 * Based on the backend's update-user.dto.ts.
 * All fields are optional.
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string; // To reset the password
  roleIds?: string[]; // To update the list of roles
  isBlocked?: boolean;
  isBloqued?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
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
 * Update Event Status DTO
 */
export interface UpdateEventStatusDTO {
  status: EventStatus;
  comment?: string;
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
