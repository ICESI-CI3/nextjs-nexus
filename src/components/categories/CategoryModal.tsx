'use client';

import * as React from 'react';
import { toast } from 'react-hot-toast';
import { useCategoryStore } from '@/src/stores/useCategoryStore';
import type { EventCategory, CreateEventCategoryDTO } from '@/src/lib/types';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: EventCategory | null;
}

export default function CategoryModal({ isOpen, onClose, categoryToEdit }: CategoryModalProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const { createCategory, updateCategory, isLoading } = useCategoryStore();

  const isEditMode = Boolean(categoryToEdit);

  React.useEffect(() => {
    if (isEditMode && categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || '');
    } else {
      // Reset form for create mode
      setName('');
      setDescription('');
    }
  }, [isOpen, categoryToEdit, isEditMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    const categoryData: CreateEventCategoryDTO = {
      name,
      description,
    };

    try {
      if (isEditMode && categoryToEdit) {
        await updateCategory(categoryToEdit.id, categoryData);
        toast.success('Categoría actualizada con éxito');
      } else {
        await createCategory(categoryData);
        toast.success('Categoría creada con éxito');
      }
      onClose(); // Close modal on success
    } catch (err: unknown) {
      let errorMessage = isEditMode
        ? 'Error al actualizar la categoría'
        : 'Error al crear la categoría';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Categoría' : 'Crear Nueva Categoría'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={4}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
