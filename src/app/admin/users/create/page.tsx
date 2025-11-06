'use client';

import AdminCreateUserForm from '@/src/components/admin/AdminCreateUserForm';
import { useRequireRole } from '@/src/hooks/useRequireRole';

export default function AdminCreateUserPage() {
  const { isLoading, isAuthorized } = useRequireRole('ADMINISTRATOR');

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <AdminCreateUserForm />;
}
