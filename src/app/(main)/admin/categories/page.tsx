'use client';

import * as React from 'react';
import CategoryList from '@/src/components/categories/CategoryList';
import useRequireAuth from '@/src/hooks/useRequireAuth';

export default function AdminCategoriesPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <CategoryList />
    </div>
  );
}
