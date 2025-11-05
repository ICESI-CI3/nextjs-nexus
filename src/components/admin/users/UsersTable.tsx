'use client';

import React from 'react';
// MODIFICACIÓN: Importar 'Role' junto con 'User'
import type { User, Role } from '@/src/lib/types';
import Button from '@/src/components/ui/Button';
import { Can } from '@/src/components/auth/Can';
import { formatDate } from '@/src/lib/utils';

interface UsersTableProps {
  /** The list of users to display */
  users: User[];
  // You can add functions for 'onEdit' and 'onDelete' later
}

/**
 * Renders a table of users with action buttons protected by permissions.
 */
export default function UsersTable({ users }: UsersTableProps) {
  /**
   * Helper function to format the list of roles
   */
  // MODIFICACIÓN: Tipar 'roles' explícitamente
  const formatRoles = (roles: Role[] | undefined) => {
    if (!roles || roles.length === 0) {
      return <span className="text-gray-500">No roles</span>;
    }
    // MODIFICACIÓN: Tipar 'role' explícitamente
    return roles.map((role: Role) => (
      <span
        key={role.id}
        className="me-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
      >
        {role.name}
      </span>
    ));
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Email
            </th>
            <th scope="col" className="px-6 py-3">
              Roles
            </th>
            <th scope="col" className="px-6 py-3">
              Joined
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b bg-white hover:bg-gray-50">
              <td className="px-6 py-4 font-medium whitespace-nowrap">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-6 py-4">{user.email}</td>
              {/* Esto ahora funciona porque 'user.roles' existe en 'User' (de types.ts) */}
              <td className="px-6 py-4">{formatRoles(user.roles)}</td>
              <td className="px-6 py-4">{formatDate(user.createdAt, 'short')}</td>
              <td className="flex space-x-2 px-6 py-4">
                {/* Edit button, protected by 'update_user' permission */}
                <Can permission="update_user">
                  <Button variant="secondary">
                    {' '}
                    {/* Changed to 'secondary' */}
                    Edit
                  </Button>
                </Can>

                {/* Delete button, protected by 'delete_user' permission */}
                <Can permission="delete_user">
                  <Button variant="ghost">
                    {' '}
                    {/* Changed to 'ghost' */}
                    Delete
                  </Button>
                </Can>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr className="border-b bg-white">
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
