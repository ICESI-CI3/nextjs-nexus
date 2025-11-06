'use client';

import * as React from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';
import { validateTicket } from '@/src/services/ticketService';
import { TicketStatus, type Ticket } from '@/src/lib/types';

type ValidationMode = 'scanner' | 'manual';

type ValidationResult = {
  success: boolean;
  ticket?: Ticket;
  error?: string;
};

export default function TicketValidationForm() {
  const [mode, setMode] = React.useState<ValidationMode>('scanner');
  const [manualCode, setManualCode] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [result, setResult] = React.useState<ValidationResult | null>(null);
  const [error, setError] = React.useState<string>('');

  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const isRunningRef = React.useRef(false);

  // Cleanup on page unload/reload
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Force stop all video streams before page unload
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        const videos = qrReaderElement.querySelectorAll('video');
        videos.forEach((video) => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach((track) => {
              track.stop();
              track.enabled = false;
            });
            video.srcObject = null;
          }
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle ticket validation
  const handleValidation = async (ticketCode: string) => {
    if (!ticketCode.trim()) {
      setError('Por favor ingresa un código de ticket');
      return;
    }

    setIsValidating(true);
    setError('');
    setResult(null);

    try {
      const ticket = await validateTicket(ticketCode.trim());
      setResult({
        success: true,
        ticket,
      });
      setManualCode('');
    } catch (err) {
      const error = err as {
        message?: string;
        response?: { data?: { message?: string | string[] }; status?: number };
      };

      let errorMessage = 'Error al validar el ticket';

      if (error.response?.status === 404) {
        errorMessage = 'Ticket no encontrado';
      } else if (error.response?.status === 400) {
        const msg = error.response.data?.message;
        errorMessage = Array.isArray(msg) ? msg[0] : msg || 'Ticket ya validado anteriormente';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle manual validation
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleValidation(manualCode);
  };

  // Cleanup scanner on unmount or mode change
  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isComponentMounted = true;

    const stopAllVideoStreams = () => {
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        const videos = qrReaderElement.querySelectorAll('video');
        videos.forEach((video) => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach((track) => {
              track.stop();
              track.enabled = false;
            });
            video.srcObject = null;
          }
        });
        qrReaderElement.innerHTML = '';
      }
    };

    const startScanner = async () => {
      // Prevent starting scanner if component is already unmounted
      if (!isComponentMounted) return;

      try {
        setError('');
        setResult(null);

        // Stop any existing scanner first
        if (scannerRef.current && isRunningRef.current) {
          isRunningRef.current = false;
          await scannerRef.current.stop().catch(() => {});
          scannerRef.current.clear();
        }

        // Stop all video streams
        stopAllVideoStreams();

        // Small delay to ensure cleanup completes
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check again if component is still mounted
        if (!isComponentMounted) return;

        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText: string) => {
            // Stop scanner and validate ticket
            if (html5QrCode && isRunningRef.current && isComponentMounted) {
              isRunningRef.current = false;
              await html5QrCode.stop().catch(() => {});
              stopAllVideoStreams();
              await handleValidation(decodedText);
            }
          },
          () => {
            // Ignore decode errors
          }
        );

        if (isComponentMounted) {
          isRunningRef.current = true;
          setIsScanning(true);
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        if (isComponentMounted) {
          setError('No se pudo iniciar la cámara. Verifica los permisos.');
          isRunningRef.current = false;
          setIsScanning(false);
        }
      }
    };

    if (mode === 'scanner') {
      startScanner();
    } else {
      // If switching away from scanner mode, clean up immediately
      stopAllVideoStreams();
      setIsScanning(false);
    }

    // Cleanup function - runs when component unmounts or mode changes
    return () => {
      isComponentMounted = false;

      const cleanup = async () => {
        if (html5QrCode && isRunningRef.current) {
          isRunningRef.current = false;
          try {
            await html5QrCode.stop();
            html5QrCode.clear();
          } catch (err) {
            console.error('Error stopping scanner:', err);
          }
        }

        // Always stop video streams on cleanup
        stopAllVideoStreams();
        scannerRef.current = null;
        setIsScanning(false);
      };

      cleanup();
    };
  }, [mode]);

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('scanner')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'scanner'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg
            className="mx-auto mb-1 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          Escanear QR
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg
            className="mx-auto mb-1 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Entrada Manual
        </button>
      </div>

      {/* Scanner Mode */}
      {mode === 'scanner' && (
        <div className="space-y-4">
          <div id="qr-reader" className="overflow-hidden rounded-lg border-2 border-slate-200" />
          {isScanning && (
            <p className="text-center text-sm text-slate-600">
              Apunta la cámara al código QR del ticket
            </p>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticketCode" className="block text-sm font-medium text-slate-700">
              Código del Ticket
            </label>
            <input
              type="text"
              id="ticketCode"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ingresa el código del ticket"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              disabled={isValidating}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isValidating || !manualCode.trim()}
            className="w-full"
          >
            {isValidating ? 'Validando...' : 'Validar Ticket'}
          </Button>
        </form>
      )}

      {/* Error Message */}
      {error && <FormError message={error} />}

      {/* Validation Result */}
      {result && (
        <div
          className={`rounded-lg border-2 p-4 ${
            result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`shrink-0 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}
              >
                {result.success ? 'Ticket Válido' : 'Validación Fallida'}
              </h3>
              {result.success && result.ticket && (
                <div className="mt-2 space-y-1 text-sm text-green-800">
                  <p>
                    <span className="font-medium">Código:</span> {result.ticket.ticketCode}
                  </p>
                  <p>
                    <span className="font-medium">Asiento:</span> {result.ticket.seat}
                  </p>
                  <p>
                    <span className="font-medium">Precio:</span> $
                    {typeof result.ticket.price === 'number'
                      ? result.ticket.price.toLocaleString()
                      : result.ticket.price}
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span>{' '}
                    {result.ticket.status === TicketStatus.REDEEMED
                      ? 'Ya validado'
                      : 'Validado ahora'}
                  </p>
                </div>
              )}
              {!result.success && <p className="mt-1 text-sm text-red-800">{result.error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {result && (
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => {
            setResult(null);
            setError('');
            setManualCode('');
            // Force scanner restart by toggling mode
            if (mode === 'scanner') {
              setMode('manual');
              setTimeout(() => setMode('scanner'), 100);
            }
          }}
          className="w-full"
        >
          Validar Otro Ticket
        </Button>
      )}
    </div>
  );
}
