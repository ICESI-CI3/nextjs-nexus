import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface FormSuccessProps {
  message?: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-top-1 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 duration-300',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <svg
          className="h-5 w-5 flex-shrink-0 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );
}

export default FormSuccess;
