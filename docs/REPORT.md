# Informe de funcionalidades

## Integrantes

- **Juan Manuel Díaz Moreno** — A00394477
- **Santiago Valencia García** — A00395902
- **William Joseph Verdesoto Velez** — A00395664
- **Esteban Gaviria Zambrano** — A00396019

Este documento describe de manera exhaustiva las funcionalidades implementadas en la
aplicación frontend desarrollada con Next.js, la arquitectura de la solución, y en concreto
explica cómo se implementan y gestionan la autenticación, la autorización y el estado de la
aplicación. El objetivo es que cualquier persona que lea este informe, sin conocimiento
previo del proyecto, comprenda cómo funciona la aplicación y dónde localizar cada
componente o responsabilidad en el código.

## Resumen ejecutivo

La aplicación es un frontend construido con Next.js (app router) que consume una API
backend (configurada mediante la variable de entorno NEXT_PUBLIC_BACKEND_URL). Se
emplean React y Zustand para la gestión del estado, axios para las llamadas HTTP y Zod
para validación en formularios. La aplicación incluye pantallas de autenticación (login,
registro, verificación 2FA), áreas diferenciadas por roles (administrador, organizador,
comprador, staff) y las funciones típicas para gestión de eventos, compra de entradas,
gestión de usuarios y permisos.

## Estructura general del proyecto

Raíz principal: `src/`

- `src/app/` : Rutas y páginas (separadas en grupos de rutas: `(auth)`, `(main)`)
  - `(auth)`: `login`, `register`, `verify-2fa` (páginas públicas de autenticación).
  - `(main)`: áreas protegidas: `dashboard`, `events`, `admin`, `organizer`, `profile`,
    `purchases`, `cart`, `tickets`, etc.
- `src/components/` : Componentes organizados por dominio (auth, events, cart, admin,
  profile, ui, etc.).
- `src/services/` : API services (ej. `authService.ts`, `eventService.ts`,
  `permissionService.ts`, ...). Encapsulan llamadas HTTP y transformaciones mínimas.
- `src/stores/` : Stores de Zustand (`useAuthStore.ts`, `useCartStore.ts`,
  `useEventStore.ts`, ...).
- `src/hooks/` : Hooks reutilizables (`useAuth.ts`, `useRequireAuth.ts`,
  `useRequireRole.ts`, `useAuthorization.ts`, `useApiClient.ts`, ...).
- `src/lib/` : Utilidades y tipos (`apiClient.ts`, `jwtUtils.ts`, `permissions.ts`,
  `roleUtils.ts`, `constants.ts`, `utils.ts`, `types.ts`).

## Lista de pantallas y componentes principales

Se enumeran a continuación las pantallas relevantes y los componentes asociados, con
una breve descripción de su funcionalidad y ubicación en el repositorio.

- Autenticación (públicas) — `src/app/(auth)/`:
  - `login/page.tsx` : Página de inicio de sesión. Renderiza `LoginForm`.
  - `register/page.tsx` : Página de registro. Renderiza `RegisterForm`.
  - `verify-2fa` : Página para verificar el código TOTP en caso de 2FA.

  Componentes asociados:
  - `src/components/auth/LoginForm.tsx` : Formulario de inicio de sesión,
    validación con Zod, manejo de errores, y flujo que redirige a 2FA si el backend
    lo solicita.
  - `src/components/auth/RegisterForm.tsx` y `BaseRegisterForm.tsx` : Registro público
    y flujo de registro (posible 2FA al registrar).
  - `src/components/auth/Verify2FAForm.tsx` : Formulario TOTP de 6 dígitos para
    completar el login/registro cuando el backend requiere 2FA.

- Área principal y navegación — `src/app/(main)/`:
  - `dashboard/page.tsx` : Panel principal del usuario autenticado.
  - `events/` : Listado de eventos (`page.tsx`), creación (`create`), detalle
    (`[eventId]/page.tsx`) y edición (`[eventId]/edit`). Componentes: `EventList.tsx`,
    `EventCard.tsx`, `EventForm.tsx`, `TicketTypeManager.tsx`.
  - `cart/`, `checkout/`, `purchases/`, `tickets/` : Flujo de compra y gestión de
    tickets (componentes `CartItem.tsx`, `CartSummary.tsx`).
  - `profile/` : Gestión del perfil de usuario y 2FA (`setup-2fa`).

- Área administrativa — `src/app/(main)/admin/`:
  - `page.tsx` + secciones: `users/`, `roles/`, `permissions/`, `events/`, `venues/`,
    `categories/` donde se puede listar, crear, editar y eliminar recursos. Estas
    páginas usan servicios como `roleService`, `permissionService` y componentes UI
    específicos en `src/components/admin/`.

## Descripción de funcionalidades implementadas

La aplicación implementa las siguientes funcionalidades (lista exhaustiva por áreas):

- Registro de usuarios con posibilidad de requerir verificación 2FA por el backend.
- Inicio de sesión con manejo de escenarios: éxito, credenciales inválidas, respuesta
  que indica que se requiere 2FA.
- Verificación TOTP (2FA) y flujo para completar login/registro cuando se requiere.
- Persistencia de sesión mediante tokens JWT almacenados en localStorage y manejo
  de refresh de token.
- Páginas protegidas con guards: redirect a login si el usuario no está autenticado
  (`useRequireAuth`) y control por rol (`useRequireRole`).
- Roles genéricos (ADMINISTRATOR, ORGANIZER, BUYER, STAFF) y selección/activación de
  rol activo para determinar la vista y redirección post-login.
- Gestión de permisos (utilidades para comprobar permisos en tiempo de render y
  condicionalmente mostrar/ocultar elementos de UI).
- CRUD para eventos, categorías, venues, usuarios, roles y permisos (interfaz).
- Carrito de compras, resumen y flujo de checkout (componentes y servicios
  específicos).
- Paginación, validación en formularios con Zod, y mensajes de error manejados en
  componentes (no se usan window.alert).

## Implementación de la autenticación (detalles técnicos)

Contrato y elementos principales

- Inputs/outputs: el frontend solicita endpoints del backend como `/auth/login`,
  `/auth/verify-2fa`, `/auth/refresh`, `/auth/me` y consume respuestas que contienen
  `access_token` y `refresh_token` (snake_case en backend, luego normalizado en el
  frontend).
- Puntos de entrada del frontend: `authService.ts` y `useAuthStore.ts`.

Flujo de login

1. El usuario completa `LoginForm` y el componente invoca `authService.login(email,
password)`.
2. `authService.login` realiza una petición POST a `/auth/login` a través de
   `apiClient`.
   - Si la respuesta incluye `requires2FA: true`, el formulario guarda temporalmente
     email y contraseña en `sessionStorage` y redirige a la página de verificación
     TOTP; no se establecen tokens.
   - Si la respuesta devuelve tokens (`access_token`, `refresh_token`), `authService`
     persiste los tokens (función `persistTokens`), que llama a `setAuthToken` y
     guarda los tokens en `localStorage` usando las claves definidas en
     `AUTH_CONFIG`.
3. `useAuthStore` recibe los tokens mediante `setTokens` y la aplicación llama a
   `fetchProfile` para obtener el perfil del usuario desde `/auth/me`.
4. El perfil devuelve roles y permisos anidados; `useAuthStore.setUser` extrae
   roles, permisos y decide un `activeRole` por prioridad usando
   `getHighestPriorityRole` de `roleUtils`.
5. Finalmente, la aplicación redirige según el rol activo (mapa de redirecciones
   controlado por `roleUtils.getRedirectByRole`).

Almacenamiento de tokens y seguridad

- Tokens (access y refresh) se almacenan en `localStorage` mediante utilidades
  (`setLocalStorage`) y también se instalan en las cabeceras por `apiClient`.
- Se utiliza una estrategia de refresh proactiva: `apiClient` comprueba en el
  interceptor de request si el token expira pronto (`isTokenExpiringSoon`) y,
  si es necesario, invoca el endpoint `/auth/refresh` para obtener un nuevo
  access token antes de enviar la petición. Esto evita errores 401 en requests
  concurrentes y mejora la experiencia.
- En interceptores de respuesta se maneja 401 para intentar refresh y reintentar
  la petición original; si el refresh falla, se limpian los datos de auth y se
  redirige a `/login`.

Verificación 2FA

- Cuando el backend indica `requires2FA`, el frontend guarda temporalmente
  credenciales en `sessionStorage` (clave `temp_2fa_email` y `temp_2fa_password`)
  y redirige a la página de verificación `Verify2FAForm`.
- La verificación envía `loginWith2FA` o `verify2FA` a `/auth/login-2fa` o
  `/auth/verify-2fa`, que devuelven tokens que se persisten igual que en el
  flujo normal, y se solicita el perfil.

## Implementación de la autorización (roles y permisos)

Modelo de roles y permisos

- Roles genéricos del sistema: `ADMINISTRATOR`, `ORGANIZER`, `BUYER`, `STAFF`.
  Estas constantes están definidas en `src/lib/roleUtils.ts`.
- Cada rol puede incluir permisos (objetos con `id` y `name`) que provienen
  del backend y se almacenan dentro del `user.roles` en el store.

Comprobaciones y control de acceso

- Utilidades: `src/lib/permissions.ts` ofrece `hasPermission`, `hasAnyPermission`
  y `hasAllPermissions` para evaluar permisos en base al perfil recibido.
- Hook `useCan(permissionName)` ofrece una forma compacta de verificar permisos
  desde componentes React (se basa en `useAuthStore(state => state.hasPermission(...))`).
- Guards: `useRequireAuth` redirige al login si el usuario no está autenticado.
  `useRequireRole(requiredRole)` protege rutas que necesitan un rol específico
  y evita bucles de redirect mientras se resuelve el perfil.

Asignación y cambio de rol

- El store `useAuthStore` expone `switchRole(role)` y `getAvailableRoles()`
  (filtra roles genéricos del usuario). `setUser` del store determina
  automáticamente el `activeRole` si aún no existe o si el rol activo ya no
  está disponible.
- La interfaz incluye componentes para cambiar el rol activo (por ejemplo
  `components/profile/RoleSwitcher.tsx`) y las páginas se adaptan a la vista
  correspondiente según `activeRole`.

## Gestión del estado

Resumen de la solución escogida

- La gestión del estado se realiza con Zustand (`src/stores/*`). Se opta por
  store locales por dominio (auth, cart, events, categories, purchases, venues)
  en lugar de un store global monolítico.

Detalles del store de autenticación

- `src/stores/useAuthStore.ts`:
  - Implementa el store con `create` y `persist` de `zustand`.
  - Estado inicial: `user`, `isAuthenticated`, `isLoading`, `error`,
    `twoFactorEnabled`, `roles`, `permissions`, `activeRole`.
  - Actions: `setUser`, `setTokens`, `login`, `verify2FA`, `logout`, `checkAuth`,
    `fetchProfile`, `switchRole`, `getAvailableRoles`, `hasPermission`, etc.
  - Persistencia: el store se persiste en `localStorage` con nombre `auth-storage`
    y `partialize` asegura que solo se guarden claves relevantes (user, roles,
    permissions, activeRole y flags de sesión).

Patrones de uso

- Los componentes consumen el store mediante selectors (ej. `useAuthStore(s => s.user)`)
  para minimizar re-renders. Además existe el hook `useAuth` que agrupa
  selectores y acciones frecuentemente usados por componentes.

Otros stores

- `useCartStore`, `useEventStore`, `useCategoryStore`, `usePurchaseStore`,
  `useVenueStore` gestionan los estados específicos de cada dominio. Estos
  stores encapsulan fetches, paginación, filtros y acciones CRUD en combinación
  con los services ubicados en `src/services/`.

Gestión de efectos secundarios y API client

- `src/lib/apiClient.ts` implementa un Axios instance con interceptors para:
  - Añadir cabecera Authorization con el token si existe.
  - Proactividad: si el token está a punto de expirar, invoca el endpoint de
    refresh para obtener un nuevo access token antes de enviar la petición.
  - Manejar 401/403/422/500 y errores de red de forma centralizada, normalizando
    respuestas y redirigiendo a login cuando corresponde.

## Pruebas, despliegue y pipelines

Pruebas

- El proyecto incluye configuración para pruebas unitarias con Jest y
  pruebas E2E con Playwright (`jest.config.mjs`, `playwright.config.ts` y
  scripts en `package.json`). Comandos relevantes:
  - `npm test` — ejecuta Jest
  - `npm run test:e2e` — ejecuta Playwright

Despliegue

- Existe `vercel.json` y la aplicación está preparada para desplegar en Vercel.
  Para desplegar en una nube se requiere configurar la variable de entorno
  `NEXT_PUBLIC_BACKEND_URL` que apunta al backend (por ejemplo la app de NestJS
  del taller anterior).

Pipelines (recomendación / evidencia)

- No se incluyen archivos de CI/CD específicos (GitHub Actions) en el repositorio
  analizado, pero la estructura de scripts permite crear pipelines que ejecuten
  `npm test`, `npm run test:e2e` y `npm run build` antes del despliegue.

## Comprobación de requisitos del taller y mapeo con la implementación

Se incluye a continuación el enunciado del taller y el mapeo a la implementación.

Enunciado (extracto relevante):

- Objetivo: Desarrollar una aplicación frontend utilizando Next.js, que consuma los
  servicios expuestos en el taller anterior desarrollado con NestJS.
- Requisitos mínimos (resumen):
  - Autenticación (JWT), login/logout, rutas protegidas.
  - Autorización con al menos dos roles; permisos basados en roles; administración de roles.
  - Interfaz: listar/crear/editar/eliminar elementos, paginación, validación, mensajes
    de error y navegación clara.
  - Gestión del estado (Context API, Redux, Zustand, u otra); centralizar auth/authorization.
  - Funcionalidades del dominio (events, tickets, cart, etc.).
  - Informe de funcionalidades (este documento), despliegue y pipelines, pruebas unitarias
    y E2E.

Cumplimiento observado

- Autenticación: Implementada con JWT.
  - `authService.login`, `authService.verify2FA`, `authService.refresh` y `authService.logout`.
  - Tokens persistidos en `localStorage` y seteados en `apiClient`.
  - Login y logout disponibles en UI (`LoginForm`, `RegisterForm`, `Verify2FAForm`).
  - Rutas protegidas mediante `useRequireAuth`.

- Autorización: Implementada mediante roles y permisos.
  - Roles genéricos definidos en `src/lib/roleUtils.ts`.
  - Permisos evaluables con `src/lib/permissions.ts` y el hook `useCan`.
  - Guardas por rol en `useRequireRole` y UI que muestra/oculta elementos según
    `useAuthStore().hasPermission` o `useCan`.
  - Administración de roles: existe UI de administración (`/admin/roles`,
    `/admin/users`) y servicios (`roleService`, `permissionService`) que permiten
    asignar roles desde la interfaz de administración.

- Interfaz de usuario: Amplia y modular con componentes React.
  - CRUD en páginas de administración y gestión de eventos.
  - Validación con Zod en formularios, mensajes de error presentados mediante
    componentes (`FormError`), sin emplear `window.alert`.
  - Navegación clara con rutas por rol y redirección post-login (`roleUtils`).

- Gestión del estado: Zustand para auth y demás dominios.
  - Estado de autenticación/autorization centralizado en `useAuthStore`.
  - Otros stores por dominio (`useCartStore`, `useEventStore`, ...).

- Funcionalidades del dominio: Eventos, tickets, carrito y compras implementadas
  parcialmente en componentes y servicios (listar/crear/editar/eliminar), con
  paginación y filtros en `EventList` y `EventFilters`.

- Despliegue y pipelines: Proyecto preparado para despliegue en Vercel
  (`vercel.json`) y con scripts para pruebas y build. Falta un archivo de CI
  explícito, pero puede crearse fácilmente usando los scripts existentes.

## Instrucciones para ejecutar el proyecto localmente

Requisitos previos:

- Node.js (v18+ recomendado) y npm.

Pasos:

1. Clonar el repositorio y posicionarse en la raíz del proyecto.
2. Instalar dependencias:

```
npm install
```

3. Configurar variables de entorno (al menos):

- `NEXT_PUBLIC_BACKEND_URL` → URL base del backend (ej. `http://localhost:3000`).

4. Ejecutar en modo desarrollo (nota: el script usa puerto 3001):

```
npm run dev
```

5. Ejecutar pruebas unitarias y E2E:

```
npm test          # Jest
npm run test:e2e  # Playwright
```

## Aspectos técnicos y casos límite tratados

- Manejo de tokens concurrentes: `apiClient` evita múltiples refresh simultáneos
  y reintenta la petición original tras obtener un nuevo access token.
- Flujos con 2FA: el sistema diferencia entre un login que requiere 2FA y uno que
  devuelve tokens inmediatamente; maneja ambos casos.
- Persistencia: la información mínima necesaria (user, roles, permissions,
  activeRole, isAuthenticated) se persiste; al rehidratar el store se reinstala el
  token si existe en localStorage.
- Validación: formularios se validan con Zod y se normalizan errores para mostrar
  mensajes amigables.

## Limitaciones y recomendaciones (mejoras de bajo riesgo)

Se enumeran recomendaciones que no fueron solicitadas explícitamente pero que
mejoran seguridad y robustez:

1. Evitar almacenamiento de tokens en `localStorage` por motivos de XSS;
   considerar almacenar el `accessToken` en memoria y el `refreshToken` en
   cookie HttpOnly (requiere cambios en backend). Actualmente la app usa
   `localStorage` por simplicidad y conforme al patrón utilizado en el taller.

2. Evitar guardar la contraseña temporalmente en `sessionStorage` durante 2FA;
   en su lugar, usar un token temporal que el backend emita para completar el
   paso 2FA (si el backend lo soporta).

3. Añadir un pipeline de CI (GitHub Actions) que ejecute `npm test`,
   `npm run test:e2e` y `npm run build` antes de desplegar. Esto automatiza la
   verificación de calidad solicitada por el taller.

4. Añadir pruebas unitarias adicionales para `useAuthStore` y tests E2E que
   cubran flujos críticos: registro → login → 2FA → redirección por rol,
   y refresco de token durante uso prolongado.

## Listado de archivos y responsabilidades (referencia rápida)

- `src/services/authService.ts` : Lógica de llamadas a endpoints de autenticación
  (login, loginWith2FA, verify2FA, refresh, logout, setup2FA, enable/disable 2FA,
  getProfile, register, createUser).
- `src/lib/apiClient.ts` : Instancia de axios con interceptors para inyectar tokens,
  refresco proactivo y manejo global de errores.
- `src/lib/jwtUtils.ts` : Utilidades para decodificar JWT, comprobar expiración y
  tiempo restante.
- `src/stores/useAuthStore.ts` : Store de Zustand con persistencia y todas las
  acciones relacionadas a la autenticación/roles.
- `src/hooks/useAuth.ts` : Hook que expone selectores y acciones del store.
- `src/hooks/useRequireAuth.ts`, `src/hooks/useRequireRole.ts` : Guards para rutas.
- `src/lib/roleUtils.ts` : Lógica de roles genéricos, prioridades y redirecciones.
- `src/lib/permissions.ts` : Comprobaciones de permisos basadas en el perfil.
- `src/components/auth/*` : Formularios de login, registro y verificación 2FA.
- `src/app/(main)/admin/*` : Interfaces administrativas (roles, users, permissions,
  events, categories, venues).

## Conclusión

La aplicación implementa de manera integral los requisitos solicitados en el
taller: autenticación basada en JWT con refresh y 2FA, autorización mediante
roles y permisos, gestión centralizada del estado con Zustand, interfaces para
listar/crear/editar/eliminar contenidos y una estructura modular que facilita la
extensión y el testing. Se incluyen pruebas unitarias y E2E en la base del
proyecto y la aplicación está preparada para desplegar en Vercel.
