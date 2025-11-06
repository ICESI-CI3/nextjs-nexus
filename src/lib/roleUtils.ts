/**
 * Role utilities for multi-role system
 * Handles role priorities, redirections, and generic role filtering
 */

// ============================================
// CONSTANTS
// ============================================

/**
 * Generic system roles (roles genéricos del sistema)
 * Estos son los únicos roles que deben usarse para cambiar de vista
 */
export const GENERIC_ROLES = ['ADMINISTRATOR', 'ORGANIZER', 'BUYER', 'STAFF'] as const;

export type GenericRole = (typeof GENERIC_ROLES)[number];

/**
 * Role priority map - Higher priority = more privileges
 * Used to determine default role when user has multiple roles
 */
const ROLE_PRIORITY: Record<GenericRole, number> = {
  ADMINISTRATOR: 4,
  ORGANIZER: 3,
  BUYER: 2,
  STAFF: 1,
};

/**
 * Default redirections by role
 * Where users should be redirected after login or when switching roles
 */
const ROLE_REDIRECTS: Record<GenericRole, string> = {
  ADMINISTRATOR: '/admin',
  ORGANIZER: '/organizer/events',
  BUYER: '/events',
  STAFF: '/tickets/validate',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalizes a role name to uppercase
 */
function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

/**
 * Checks if a role is a generic system role
 */
export function isGenericRole(role: string): role is GenericRole {
  const normalized = normalizeRole(role);
  return GENERIC_ROLES.includes(normalized as GenericRole);
}

/**
 * Filters user roles to only include generic system roles
 * @param roles - Array of role names or role objects
 * @returns Array of generic role names
 */
export function filterGenericRoles(roles: string[] | { name: string }[]): GenericRole[] {
  // Handle both string[] and {name: string}[]
  const roleNames = roles.map((r) => (typeof r === 'string' ? r : r.name));

  return roleNames.filter(isGenericRole).map((r) => normalizeRole(r) as GenericRole);
}

/**
 * Gets the highest priority role from a list of roles
 * @param roles - Array of role names
 * @returns Highest priority generic role, or null if no generic roles found
 */
export function getHighestPriorityRole(roles: string[]): GenericRole | null {
  const genericRoles = filterGenericRoles(roles);

  if (genericRoles.length === 0) return null;

  // Sort by priority (descending) and return the first one
  const sorted = genericRoles.sort((a, b) => ROLE_PRIORITY[b] - ROLE_PRIORITY[a]);

  return sorted[0];
}

/**
 * Gets the redirect URL for a given role
 * @param role - Role name
 * @returns Redirect URL, or '/events' as fallback
 */
export function getRedirectByRole(role: string | null): string {
  if (!role) return '/events';

  const normalized = normalizeRole(role);

  if (isGenericRole(normalized)) {
    return ROLE_REDIRECTS[normalized as GenericRole];
  }

  return '/events';
}

/**
 * Determines which layout to use based on active role
 * @param activeRole - Current active role
 * @returns Layout name
 */
export function getLayoutByRole(
  activeRole: string | null
): 'admin' | 'organizer' | 'buyer' | 'staff' {
  if (!activeRole) return 'buyer'; // Default layout

  const normalized = normalizeRole(activeRole);

  switch (normalized) {
    case 'ADMINISTRATOR':
      return 'admin';
    case 'ORGANIZER':
      return 'organizer';
    case 'BUYER':
      return 'buyer';
    case 'STAFF':
      return 'staff';
    default:
      return 'buyer';
  }
}

/**
 * Determines which role should be active based on the current route
 * This is used for auto-switching role when user navigates to a protected route
 * @param pathname - Current route pathname
 * @param userRoles - User's available roles
 * @returns Suggested active role, or null if no match
 */
export function suggestRoleByRoute(pathname: string, userRoles: string[]): GenericRole | null {
  const genericRoles = filterGenericRoles(userRoles);

  // Admin routes
  if (pathname.startsWith('/admin')) {
    return genericRoles.includes('ADMINISTRATOR') ? 'ADMINISTRATOR' : null;
  }

  // Organizer routes
  if (pathname.startsWith('/organizer')) {
    return genericRoles.includes('ORGANIZER') ? 'ORGANIZER' : null;
  }

  // Staff routes
  if (pathname.startsWith('/tickets/validate')) {
    return genericRoles.includes('STAFF') ? 'STAFF' : null;
  }

  // Buyer routes
  if (pathname.startsWith('/purchases') || pathname.startsWith('/cart')) {
    return genericRoles.includes('BUYER') ? 'BUYER' : null;
  }

  // No specific role needed for this route
  return null;
}
