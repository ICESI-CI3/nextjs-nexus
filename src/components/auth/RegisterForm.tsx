'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import BaseRegisterForm from './BaseRegisterForm';
import authService from '@/src/services/authService';
import useAuth from '@/src/hooks/useAuth';
import { ROUTES } from '@/src/lib/constants';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, fetchProfile } = useAuth();

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleIds: string[];
  }) => {
    const result = await authService.register(values);

    if (result.requires2FA) {
      sessionStorage.setItem('temp_2fa_email', values.email);
      sessionStorage.setItem('temp_2fa_password', values.password);

      const next = searchParams.get('next');
      const params = next ? `?next=${encodeURIComponent(next)}` : '';
      router.push(`${ROUTES.VERIFY_2FA}${params}`);
      return;
    }

    if (result.accessToken) {
      setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || '',
      });

      try {
        await fetchProfile();
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }

      router.push(searchParams.get('next') || ROUTES.DASHBOARD);
    }
  };

  return <BaseRegisterForm mode="public" onSubmit={handleSubmit} showBackToLogin />;
}
