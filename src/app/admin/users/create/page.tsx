'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminCreateUserForm from '@/src/components/admin/AdminCreateUserForm';
import useAuth from '@/src/hooks/useAuth';
import { ROUTES } from '@/src/lib/constants';
import { hasPermission, PERMISSIONS } from '@/src/lib/permissions';

export default function AdminCreateUserPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If no user, redirect to login
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Check if user has CREATE_USER permission
    if (!hasPermission(user, PERMISSIONS.CREATE_USER)) {
      router.push(ROUTES.DASHBOARD);
      return;
    }
  }, [user, isLoading, router]);

  // Show loading while checking permissions
  if (isLoading || !user || !hasPermission(user, PERMISSIONS.CREATE_USER)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return <AdminCreateUserForm />;
}
