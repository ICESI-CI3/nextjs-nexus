'use client';

import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary - Captura errores de React para evitar el overlay rojo de Next.js
 * Solo se usa para prevenir que errores no manejados rompan la UI
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error silently without breaking UI
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback or default message
      return (
        this.props.fallback || (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-800">
                Ocurrió un error inesperado. Por favor, recarga la página.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
