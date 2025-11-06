'use client';

/**
 * Purchase Detail Page
 * Displays detailed information about a purchase including tickets with QR codes
 */

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePurchaseStore } from '@/src/stores/usePurchaseStore';
import Button from '@/src/components/ui/Button';
import { showToast } from '@/src/lib/toast';
import QRCode from 'qrcode';
import { TicketStatus } from '@/src/lib/types';

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.purchaseId as string;

  const { currentPurchase, isLoading, error, fetchPurchaseById, clearError } = usePurchaseStore();

  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    if (!purchaseId) return;

    // Fetch purchase details
    fetchPurchaseById(purchaseId).catch((err) => {
      showToast.error('Error al cargar la compra');
      console.error('Error fetching purchase:', err);
    });

    // Clean up
    return () => {
      clearError();
    };
  }, [purchaseId, fetchPurchaseById, clearError]);

  // Generate QR codes when purchase loads
  useEffect(() => {
    if (!currentPurchase?.tickets) {
      return;
    }

    currentPurchase.tickets.forEach((ticket) => {
      const canvas = qrRefs.current[ticket.id];
      if (canvas && ticket.ticketCode) {
        const codeString = String(ticket.ticketCode).trim();
        if (codeString.length > 0) {
          QRCode.toCanvas(canvas, codeString, {
            width: 200,
            margin: 2,
          }).catch((err) => {
            console.error('Error generating QR code:', err);
          });
        }
      }
    });
  }, [currentPurchase]);

  // Loading state
  if (isLoading || !currentPurchase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-gray-600">Cargando compra...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
          <h3 className="mb-2 text-xl font-semibold text-red-900">Error al cargar la compra</h3>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <Button onClick={() => router.push('/purchases/history')} variant="primary">
            Volver al historial
          </Button>
        </div>
      </div>
    );
  }

  const purchase = currentPurchase;
  const totalAmount = Number(purchase.totalAmount);

  // Format date
  const purchaseDate = new Date(purchase.purchaseDate);
  const formattedDate = purchaseDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = purchaseDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Status colors
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    FAILED: 'Fallida',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button onClick={() => router.push('/purchases/history')} variant="ghost" className="mb-6">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver al historial
        </Button>

        {/* Purchase info */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{purchase.event.title}</h1>
              <p className="text-sm text-gray-600">
                Compra realizada el {formattedDate} a las {formattedTime}
              </p>
            </div>
            <span
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${statusColors[purchase.status] || 'border-gray-200 bg-gray-100 text-gray-800'}`}
            >
              {statusLabels[purchase.status] || purchase.status}
            </span>
          </div>

          <div className="grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">ID de compra</p>
              <p className="font-mono text-sm font-medium text-gray-900">{purchase.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total pagado</p>
              <p className="text-lg font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Tus Tickets ({purchase.tickets.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchase.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                {/* QR Code */}
                <div className="mb-4 flex justify-center">
                  <canvas
                    ref={(el) => {
                      qrRefs.current[ticket.id] = el;
                    }}
                    className="rounded-md border border-gray-200"
                  />
                </div>

                {/* Ticket info */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Codigo de ticket</p>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {ticket.ticketCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Asiento</p>
                    <p className="text-sm font-medium text-gray-900">{ticket.seat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Precio</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${Number(ticket.price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estado</p>
                    <p
                      className={`text-sm font-medium ${ticket.status === TicketStatus.REDEEMED ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {ticket.status === TicketStatus.REDEEMED ? 'Validado (usado)' : 'Valido'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download info */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            Guarda estos tickets en tu telefono o imprímelos. Necesitaras mostrar el codigo QR en la
            entrada del evento.
          </p>
        </div>
      </div>
    </div>
  );
}
