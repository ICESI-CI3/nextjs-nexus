'use client';

import * as React from 'react';
import { z } from 'zod';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import { cn, formatZodErrors, formatCurrency } from '@/src/lib/utils';
import { showToast } from '@/src/lib/toast';
import { useEventStore } from '@/src/stores/useEventStore';
import type { TicketType } from '@/src/lib/types';

const ticketSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),

  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),

  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),

  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
});

interface TicketTypeManagerProps {
  eventId: string;

  tickets: TicketType[];
}

export default function TicketTypeManager({ eventId, tickets = [] }: TicketTypeManagerProps) {
  const { createTicketType, updateTicketType, deleteTicketType } = useEventStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [editingTicket, setEditingTicket] = React.useState<TicketType | null>(null);

  const [deleteTicketId, setDeleteTicketId] = React.useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [values, setValues] = React.useState({
    name: '',

    description: '',

    price: 0,

    quantity: 0,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleOpenModal = (ticket?: TicketType) => {
    if (ticket) {
      setEditingTicket(ticket);

      setValues({
        name: ticket.name,

        description: ticket.description || '',

        price: Number(ticket.price),

        quantity: ticket.quantity,
      });
    } else {
      setEditingTicket(null);

      setValues({ name: '', description: '', price: 0, quantity: 0 });
    }

    setErrors({});

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setEditingTicket(null);

    setValues({ name: '', description: '', price: 0, quantity: 0 });

    setErrors({});
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const parse = ticketSchema.safeParse(values);

    if (!parse.success) {
      setErrors(formatZodErrors(parse.error));

      return;
    }

    try {
      setIsSubmitting(true);

      if (editingTicket) {
        await updateTicketType(eventId, editingTicket.id, parse.data);

        showToast.success('Tipo de ticket actualizado');
      } else {
        await createTicketType(eventId, parse.data);

        showToast.success('Tipo de ticket creado');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error caught in component:', error);

      showToast.error('Error al guardar el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTicketId) return;

    try {
      setIsSubmitting(true);

      await deleteTicketType(eventId, deleteTicketId);

      showToast.success('Tipo de ticket eliminado');

      setDeleteTicketId(null);
    } catch (error) {
      console.error('Error caught in component:', error);

      showToast.error('Error al eliminar el ticket');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Tipos de Tickets</h3>

        <Button onClick={() => handleOpenModal()}>Agregar Ticket</Button>
      </div>

      {/* Tickets List */}

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">No hay tipos de tickets configurados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{ticket.name}</h4>

                <p className="text-sm text-slate-600">{ticket.description}</p>

                <p className="text-sm text-slate-600">
                  {formatCurrency(Number(ticket.price))} • {ticket.quantity} disponibles
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleOpenModal(ticket)} variant="secondary" size="sm">
                  Editar
                </Button>

                <Button
                  onClick={() => setDeleteTicketId(ticket.id)}
                  variant="secondary"
                  size="sm"
                  className="border-red-300 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-300"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTicket ? 'Editar Ticket' : 'Crear Ticket'}
      >
        <form onSubmit={handleSubmitModal} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Nombre
            </label>

            <input
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className={cn(
                'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
              )}
            />

            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Descripción
            </label>

            <input
              id="description"
              name="description"
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
              className={cn(
                'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
              )}
            />

            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">
              Precio
            </label>

            <input
              id="price"
              name="price"
              type="number"
              value={values.price}
              onChange={(e) => setValues({ ...values, price: Number(e.target.value) })}
              className={cn(
                'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
                errors.price
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
              )}
            />

            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">
              Cantidad
            </label>

            <input
              id="quantity"
              name="quantity"
              type="number"
              value={values.quantity}
              onChange={(e) => setValues({ ...values, quantity: Number(e.target.value) })}
              className={cn(
                'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:outline-none',
                errors.quantity
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-slate-600 focus:ring-slate-600'
              )}
            />

            {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}

      <ConfirmDialog
        isOpen={!!deleteTicketId}
        onClose={() => setDeleteTicketId(null)}
        onConfirm={handleDelete}
        title="Eliminar Ticket"
        message="¿Estás seguro de eliminar este tipo de ticket? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
