'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
};

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-400',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-300',
    ghost: 'bg-transparent text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400',
    neutral: 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus-visible:ring-gray-200',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    md: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
