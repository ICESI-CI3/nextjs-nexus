import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import { VALIDATION } from './constants';
import type { PaginationMeta, QueryParams } from './types';

// ==================== CLASSNAMES UTILITY ====================

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== VALIDATION SCHEMAS ====================

/**
 * Base authentication schemas
 * Modify these according to your backend requirements
 */
export const authSchemas = {
  login: z.object({
    email: z.string().email('Email inválido').max(VALIDATION.EMAIL_MAX_LENGTH),
    password: z
      .string()
      .min(
        VALIDATION.PASSWORD_MIN_LENGTH,
        `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`
      )
      .max(VALIDATION.PASSWORD_MAX_LENGTH),
  }),

  register: z.object({
    firstName: z.string().min(1, 'El nombre es requerido').max(50),
    lastName: z.string().min(1, 'El apellido es requerido').max(50),
    email: z.string().email('Email inválido').max(255),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(50)
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un símbolo'),
  }),
};

/**
 * Schemas for User management
 */
export const userSchemas = {
  // Schema for creating a new user
  create: z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email').max(VALIDATION.EMAIL_MAX_LENGTH),
    password: z
      .string()
      .min(
        VALIDATION.PASSWORD_MIN_LENGTH,
        `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
      )
      .max(VALIDATION.PASSWORD_MAX_LENGTH),
    roleIds: z.array(z.string()).min(1, 'At least one role is required'),
  }),

  // Schema for updating an existing user
  update: z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email').max(VALIDATION.EMAIL_MAX_LENGTH),
    // Password is optional on update
    password: z.string().optional().or(z.literal('')),
    roleIds: z.array(z.string()).min(1, 'At least one role is required'),
  }),
};

// ==================== DATE UTILITIES ====================

/**
 * Format a date string to a readable format
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'Fecha inválida';

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : format === 'time'
        ? { hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

  return d.toLocaleDateString('es-ES', options);
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * Get relative time (e.g., "hace 2 horas")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace unos segundos';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 604800)} semanas`;
  if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
  return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
}

// ==================== CURRENCY UTILITIES ====================

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ==================== STRING UTILITIES ====================

/**
 * Truncate a string to a specified length
 */
export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ==================== PAGINATION UTILITIES ====================

/**
 * Build pagination metadata from API response
 */
export function buildPaginationMeta(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Build query string from params
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Get page range for pagination UI
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxPages: number = 5
): number[] {
  const half = Math.floor(maxPages / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxPages - 1);

  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ==================== ARRAY UTILITIES ====================

/**
 * Chunk an array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ==================== ERROR UTILITIES ====================

/**
 * Extract error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Ha ocurrido un error desconocido';
}

/**
 * Format Zod validation errors
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  errors.issues.forEach((issue) => {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  });
  return formatted;
}

// ==================== LOCAL STORAGE UTILITIES ====================

/**
 * Get item from localStorage with type safety
 * @param key - localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Parsed value or default
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = window.localStorage.getItem(key);

    if (item === null) return defaultValue;

    // Si es un string simple (como tokens JWT), devolverlo directamente
    // Los tokens empiezan con "eyJ" típicamente
    if (typeof defaultValue === 'string' && item.startsWith('eyJ')) {
      return item as T;
    }

    // Intentar parsear como JSON para objetos
    try {
      return JSON.parse(item) as T;
    } catch {
      // Si falla el parse, devolver como string
      return item as T;
    }
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// ==================== DEBOUNCE/THROTTLE ====================

/**
 * Debounce function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
