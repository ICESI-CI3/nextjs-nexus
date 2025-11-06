'use client';

import React from 'react';
import { useForm, type SubmitHandler, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Role, Permission, CreateRoleDto, UpdateRoleDto } from '@/src/lib/types';
import roleService from '@/src/services/roleService';
import permissionService from '@/src/services/permissionService';
import Button from '@/src/components/ui/Button';
import FormError from '@/src/components/ui/FormError';

type Props = {
  roleToEdit?: Role | null;
  onSuccess: () => void;
};

const Schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  permissionIds: z.array(z.string().min(1)).min(1, 'Selecciona al menos 1 permiso'),
});
type FormValues = z.infer<typeof Schema>;

type PermissionPayload = Permission[] | { data?: Permission[] };
function normalizePermissions(resp: PermissionPayload): Permission[] {
  if (Array.isArray(resp)) return resp;
  return Array.isArray(resp?.data) ? resp.data : [];
}

type RoleWithGeneric = Role & { isGeneric?: boolean };

export default function RoleForm({ roleToEdit, onSuccess }: Props) {
  const isEdit = Boolean(roleToEdit);
  const isGeneric = Boolean((roleToEdit as RoleWithGeneric | null)?.isGeneric);

  const [allPerms, setAllPerms] = React.useState<Permission[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const defaultValues: DefaultValues<FormValues> = {
    name: roleToEdit?.name ?? '',
    description: roleToEdit?.description ?? '',
    permissionIds: roleToEdit?.permissionIds ?? [],
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues,
  });

  // Cargar permisos
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await permissionService.getPermissions({ page: 1, limit: 1000 });
        const list = normalizePermissions(resp as PermissionPayload);
        if (!cancelled) setAllPerms(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setAllPerms([]);
          setFormError('No se pudieron cargar los permisos.');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rehidratar al cambiar roleToEdit
  React.useEffect(() => {
    reset({
      name: roleToEdit?.name ?? '',
      description: roleToEdit?.description ?? '',
      permissionIds: roleToEdit?.permissionIds ?? [],
    });
  }, [roleToEdit, reset]);

  // Dual list
  // Memoize watched permissionIds to satisfy exhaustive-deps and avoid re-computation noise
  const watchedPermissionIds = watch('permissionIds');
  const assignedIds = React.useMemo(() => watchedPermissionIds ?? [], [watchedPermissionIds]);
  const assignedSet = React.useMemo(() => new Set(assignedIds), [assignedIds]);

  const availablePerms = React.useMemo(
    () => allPerms.filter((p) => !assignedSet.has(p.id)),
    [allPerms, assignedSet]
  );
  const assignedPerms = React.useMemo(
    () => allPerms.filter((p) => assignedSet.has(p.id)),
    [allPerms, assignedSet]
  );

  const [selAvail, setSelAvail] = React.useState<string[]>([]);
  const [selAssign, setSelAssign] = React.useState<string[]>([]);

  const moveRight = () => {
    if (!selAvail.length) return;
    const merged = Array.from(new Set([...assignedIds, ...selAvail]));
    setValue('permissionIds', merged, { shouldDirty: true, shouldValidate: true });
    setSelAvail([]);
  };
  const moveAllRight = () => {
    if (!availablePerms.length) return;
    const merged = Array.from(new Set([...assignedIds, ...availablePerms.map((p) => p.id)]));
    setValue('permissionIds', merged, { shouldDirty: true, shouldValidate: true });
    setSelAvail([]);
  };
  const moveLeft = () => {
    if (!selAssign.length) return;
    const remaining = assignedIds.filter((id) => !selAssign.includes(id));
    if (remaining.length < 1) {
      setError('permissionIds', { type: 'manual', message: 'Debe quedar al menos 1 permiso' });
      return;
    }
    setValue('permissionIds', remaining, { shouldDirty: true, shouldValidate: true });
    setSelAssign([]);
  };
  const moveAllLeft = () => {
    if (assignedIds.length <= 1) {
      setError('permissionIds', { type: 'manual', message: 'Debe quedar al menos 1 permiso' });
      return;
    }
    setValue('permissionIds', [assignedIds[0]], { shouldDirty: true, shouldValidate: true });
    setSelAssign([]);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setFormError(null);
    try {
      if (isEdit && roleToEdit) {
        if (isGeneric) {
          setFormError('Este rol es genérico y no se puede editar.');
          return;
        }
        const payload: UpdateRoleDto = {
          name: data.name,
          description: data.description,
          permissionIds: data.permissionIds,
        };
        await roleService.updateRole(roleToEdit.id, payload);
      } else {
        const payload: CreateRoleDto = {
          name: data.name,
          description: data.description,
          permissionIds: data.permissionIds,
        };
        await roleService.createRole(payload); // sin isGeneric
      }
      onSuccess();
    } catch (e) {
      console.error(e);
      const msg = (e as { response?: { data?: { message?: string | string[] } } }).response?.data
        ?.message;
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar el rol.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
  const labelStyle = 'block text-sm font-medium text-gray-700';
  const disableAll = isGeneric || isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && <FormError message={formError} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelStyle} htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={inputStyle}
            disabled={disableAll}
            readOnly={isGeneric}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <FormError message={String(errors.name.message)} />}
        </div>

        <div>
          <label className={labelStyle} htmlFor="description">
            Descripción
          </label>
          <input
            id="description"
            type="text"
            {...register('description')}
            className={inputStyle}
            disabled={disableAll}
            readOnly={isGeneric}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <FormError message={String(errors.description.message)} />}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={labelStyle}>Permisos</label>
          <span className="text-xs text-gray-500">
            Asignados: {assignedPerms.length} / {allPerms.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr]">
          {/* Disponibles */}
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600">Disponibles</div>
            <select
              multiple
              className={`${inputStyle} h-40`}
              value={selAvail}
              onChange={(e) =>
                setSelAvail(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
              disabled={disableAll}
            >
              {availablePerms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Controles */}
          <div className="flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={moveRight}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
              disabled={disableAll || selAvail.length === 0}
              aria-label="Asignar seleccionados"
              title="Asignar seleccionados"
            >
              &gt;
            </button>
            <button
              type="button"
              onClick={moveAllRight}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
              disabled={disableAll || availablePerms.length === 0}
              aria-label="Asignar todos"
              title="Asignar todos"
            >
              &gt;&gt;
            </button>
            <button
              type="button"
              onClick={moveLeft}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
              disabled={disableAll || selAssign.length === 0 || assignedPerms.length <= 1}
              aria-label="Quitar seleccionados"
              title="Quitar seleccionados"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={moveAllLeft}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
              disabled={disableAll || assignedPerms.length <= 1}
              aria-label="Quitar todos salvo uno"
              title="Quitar todos salvo uno"
            >
              &lt;&lt;
            </button>
          </div>

          {/* Asignados */}
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600">Asignados</div>
            <select
              multiple
              className={`${inputStyle} h-40`}
              value={selAssign}
              onChange={(e) =>
                setSelAssign(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
              disabled={disableAll}
            >
              {assignedPerms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          Siempre debe quedar al menos 1 permiso en “Asignados”. Usa Ctrl o Cmd para selección
          múltiple.
        </p>
        {errors.permissionIds && <FormError message={String(errors.permissionIds.message)} />}
      </div>

      {!isGeneric && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar rol' : 'Crear rol'}
          </Button>
        </div>
      )}
    </form>
  );
}
