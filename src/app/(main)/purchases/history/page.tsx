'use client';

/**
 * Purchase History Page
 * Displays all purchases made by the user
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePurchaseStore } from '@/src/stores/usePurchaseStore';
import PurchaseHistoryItem from '@/src/components/purchases/PurchaseHistoryItem';
import Button from '@/src/components/ui/Button';
import { showToast } from '@/src/lib/toast';

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const { purchases, isLoading, error, fetchPurchases, clearError } = usePurchaseStore();

  useEffect(() => {
    // Fetch purchases on mount
    fetchPurchases().catch(() => {
      showToast.error('Error al cargar el historial de compras');
    });

    // Clean up error on unmount
    return () => {
      clearError();
    };
  }, [fetchPurchases, clearError]);

  // Loading state
  if (isLoading && (!purchases || purchases.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!purchases || purchases.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-red-900">Error al cargar historial</h3>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <Button onClick={() => fetchPurchases()} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!purchases || purchases.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Historial de Compras</h1>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No tienes compras aun</h3>
          <p className="mb-4 text-sm text-gray-600">Cuando realices una compra, aparecera aqui.</p>
          <Button onClick={() => router.push('/events')} variant="primary">
            Explorar eventos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Compras</h1>
            <p className="mt-1 text-sm text-gray-600">
              {purchases.length}{' '}
              {purchases.length === 1 ? 'compra realizada' : 'compras realizadas'}
            </p>
          </div>
          <Button onClick={() => router.push('/events')} variant="primary">
            Ver eventos
          </Button>
        </div>

        {/* Purchases list */}
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <PurchaseHistoryItem key={purchase.id} purchase={purchase} />
          ))}
        </div>
      </div>
    </div>
  );
}
