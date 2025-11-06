'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { useRequireRole } from '@/src/hooks/useRequireRole';
import { Can } from '@/src/components/auth/Can';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import UserCreateForm from '@/src/components/admin/users/UserCreateForm';

import userService from '@/src/services/userService';
import type { User, Role } from '@/src/lib/types';

import UsersTable from '@/src/components/admin/users/UsersTable';
import UserForm from '@/src/components/admin/users/UserForm';

function hasDataArray<T>(v: unknown): v is { data: T[] } {
  return !!v && typeof v === 'object' && Array.isArray((v as { data?: unknown }).data);
}
function normalizeUsers(resp: unknown): User[] {
  if (Array.isArray(resp)) return resp as User[];
  if (hasDataArray<User>(resp)) return (resp as { data: User[] }).data;
  return [];
}
function apiMsg(e: unknown): string {
  const maybe = e as { response?: { data?: { message?: unknown } } } | null;
  const msg = maybe?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return 'No se pudo actualizar el estado de bloqueo';
}

export default function AdminUsersPage() {
  const { isLoading: authLoading, isAuthorized } = useRequireRole('ADMINISTRATOR');

  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetBlocked, setTargetBlocked] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await userService.getUsers({ page: 1, limit: 100 });
      const normalized = normalizeUsers(response as unknown);
      setUsers(normalized);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios.');
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchUsers();
  }, [isAuthorized, fetchUsers]);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    const withRoles = user as User & { roles?: Role[]; roleIds?: string[] };
    const roleIdsFromRoles = Array.isArray(withRoles.roles)
      ? withRoles.roles.map((r) => r?.id).filter((id): id is string => typeof id === 'string')
      : [];

    const normalized: User = {
      ...user,
      roleIds: withRoles.roleIds ?? roleIdsFromRoles,
    } as User;

    setSelectedUser(normalized);
    setIsModalOpen(true);
  };

  const handleToggleBlockClick = (user: User, nextBlocked: boolean) => {
    setSelectedUser(user);
    setTargetBlocked(nextBlocked);
    setIsBlockOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedUser) return;
    try {
      await userService.toggleBlockUser(selectedUser.id, targetBlocked);
      toast.success(targetBlocked ? 'Usuario bloqueado' : 'Usuario desbloqueado');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(apiMsg(error));
    } finally {
      setIsBlockOpen(false);
      setSelectedUser(null);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    toast.success(selectedUser ? 'Usuario actualizado' : 'Usuario creado');
    fetchUsers();
    setSelectedUser(null);
  };

  if (authLoading || (isDataLoading && users.length === 0 && !error)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando usuarios...</p>
      </div>
    );
  }
  if (!isAuthorized) return null;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-slate-600">
            Administra las cuentas y roles de los usuarios del sistema.
          </p>
        </div>

        <Can permission="CREATE_USER">
          <Button onClick={handleCreate}>Crear Usuario</Button>
        </Can>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <UsersTable users={users} onEdit={handleEdit} onToggleBlock={handleToggleBlockClick} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      >
        {selectedUser ? (
          <UserForm key={selectedUser.id} userToEdit={selectedUser} onSuccess={handleFormSuccess} />
        ) : (
          <UserCreateForm onSuccess={handleFormSuccess} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        onConfirm={handleConfirmBlock}
        title={targetBlocked ? 'Bloquear Usuario' : 'Desbloquear Usuario'}
        message={
          selectedUser
            ? `¿Seguro que deseas ${targetBlocked ? 'bloquear' : 'desbloquear'} a "${selectedUser.firstName} ${selectedUser.lastName}"?`
            : ''
        }
        confirmText={targetBlocked ? 'Bloquear' : 'Desbloquear'}
        variant={targetBlocked ? 'danger' : 'info'}
      />
    </div>
  );
}
