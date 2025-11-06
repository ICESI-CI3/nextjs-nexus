'use client';

import { useRouter } from 'next/navigation';
import BaseRegisterForm from '../auth/BaseRegisterForm';
import authService from '@/src/services/authService';
import { ROUTES } from '@/src/lib/constants';

export default function AdminCreateUserForm() {
  const router = useRouter();

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
    // router.push('/admin/users');
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
