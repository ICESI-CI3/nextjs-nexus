# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 frontend application built with React 19, TypeScript, and Tailwind CSS. The application consumes a NestJS backend API and fulfills the requirements for the Computer Networks III course assignment.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server (must run build first)
npm start

# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

## Assignment Requirements (from PDF)

This project must fulfill the following requirements for evaluation:

1. **Autenticación (10%)** - JWT-based authentication
   - Login and logout functionality
   - Protected routes requiring authentication

2. **Autorización (10%)** - Role-based access control (RBAC)
   - At least 2 different roles
   - Role-based permissions to restrict routes/features
   - Role assignment through admin mechanism
   - UI adaptation based on user role (show/hide elements)

3. **Interfaz de usuario (15%)** - User interface
   - Attractive and functional UI with React components
   - CRUD pages (list, create, edit, delete)
   - Pagination, validation, error messages (NO window.alert!)
   - Clear and easy navigation system

4. **Gestión del estado (10%)** - State management
   - Use Context API, Redux, or **Zustand** (recommended)
   - Centralized authentication and authorization state
   - Manage main application data (e.g., user stories, resources)

5. **Funcionalidades (20%)** - Implement necessary frontend features for your application

6. **Informe de funcionalidades (10%)** - Detailed report of implemented features

7. **Despliegue (10%)** - Cloud deployment
   - Deploy to cloud service
   - CI/CD pipelines for automated testing and deployment

8. **Pruebas (15%)** - Testing
   - Unit tests and E2E tests (automated)

**Deadline:** November 04, 2025

## Architecture

### App Router Structure (Next.js 16)

The project uses Next.js App Router:

- **`src/app/(auth)/`** - Public authentication routes (login, register)
  - Parentheses = "Route Groups" (organize without affecting URLs)
- **`src/app/(main)/`** - Protected application routes (add your pages here)
  - `dashboard/` - User dashboard
  - Add more routes based on YOUR application needs

### Core Directory Structure

- **`src/lib/`** - Core utilities and configuration
  - `types.ts` - **Base TypeScript types (ADJUST TO YOUR BACKEND!)**
  - `constants.ts` - App constants (API config, routes, messages)
  - `utils.ts` - Generic utility functions (date, currency, validation, etc.)
  - `apiClient.ts` - **Axios HTTP client with JWT interceptors**
  - `toast.ts` - Toast notifications (react-hot-toast wrapper)

- **`src/stores/`** - **Zustand state management stores**
  - `useAuthStore.ts` - **Base authentication store (ADJUST TO YOUR BACKEND!)**
  - `STORE_TEMPLATE.ts` - Template for creating new stores
  - Create your own stores based on your application needs

- **`src/services/`** - API service layer (optional)
  - Create service files for backend communication if needed
  - Services use the API client from `src/lib/apiClient.ts`

- **`src/components/`** - Reusable React components
  - Organize by feature (e.g., `users/`, `products/`, `orders/`)
  - `layout/` - Layout components (Navbar, Footer, etc.)
  - `ui/` - Reusable UI components (Button, Input, Card, etc.)

- **`src/hooks/`** - Custom React hooks
  - Create custom hooks as needed (e.g., `useAuth`, `useRequireAuth`)

- **`src/tests/e2e/`** - End-to-end tests (implement as required)

### Key Technical Details

- **React Compiler**: Enabled for automatic optimization
- **TypeScript**: Strict mode with path aliases (`@/*` maps to project root)
- **Styling**: Tailwind CSS v4 with `cn()` utility helper
- **State Management**: **Zustand** (chosen for assignment requirement)
- **HTTP Client**: Axios with request/response interceptors for JWT
- **Validation**: Zod schemas for forms
- **Notifications**: react-hot-toast (NO window.alert per assignment)
- **Git Hooks**: Husky for pre-commit checks (ESLint, Prettier, type-check)

## Getting Started - CRITICAL STEPS

### 1. Connect to Your NestJS Backend

First, configure your backend URL:

```bash
# Create .env.local file
cp .env.example .env.local

# Edit .env.local and set your backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Adjust port/URL as needed
```

### 2. Adjust Types to Match Your Backend

**File: `src/lib/types.ts`**

The `User`, `AuthTokens`, and other types are **placeholders**. You MUST adjust them to match YOUR NestJS backend API responses.

**Steps:**
1. Make an API call to your backend (e.g., `/auth/login`)
2. Check the JSON response structure
3. Create TypeScript interfaces that match the response
4. Replace/extend the types in `src/lib/types.ts`

Example:
```typescript
// If your backend returns:
// { id: 1, email: "test@test.com", username: "test", role: { id: 1, name: "admin" } }

// Update types.ts:
export interface User {
  id: number;  // Changed from string if your backend uses numbers
  email: string;
  username: string;
  role: Role;
  // Add other fields your backend returns
}
```

### 3. Adjust Auth Store to Match Your Backend

**File: `src/stores/useAuthStore.ts`**

The login/register functions have TODOs marking what needs adjustment:

1. **Endpoint paths** - Change `/auth/login`, `/auth/register` to match your backend
2. **Response structure** - Adjust based on your backend response:
   ```typescript
   // Option 1: { user: User, tokens: AuthTokens }
   // Option 2: { data: { user: User, accessToken: string } }
   // Option 3: { user: User, accessToken: string, refreshToken: string }
   ```
3. **RegisterData fields** - Add/remove fields in `types.ts` based on your backend requirements

### 4. Create Stores for Your Application Data

**File: `src/stores/STORE_TEMPLATE.ts`**

Use this template to create stores for your application's main data:

1. Copy `STORE_TEMPLATE.ts` to a new file (e.g., `useUserStore.ts`)
2. Replace "Resource" with your entity name (User, Product, Order, etc.)
3. Update API endpoints to match your backend
4. Adjust types to match your backend responses

Example stores you might need:
- `useUserStore.ts` - Manage users (if admin panel)
- `useProductStore.ts` - Manage products/items
- `useOrderStore.ts` - Manage orders/purchases
- `useCategoryStore.ts` - Manage categories

### 5. Create Pages and Components

Based on your application's needs, create pages and components:

**Pages** (in `src/app/`):
- Add routes in `(main)` folder for protected pages
- Add routes in `(auth)` folder for public pages

**Components** (in `src/components/`):
- Create feature-specific components (e.g., `users/UserList.tsx`)
- Create reusable UI components (e.g., `ui/Button.tsx`)

## Development Guidelines

### State Management with Zustand (CRITICAL for 10% of grade)

**Always use Zustand stores for:**
- Authentication state (already done in `useAuthStore`)
- Application data from your backend (users, products, etc.)
- Global UI state (if needed)

**Pattern:**
```typescript
// 1. Import the store
import { useAuthStore } from '@/src/stores/useAuthStore';

// 2. Use in component
export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Use the state and actions
  if (!isAuthenticated) {
    return <LoginForm onSubmit={login} />;
  }

  return <div>Welcome {user?.email}</div>;
}
```

### API Client Usage

The API client (`src/lib/apiClient.ts`) automatically:
- Adds JWT tokens to requests
- Refreshes tokens when they expire
- Handles common errors
- Redirects to login on 401

**Usage:**
```typescript
import { get, post, put, del } from '@/src/lib/apiClient';

// GET request
const users = await get<User[]>('/users');

// POST request
const newUser = await post<User, CreateUserDTO>('/users', { name: 'John' });

// PUT request
const updated = await put<User, UpdateUserDTO>('/users/1', { name: 'Jane' });

// DELETE request
await del('/users/1');
```

### Notifications (NO window.alert!)

**Always use toast notifications:**
```typescript
import { showToast } from '@/src/lib/toast';

showToast.success('Operación exitosa');
showToast.error('Error al procesar');
showToast.warning('Advertencia');
showToast.info('Información');

// For async operations
showToast.promise(
  apiCall(),
  {
    loading: 'Guardando...',
    success: 'Guardado exitosamente',
    error: 'Error al guardar'
  }
);
```

### Form Validation with Zod

Create validation schemas in `src/lib/utils.ts`:

```typescript
import { z } from 'zod';

export const userSchemas = {
  create: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    // Add more fields
  }),
};

// Use in component
const result = userSchemas.create.safeParse(formData);
if (!result.success) {
  const errors = formatZodErrors(result.error);
  // Show errors to user
}
```

### Authorization - Show/Hide UI Elements

```typescript
import { useAuthStore } from '@/src/stores/useAuthStore';

export default function MyComponent() {
  const { user } = useAuthStore();

  // Check role
  const isAdmin = user?.role?.name === 'admin';

  return (
    <div>
      {isAdmin && (
        <button>Admin Only Action</button>
      )}
    </div>
  );
}
```

## Git Hooks & Code Quality

This project uses **Husky** for automated quality checks:

### Pre-commit Hook
Runs before each commit:
- ✅ ESLint (auto-fixes)
- ✅ Prettier (formats code)
- ✅ Type-check

### Commit Message Format
Must follow **Conventional Commits**:

```bash
# Valid examples:
git commit -m "feat: add user authentication"
git commit -m "fix: resolve token refresh issue"
git commit -m "docs: update README"
git commit -m "refactor: simplify store actions"
```

**Types:** feat, fix, docs, style, refactor, test, chore, perf, ci, build

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Your NestJS backend URL
```

## Path Aliases

The project uses TypeScript path aliases:
- `@/*` resolves to the project root

Examples:
```typescript
import { useAuthStore } from '@/src/stores/useAuthStore';
import { showToast } from '@/src/lib/toast';
import Button from '@/src/components/ui/Button';
```

## Important Notes

- **This is a university project** for Computer Networks III
- **Deadline:** November 04, 2025
- **All team members** must be able to explain any part of the application
- **Git commits** will be reviewed to determine individual participation
- The base architecture is implemented - your team needs to:
  1. Connect to your NestJS backend
  2. Adjust types and stores to match your backend
  3. Implement your application's specific features
  4. Add tests, CI/CD, and deploy

## Getting Help

If you encounter issues:
1. Check the comments in the code (TODOs and IMPORTANT notes)
2. Review the assignment PDF (`2025B-CI3-TallerNext.pdf`)
3. Test your backend API endpoints with Postman/Insomnia first
4. Ask Claude Code for help with specific implementations

## Next Steps for Your Team

1. [ ] Configure `.env.local` with your backend URL
2. [ ] Test your backend API endpoints
3. [ ] Adjust `src/lib/types.ts` to match your backend responses
4. [ ] Update `src/stores/useAuthStore.ts` login/register functions
5. [ ] Create stores for your application data using `STORE_TEMPLATE.ts`
6. [ ] Implement your application's pages and components
7. [ ] Add role-based authorization (show/hide UI elements)
8. [ ] Implement pagination in list views
9. [ ] Add form validation with Zod
10. [ ] Write unit and E2E tests
11. [ ] Set up CI/CD pipeline
12. [ ] Deploy to cloud service
13. [ ] Write functionality report
