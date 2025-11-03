import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-top-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 duration-300',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <svg
          className="h-5 w-5 flex-shrink-0 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );
}

export default FormError;
