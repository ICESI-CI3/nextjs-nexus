'use client';

import * as React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: 'bg-slate-500 hover:bg-slate-600',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" fullWidth disabled={isLoading}>
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
