import * as React from 'react';
import { toast } from 'react-hot-toast';

interface SuspensionCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isLoading: boolean;
  statusType: 'SUSPENDED' | 'CANCELLED';
}

export default function SuspensionCancellationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  statusType,
}: SuspensionCancellationModalProps) {
  const [comment, setComment] = React.useState('');

  const handleConfirm = () => {
    if (!comment.trim()) {
      toast.error('El comentario es obligatorio para cambiar el estado del evento.');
      return;
    }
    onConfirm(comment);
  };

  if (!isOpen) return null;

  const title = statusType === 'SUSPENDED' ? 'Suspender Evento' : 'Cancelar Evento';
  const message =
    statusType === 'SUSPENDED'
      ? 'Por favor, proporciona un motivo para suspender este evento. Este comentario será visible para los asistentes.'
      : 'Por favor, proporciona un motivo para cancelar este evento. Este comentario será visible para los asistentes.';
  const confirmButtonText =
    statusType === 'SUSPENDED' ? 'Confirmar Suspensión' : 'Confirmar Cancelación';

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mb-4 text-slate-600">{message}</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="Ej: Evento pospuesto debido a condiciones climáticas..."
        ></textarea>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
