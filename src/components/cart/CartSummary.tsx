/**
 * Cart Summary Component
 * Displays cart total and checkout actions
 */

import type { Cart } from '@/src/lib/types';
import { useCartStore } from '@/src/stores/useCartStore';
import Button from '@/src/components/ui/Button';
import { showToast } from '@/src/lib/toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const router = useRouter();
  const { checkout, checkoutMercadoPago } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);

  const totalAmount = Number(cart.totalAmount);

  const handleMercadoPagoCheckout = async () => {
    setIsProcessing(true);
    try {
      const preference = await checkoutMercadoPago(cart.id);
      showToast.success('Redirigiendo a MercadoPago...');
      // Redirect to MercadoPago checkout
      // Use sandboxInitPoint for testing, initPoint for production
      const checkoutUrl = preference.sandboxInitPoint || preference.initPoint;
      window.location.href = checkoutUrl;
    } catch {
      showToast.error('Error al crear preferencia de pago');
      setIsProcessing(false);
    }
  };

  const handleDirectCheckout = async () => {
    setIsDirectCheckout(true);
    try {
      const purchase = await checkout(cart.id);
      showToast.success('Compra realizada exitosamente');
      // Redirect to purchase details or purchases list
      router.push(`/purchases/${purchase.id}`);
    } catch {
      showToast.error('Error al procesar la compra');
      setIsDirectCheckout(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900">Resumen del pedido</h3>

      {/* Event info */}
      <div className="mb-4 rounded-md bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-700">Evento</p>
        <p className="text-sm font-semibold text-slate-900">{cart.event.title}</p>
      </div>

      {/* Items count */}
      <div className="mb-2 flex justify-between">
        <span className="text-sm text-slate-600">Items</span>
        <span className="text-sm font-medium text-slate-900">
          {cart.items.reduce((sum, item) => sum + item.quantity, 0)} tickets
        </span>
      </div>

      {/* Total */}
      <div className="mb-6 flex justify-between border-t border-slate-200 pt-4">
        <span className="text-lg font-bold text-slate-900">Total</span>
        <span className="text-lg font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
      </div>

      {/* Checkout buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleMercadoPagoCheckout}
          disabled={isProcessing || isDirectCheckout || cart.items.length === 0}
          variant="primary"
          fullWidth
        >
          {isProcessing ? 'Procesando...' : 'Proceder al pago'}
        </Button>

        <Button
          onClick={handleDirectCheckout}
          disabled={isProcessing || isDirectCheckout || cart.items.length === 0}
          variant="secondary"
          fullWidth
        >
          {isDirectCheckout ? 'Procesando...' : 'Pago directo (sin pasarela)'}
        </Button>
      </div>

      {/* Info text */}
      <p className="mt-4 text-xs text-slate-500">
        Al finalizar la compra, se generaran tus tickets electronicos.
      </p>
    </div>
  );
}
