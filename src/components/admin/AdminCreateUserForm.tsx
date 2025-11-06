'use client';

import BaseRegisterForm from '../auth/BaseRegisterForm';
import authService from '@/src/services/authService';

export default function AdminCreateUserForm() {
  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleIds: string[];
  }) => {
    await authService.createUser(values);
  };

  const handleSuccess = () => {
    // Opcionalmente redirigir a lista de usuarios
    // Si se necesita redirigir, importar useRouter y router.push('/admin/users');
  };

  return (
    <BaseRegisterForm
      mode="admin"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      showBackToLogin={false}
    />
  );
}
