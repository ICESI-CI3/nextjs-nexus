'use client';

import React from 'react';
import { useCan } from '@/src/hooks/useAuth'; // Import our new hook from Step 3

interface CanProps {
  /**
   * The name of the permission required to render the children.
   * (e.g., "manage_users")
   */
  permission: string;
  /**
   * The elements to render if the user has the required permission.
   */
  children: React.ReactNode;
}

/**
 * A component that renders its children only if the authenticated
 * user has the specified permission.
 *
 * It uses the highly optimized `useCan` hook.
 */
export const Can: React.FC<CanProps> = ({ permission, children }) => {
  // 1. Use our optimized hook from Step 3
  const can = useCan(permission);

  // 2. If the user does not have the permission, render nothing (null)
  if (!can) {
    return null;
  }

  // 3. If the user has the permission, render the children
  return <>{children}</>;
};
