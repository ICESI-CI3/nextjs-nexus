'use client';

import React, { useState, useEffect } from 'react';
import { useRequireRole } from '@/src/hooks/useRequireRole';
import { Can } from '@/src/components/auth/Can';
import Button from '@/src/components/ui/Button';
import userService from '@/src/services/userService';
import type { User } from '@/src/lib/types';
import UsersTable from '@/src/components/admin/users/UsersTable';

/**
 * Admin page for managing users.
 * This page is protected and only accessible by users with the 'ADMINISTRATOR' role.
 */
export default function AdminUsersPage() {
  // 1. Protect the page: Only 'ADMINISTRATOR' can access
  // (This role name comes from your backend seed script)
  const { isLoading, isAuthorized } = useRequireRole('ADMINISTRATOR');

  // 2. State to hold the list of users
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 3. Fetch users when the component mounts and authorization is confirmed
  useEffect(() => {
    // Only fetch data if the user is authorized
    if (isAuthorized) {
      const fetchUsers = async () => {
        try {
          setIsDataLoading(true);
          // Fetch the first page of users (you can add pagination later)
          const response = await userService.getUsers({ page: 1, limit: 10 });
          setUsers(response.data);
          setError(null);
        } catch (err) {
          setError('Failed to fetch users.');
          console.error(err);
        } finally {
          setIsDataLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isAuthorized]); // Re-run if authorization status changes

  // 4. Show a loading state while checking auth or fetching data
  if (isLoading || isDataLoading) {
    return <div>Loading...</div>; // You can replace this with a loading skeleton
  }

  // 5. If not authorized, the hook will have already redirected,
  // but we can add a fallback.
  if (!isAuthorized) {
    return <div>Access Denied.</div>;
  }

  // 6. Render the page
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>

        {/* Show "Create" button only if user has 'create_user' permission */}
        <Can permission="create_user">
          <Button>Create New User</Button>
        </Can>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Pass the fetched users to the table component */}
      <UsersTable users={users} />
    </div>
  );
}
