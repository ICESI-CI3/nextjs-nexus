'use client';

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User, Role, CreateUserDto, UpdateUserDto } from '@/src/lib/types';
import userService from '@/src/services/userService';
import roleService from '@/src/services/roleService';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';

interface UserFormProps {
  userToEdit?: User | null;
  onSuccess: () => void;
}

/* Schema único compatible con RHF: password opcional aquí.
   En “create” la exigimos manualmente en onSubmit. */
const FormSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  roleIds: z.array(z.string().min(1)).min(1, 'Selecciona al menos un rol'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
});

type FormValues = z.infer<typeof FormSchema>;

/** Deriva roleIds soportando varios formatos del backend */
function deriveInitialRoleIds(user: unknown): string[] {
  const u = user as { roleIds?: unknown; roles?: unknown } | null | undefined;
  if (!u) return [];
  if (Array.isArray(u.roleIds)) {
    return (u.roleIds as unknown[]).filter((x): x is string => typeof x === 'string');
  }
  if (Array.isArray(u.roles)) {
    const raw = u.roles as unknown[];
    const asStrings = raw.filter((x): x is string => typeof x === 'string');
    if (asStrings.length) return asStrings;
    return raw
      .map((r) => {
        const id = (r as { id?: unknown })?.id;
        return typeof id === 'string' ? id : undefined;
      })
      .filter((x): x is string => typeof x === 'string');
  }
  return [];
}

/** Normaliza error desconocido a string sin `any` */
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  const m = err as { message?: unknown; response?: { data?: unknown } } | null;
  const fromResp =
    typeof (m?.response as { data?: { message?: unknown } })?.data === 'object' &&
    (m?.response?.data as { message?: unknown })?.message &&
    typeof (m?.response?.data as { message?: unknown })?.message === 'string'
      ? String((m?.response?.data as { message?: unknown })?.message)
      : undefined;
  if (fromResp) return fromResp;
  if (typeof m?.message === 'string') return m.message;
  try {
    return JSON.stringify(err);
  } catch {
    return 'An unknown error occurred.';
  }
}

export default function UserForm({ userToEdit, onSuccess }: UserFormProps) {
  const isEditMode = Boolean(userToEdit);

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: DefaultValues<FormValues> = {
    firstName: userToEdit?.firstName ?? '',
    lastName: userToEdit?.lastName ?? '',
    email: userToEdit?.email ?? '',
    password: '',
    roleIds: deriveInitialRoleIds(userToEdit),
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  // Rehidratar cuando cambia el usuario a editar
  useEffect(() => {
    reset({
      firstName: userToEdit?.firstName ?? '',
      lastName: userToEdit?.lastName ?? '',
      email: userToEdit?.email ?? '',
      password: '',
      roleIds: deriveInitialRoleIds(userToEdit),
    });
  }, [userToEdit, reset]);

  // Cargar roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const resp = await roleService.getRoles({ page: 1, limit: 100 });
        setAllRoles(resp.data);
      } catch (error: unknown) {
        console.error('Failed to fetch roles:', error);
        setFormError('Could not load roles. Please try again.');
      }
    };
    fetchRoles();
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setFormError(null);

    try {
      // En CREATE exigimos password a mano
      if (!isEditMode && !data.password) {
        setError('password', { type: 'manual', message: 'Requerido en creación' });
        setIsLoading(false);
        return;
      }

      if (isEditMode && userToEdit) {
        const updateData: UpdateUserDto = {
          ...data,
          password: data.password ? data.password : undefined, // no enviar vacío
        };
        await userService.updateUser(userToEdit.id, updateData);
      } else {
        const createData: CreateUserDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password as string, // validado arriba
          roleIds: data.roleIds,
        };
        await userService.createUser(createData);
      }

      onSuccess();

      if (!isEditMode) {
        reset({ firstName: '', lastName: '', email: '', password: '', roleIds: [] });
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      setFormError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
  const labelStyle = 'block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && <FormError message={formError} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelStyle}>
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            className={inputStyle}
            disabled={isLoading || isSubmitting}
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName && <FormError message={String(errors.firstName.message)} />}
        </div>

        <div>
          <label htmlFor="lastName" className={labelStyle}>
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            className={inputStyle}
            disabled={isLoading || isSubmitting}
            aria-invalid={Boolean(errors.lastName)}
          />
          {errors.lastName && <FormError message={String(errors.lastName.message)} />}
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelStyle}>
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={inputStyle}
          disabled={isLoading || isSubmitting}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <FormError message={String(errors.email.message)} />}
      </div>

      <div>
        <label htmlFor="password" className={labelStyle}>
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={inputStyle}
          placeholder={isEditMode ? 'Leave blank to keep unchanged' : ''}
          disabled={isLoading || isSubmitting}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <FormError message={String(errors.password.message)} />}
      </div>

      <div>
        <label htmlFor="roleIds" className={labelStyle}>
          Roles
        </label>
        <select
          id="roleIds"
          multiple
          {...register('roleIds')}
          className={`${inputStyle} h-32`}
          disabled={isLoading || isSubmitting || allRoles.length === 0}
          aria-invalid={Boolean(errors.roleIds)}
        >
          {allRoles.length === 0 ? (
            <option>Loading roles...</option>
          ) : (
            allRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))
          )}
        </select>
        <p className="text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple roles.</p>
        {errors.roleIds && <FormError message={String(errors.roleIds.message)} />}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
