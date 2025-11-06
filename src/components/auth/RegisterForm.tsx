'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import BaseRegisterForm from './BaseRegisterForm';
import authService from '@/src/services/authService';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { getPostLoginRedirect } from '@/src/lib/getPostLoginRedirect';
import { ROUTES } from '@/src/lib/constants';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleIds: string[];
  }) => {
    try {
      console.log('[RegisterForm] Starting registration...', { email: values.email });
      const result = await authService.register(values);
      console.log('[RegisterForm] Registration result:', result);

      if (result.requires2FA) {
        console.log('[RegisterForm] 2FA required, redirecting to verify page');
        sessionStorage.setItem('temp_2fa_email', values.email);
        sessionStorage.setItem('temp_2fa_password', values.password);

        const next = searchParams.get('next');
        const params = next ? `?next=${encodeURIComponent(next)}` : '';
        router.push(`${ROUTES.VERIFY_2FA}${params}`);
        return;
      }

      if (result.accessToken) {
        console.log('[RegisterForm] Access token received, starting auto-login');
        // Login automático: guardar tokens
        const { setTokens, fetchProfile } = useAuthStore.getState();

        console.log('[RegisterForm] Setting tokens...');
        setTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        // Cargar perfil (esto también establece activeRole)
        console.log('[RegisterForm] Fetching profile...');
        await fetchProfile();
        console.log('[RegisterForm] Profile fetched successfully');

        // Obtener el activeRole DESPUÉS de fetchProfile
        const { activeRole } = useAuthStore.getState();
        console.log('[RegisterForm] Active role:', activeRole);

        // Redirigir según el rol
        const redirectUrl = getPostLoginRedirect(activeRole);
        console.log(`[RegisterForm] Redirecting to ${redirectUrl} with activeRole: ${activeRole}`);
        router.replace(redirectUrl);

        // Esperar un poco para que la redirección ocurra antes de resolver la Promise
        // Esto evita que el formulario vuelva a su estado normal antes de la redirección
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log('[RegisterForm] Registration and auto-login completed');
      } else {
        console.error('[RegisterForm] No access token in result:', result);
      }
    } catch (error) {
      // Re-lanzar el error para que BaseRegisterForm lo capture y lo muestre
      console.error('[RegisterForm] Error during registration:', error);
      throw error;
    }
  };

  return <BaseRegisterForm mode="public" onSubmit={handleSubmit} showBackToLogin />;
}
