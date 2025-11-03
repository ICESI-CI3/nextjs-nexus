'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

export default function Button({
  className,
  variant = 'primary',
  fullWidth,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed h-10 px-4 py-2';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-400',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-300',
    ghost: 'bg-transparent text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-300',
  };

  return (
    <button
      className={cn(base, variants[variant], fullWidth && 'w-full', className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
