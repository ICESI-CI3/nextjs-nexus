import type { User } from './types';

/**
 * Permission names - should match backend PermissionEnum
 */
export const PERMISSIONS = {
  // User management
  CREATE_USER: 'CREATE_USER',
  VIEW_USERS: 'VIEW_USERS',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',

  // Event management
  CREATE_EVENT: 'CREATE_EVENT',
  VIEW_EVENTS: 'VIEW_EVENTS',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',

  // Add more as needed
} as const;

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.roles) return false;

  return user.roles.some((role) => role.permissions?.some((p) => p.name === permission));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.roles) return false;

  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.roles) return false;

  return permissions.every((permission) => hasPermission(user, permission));
}
