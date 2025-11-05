'use client';

/**
 * Shopping Cart Page
 * Displays all user's shopping carts
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/stores/useCartStore';
import CartItem from '@/src/components/cart/CartItem';
import CartSummary from '@/src/components/cart/CartSummary';
import Button from '@/src/components/ui/Button';
import { showToast } from '@/src/lib/toast';

export default function CartPage() {
  const router = useRouter();
  const { carts, isLoading, error, fetchCarts, clearCart, clearError } = useCartStore();

  useEffect(() => {
    // Fetch carts on mount
    fetchCarts().catch(() => {
      showToast.error('Error al cargar los carritos');
    });

    // Clean up error on unmount
    return () => {
      clearError();
    };
  }, [fetchCarts, clearError]);

  // Loading state
  if (isLoading && (!carts || carts.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!carts || carts.length === 0)) {
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
          <h3 className="mb-2 text-xl font-semibold text-red-900">Error al cargar el carrito</h3>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <Button onClick={() => fetchCarts()} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!carts || carts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Carrito de Compras</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-slate-900">Tu carrito esta vacio</h3>
          <p className="mb-4 text-sm text-slate-600">Agrega tickets a tu carrito para continuar.</p>
          <Button onClick={() => router.push('/events')} variant="primary">
            Ver eventos
          </Button>
        </div>
      </div>
    );
  }

  const handleClearCart = async (cartId: string) => {
    if (!confirm('Seguro que deseas vaciar este carrito?')) {
      return;
    }

    try {
      await clearCart(cartId);
      showToast.success('Carrito vaciado exitosamente');
    } catch {
      showToast.error('Error al vaciar el carrito');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Carrito de Compras</h1>
          <Button onClick={() => router.push('/events')} variant="ghost">
            Seguir comprando
          </Button>
        </div>

        {/* Carts */}
        <div className="space-y-6">
          {carts.map((cart) => (
            <div
              key={cart.id}
              className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-3"
            >
              {/* Cart items - 2/3 width */}
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">{cart.event.title}</h2>
                  <button
                    onClick={() => handleClearCart(cart.id)}
                    className="text-sm text-red-600 transition-colors hover:text-red-700"
                  >
                    Vaciar carrito
                  </button>
                </div>

                {cart.items.length === 0 ? (
                  <p className="text-sm text-slate-600">No hay items en este carrito</p>
                ) : (
                  <div>
                    {cart.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Cart summary - 1/3 width */}
              <div className="lg:col-span-1">
                <CartSummary cart={cart} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
