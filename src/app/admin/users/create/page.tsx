import { Metadata } from 'next';
import AdminCreateUserForm from '@/src/components/admin/AdminCreateUserForm';

export const metadata: Metadata = {
  title: 'Crear Usuario | Admin',
};

export default function AdminCreateUserPage() {
  return <AdminCreateUserForm />;
}
