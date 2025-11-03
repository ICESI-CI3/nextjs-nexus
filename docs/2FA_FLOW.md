# Flujo de Autenticación 2FA - TicketHub

Este documento describe el flujo completo de autenticación de dos factores implementado en el proyecto.

## 🔐 Flujo Completo

### 1. Login sin 2FA

1. Usuario ingresa email y password en `/login`
2. Si no tiene 2FA habilitado → redirige a `/dashboard`
3. Tokens guardados en localStorage y Zustand store

### 2. Activación de 2FA

1. En `/dashboard`, usuario ve botón **"Activar 2FA"** (solo si no tiene 2FA activo)
2. Click en "Activar 2FA" → redirige a `/profile/setup-2fa`
3. Pantalla muestra:
   - **Paso 1**: QR code para escanear con app autenticadora (Google Authenticator, Authy, etc.)
   - **Paso 2**: Código manual (alternativa al QR)
   - **Paso 3**: Input para verificar código de 6 dígitos
   - **Códigos de respaldo**: Lista de códigos para emergencias
4. Usuario escanea QR con su app autenticadora
5. App genera código de 6 dígitos
6. Usuario introduce el código y presiona "Activar 2FA"
7. Backend valida el código → activa 2FA para ese usuario
8. Store de Zustand se actualiza (`user.twoFactorEnabled = true`)
9. Redirige a `/dashboard`

### 3. Login con 2FA Habilitado

1. Usuario ingresa email y password en `/login`
2. Backend responde `{ requires2FA: true }`
3. Frontend redirige a `/verify-2fa?email=...&password=...`
4. Usuario ve pantalla de verificación con input de 6 dígitos
5. Usuario abre su app autenticadora y copia el código actual
6. Introduce el código y presiona "Verificar código"
7. Backend valida código + credenciales → retorna tokens
8. Tokens guardados en localStorage y store
9. Redirige a `/dashboard`

### 4. Dashboard Post-Login

- Si tiene 2FA activo: muestra badge verde "Activo"
- Si no tiene 2FA: muestra botón "Activar 2FA"
- Botón "Cerrar sesión" siempre visible

### 5. Logout

1. Click en "Cerrar sesión"
2. Llama a `/auth/logout` (backend revoca refresh token)
3. Limpia localStorage (`app_access_token`, `app_refresh_token`, `app_user`)
4. Resetea store de Zustand
5. Redirige a `/login`

## 🗂️ Archivos Clave

### Páginas

- `src/app/(auth)/login/page.tsx` - Pantalla de login
- `src/app/(auth)/verify-2fa/page.tsx` - Verificación 2FA en login
- `src/app/(main)/dashboard/page.tsx` - Dashboard protegido
- `src/app/(main)/profile/setup-2fa/page.tsx` - Setup y activación de 2FA

### Componentes

- `src/components/auth/LoginForm.tsx` - Form de login con lógica de redirección a 2FA
- `src/components/auth/Verify2FAForm.tsx` - Form de verificación 2FA

### Services

- `src/services/authService.ts` - Wrapper de API:
  - `login()` - Login inicial
  - `loginWith2FA()` - Login con código 2FA
  - `setup2FA()` - Obtiene QR y secret
  - `enable2FA()` - Activa 2FA con código de verificación
  - `disable2FA()` - Desactiva 2FA (futuro)
  - `getProfile()` - Obtiene perfil con `twoFactorEnabled`

### State Management (Zustand)

- `src/stores/useAuthStore.ts` - Store de autenticación:
  - `user` - Perfil del usuario (incluye `twoFactorEnabled`)
  - `isAuthenticated` - Flag de sesión activa
  - `login()` - Acción de login
  - `logout()` - Acción de logout
  - `fetchProfile()` - Carga perfil desde backend
  - `setTokens()` - Persiste tokens

### Hooks

- `src/hooks/useAuth.ts` - Hook para acceder al store
- `src/hooks/useRequireAuth.ts` - Guard de rutas protegidas

## 🎨 Estilo Visual

- Diseño consistente con mockup del taller
- Tailwind CSS v4
- Inputs accesibles (aria-labels, validation messages)
- Loading states
- Toast notifications (react-hot-toast)

## 🔒 Seguridad

- Tokens JWT en localStorage
- Refresh token rotation
- HTTPS en producción (query params seguros)
- Validación de códigos 2FA en backend
- Códigos de respaldo para recuperación

## 📱 UX

- Input de código 2FA con fuente monoespaciada grande
- Solo acepta dígitos (6 caracteres)
- Auto-focus en inputs críticos
- Botón deshabilitado hasta completar input
- Mensajes de error descriptivos
- Loader states en operaciones asíncronas

## 🧪 Testing (Pendiente)

- Unit tests para hooks y store
- E2E tests para flujos completos:
  - Login sin 2FA
  - Activación de 2FA
  - Login con 2FA
  - Logout
