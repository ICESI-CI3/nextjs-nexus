# NextJS Nexus - Frontend

## Integrantes

- **Juan Manuel Díaz Moreno** — A00394477
- **Santiago Valencia García** — A00395902
- **William Joseph Verdesoto Velez** — A00395664
- **Esteban Gaviria Zambrano** — A00396019

---

## Información del taller

**Facultad:** Barberi de Ingeniería, Diseño y Ciencias Aplicadas  
**Departamento:** Computación y Sistemas Inteligentes  
**Curso:** Computación en Internet III  
**Taller:** Frontend – NextJS  
**Docente:** Leonardo Bustamante  
**Fecha de entrega:** Noviembre 04 de 2025

---

## Descripción del proyecto

Esta aplicación frontend desarrollada con Next.js consume los servicios expuestos por el backend del taller anterior (NestJS). Implementa un sistema completo de gestión de eventos con las siguientes características principales:

### Funcionalidades implementadas

#### Autenticación

- Sistema de autenticación basado en tokens JWT (JSON Web Tokens)
- Inicio y cierre de sesión de usuarios
- Autenticación de dos factores (2FA) con TOTP
- Refresh automático de tokens para mantener la sesión activa
- Rutas protegidas que requieren autenticación
- Persistencia de sesión en `localStorage`

#### Autorización

- Sistema de roles: ADMINISTRATOR, ORGANIZER, BUYER, STAFF
- Permisos basados en roles para restringir acceso a funcionalidades
- Interfaz de administración para gestionar roles y permisos
- Sistema de cambio de rol activo para usuarios con múltiples roles
- Componentes que se muestran u ocultan según el rol del usuario

#### Gestión de eventos

- Listado de eventos con paginación y filtros
- Creación, edición y eliminación de eventos (según permisos)
- Gestión de tipos de tickets para cada evento
- Estados de eventos: activo, suspendido, cancelado
- Visualización detallada de cada evento

#### Gestión de compras

- Carrito de compras funcional
- Proceso de checkout completo
- Historial de compras del usuario
- Validación de tickets mediante QR

#### Administración

- Panel administrativo completo (solo para administradores)
- Gestión de usuarios: crear, editar, eliminar, asignar roles
- Gestión de roles y permisos
- Gestión de categorías y venues
- Administración de todos los eventos del sistema

#### Interfaz de usuario

- Interfaz moderna y responsiva con Tailwind CSS
- Validación de formularios con Zod
- Mensajes de error amigables (no se usa `window.alert`)
- Navegación clara y adaptada según el rol del usuario
- Componentes reutilizables y organizados por dominio

#### Gestión del estado

- Implementación con Zustand para estado global
- Store de autenticación centralizado (`useAuthStore`)
- Stores por dominio: carrito, eventos, categorías, compras, venues
- Persistencia selectiva del estado en `localStorage`

---

## Documentación

Para más información detallada sobre la arquitectura, implementación y funcionalidades del proyecto, consulta el [Informe completo de funcionalidades](./docs/REPORT.md).

---

## Requisitos previos

Antes de ejecutar la aplicación, es necesario tener instalado:

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git** para clonar el repositorio

---

## Instalación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/ICESI-CI3/nextjs-nexus.git
cd nextjs-nexus
```

2. **Instalar dependencias:**

```bash
npm install
```

---

## Configuración

### Variables de entorno

Se debe crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# URL del backend (obligatorio)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Otras variables opcionales
NEXT_PUBLIC_APP_NAME=TicketHub
```

**Nota importante:** La variable `NEXT_PUBLIC_BACKEND_URL` debe apuntar a la URL donde esté corriendo el backend de NestJS del taller anterior.

---

## Ejecución de la aplicación

### Modo desarrollo

Para ejecutar la aplicación en modo desarrollo (puerto 3001):

```bash
npm run dev
```

La aplicación estará disponible en: [http://localhost:3001](http://localhost:3001)

### Modo producción

Para construir y ejecutar la aplicación en modo producción:

```bash
# Construir la aplicación
npm run build

# Iniciar el servidor de producción
npm start
```

---

## Ejecución de pruebas

El proyecto incluye pruebas unitarias con Jest y pruebas end-to-end (E2E) con Playwright.

### Pruebas unitarias

```bash
# Ejecutar todas las pruebas unitarias
npm test

# Ejecutar pruebas en modo watch (se reejecutarán al hacer cambios)
npm run test:watch

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage

# Ejecutar pruebas en modo CI (para pipelines)
npm run test:ci
```

### Pruebas E2E (End-to-End)

```bash
# Ejecutar pruebas E2E
npm run test:e2e

# Ejecutar pruebas E2E en modo UI (interfaz interactiva)
npm run test:e2e:ui

# Ver reporte de las pruebas E2E
npm run test:e2e:report
```

**Nota:** Para ejecutar las pruebas E2E, es necesario que tanto el frontend como el backend estén en ejecución.

---

## Otros comandos útiles

### Linting y formato

```bash
# Ejecutar ESLint
npm run lint

# Ejecutar ESLint y corregir problemas automáticamente
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato sin modificar archivos
npm run format:check

# Verificar tipos de TypeScript
npm run type-check
```

---

## Estructura del proyecto

```
nextjs-nexus/
├── src/
│   ├── app/                    # Rutas y páginas (App Router de Next.js)
│   │   ├── (auth)/            # Rutas de autenticación (login, registro, 2FA)
│   │   └── (main)/            # Rutas protegidas (dashboard, eventos, admin, etc.)
│   ├── components/            # Componentes React organizados por dominio
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── events/            # Componentes de eventos
│   │   ├── cart/              # Componentes del carrito
│   │   ├── admin/             # Componentes administrativos
│   │   └── ui/                # Componentes de UI reutilizables
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts         # Hook de autenticación
│   │   ├── useRequireAuth.ts  # Guard de autenticación
│   │   └── useRequireRole.ts  # Guard de autorización por rol
│   ├── stores/                # Stores de Zustand
│   │   ├── useAuthStore.ts    # Store de autenticación
│   │   ├── useCartStore.ts    # Store del carrito
│   │   └── useEventStore.ts   # Store de eventos
│   ├── services/              # Servicios de API
│   │   ├── authService.ts     # Servicio de autenticación
│   │   ├── eventService.ts    # Servicio de eventos
│   │   └── userService.ts     # Servicio de usuarios
│   └── lib/                   # Utilidades y configuración
│       ├── apiClient.ts       # Cliente HTTP (Axios)
│       ├── jwtUtils.ts        # Utilidades para JWT
│       ├── roleUtils.ts       # Utilidades de roles
│       └── permissions.ts     # Utilidades de permisos
├── tests/
│   ├── unit/                  # Pruebas unitarias
│   └── e2e/                   # Pruebas end-to-end
├── docs/
│   └── REPORT.md              # Informe detallado de funcionalidades
├── public/                    # Archivos estáticos
└── package.json               # Dependencias y scripts
```

---

## Tecnologías utilizadas

- **Next.js 16.0.0** - Framework de React con App Router
- **React 19.2.0** - Biblioteca de interfaces de usuario
- **TypeScript 5** - Tipado estático
- **Zustand 5.0.8** - Gestión del estado
- **Axios 1.13.0** - Cliente HTTP
- **Zod 4.1.12** - Validación de esquemas
- **Tailwind CSS 4** - Framework de CSS utility-first
- **React Hook Form 7.66.0** - Manejo de formularios
- **Jest 30.2.0** - Testing unitario
- **Playwright 1.56.1** - Testing E2E

---

## Flujo de autenticación y autorización

### Autenticación

1. El usuario ingresa sus credenciales en el formulario de login
2. El frontend envía las credenciales al endpoint `/auth/login` del backend
3. Si el backend requiere 2FA, el usuario es redirigido a la página de verificación TOTP
4. Una vez autenticado, el backend devuelve tokens JWT (access y refresh)
5. Los tokens se almacenan en `localStorage` y se añaden automáticamente a las cabeceras HTTP
6. El frontend solicita el perfil del usuario (`/auth/me`) para obtener roles y permisos
7. Se establece un rol activo y se redirige al usuario según su rol

### Autorización

1. Los roles y permisos se obtienen del perfil del usuario
2. Los componentes y rutas verifican permisos antes de renderizar o permitir acceso
3. Los hooks `useRequireAuth` y `useRequireRole` protegen rutas según autenticación y roles
4. Los componentes utilizan el hook `useCan(permission)` para mostrar/ocultar elementos según permisos
5. El usuario puede cambiar entre sus roles disponibles usando el `RoleSwitcher`

### Refresh de tokens

- El cliente HTTP (`apiClient`) verifica proactivamente si el token está próximo a expirar
- Si el token expira pronto, solicita automáticamente un nuevo token antes de hacer la petición
- Si una petición recibe un error 401, intenta refrescar el token y reintentar la petición original
- Si el refresh falla, se limpia la sesión y se redirige al login
