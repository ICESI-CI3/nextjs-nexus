'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { User, Role } from '@/src/lib/types';
import Button from '@/src/components/ui/Button';
import { Can } from '@/src/components/auth/Can';
import { formatDate } from '@/src/lib/utils';
import { get } from '@/src/lib/apiClient';
import { useAuthStore } from '@/src/stores/useAuthStore';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleBlock: (user: User, nextBlocked: boolean) => void;
}

type RoleById = Record<string, Role>;

export default function UsersTable({ users, onEdit, onToggleBlock }: UsersTableProps) {
  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const [roleById, setRoleById] = useState<RoleById>({});
  const currentUser = useAuthStore((s) => s.user);

  const needsRoleCatalog = useMemo(
    () => safeUsers.some((u) => !u.roles?.length && (u.roleIds?.length ?? 0) > 0),
    [safeUsers]
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!needsRoleCatalog) return;
        const roles = await get<Role[]>('/roles');
        if (cancelled) return;
        const map: RoleById = {};
        for (const r of roles) map[r.id] = r;
        setRoleById(map);
      } catch {
        /* sin dramas si falla */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [needsRoleCatalog]);

  const getInitials = (first?: string, last?: string) => {
    const a = (first?.trim?.()[0] ?? '').toUpperCase();
    const b = (last?.trim?.()[0] ?? '').toUpperCase();
    const s = `${a}${b}`.trim();
    return s || '??';
  };

  const Pill: React.FC<{ label: string }> = ({ label }) => (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-[2px] text-[11px] font-medium text-blue-700 ring-1 ring-blue-600/20">
      {label}
    </span>
  );

  const EmptyPill = () => (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-[2px] text-[11px] font-medium text-slate-700">
      Sin roles
    </span>
  );

  const renderRoles = (roles?: Role[], roleIds?: string[]) => {
    const namesFromRoles = roles?.map((r) => r.name).filter(Boolean) ?? [];
    const namesFromIds =
      !namesFromRoles.length && roleIds?.length
        ? roleIds.map((id) => roleById[id]?.name).filter((n): n is string => Boolean(n))
        : [];
    const names = namesFromRoles.length ? namesFromRoles : namesFromIds;
    if (!names.length) return <EmptyPill />;
    return (
      <div className="flex flex-wrap gap-1">
        {names.map((n) => (
          <Pill key={n} label={n} />
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      {/* sin overflow-x-auto: adiós scroll lateral */}
      <table className="min-w-full table-fixed">
        {/* fija proporciones para que todo quepa y el contenido haga wrap */}
        <colgroup>
          <col style={{ width: '32%' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>

        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
              Usuario
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
              Roles
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
              Registro
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 bg-white">
          {safeUsers.map((user) => {
            const blocked = Boolean(user.isBlocked ?? user.isBloqued);
            const isSelf = currentUser?.id === user.id;

            return (
              <tr key={user.id} className="transition-colors hover:bg-slate-50/50">
                {/* Usuario: permitir wrap */}
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium break-words text-slate-900">
                        {(user.firstName ?? '').trim()} {(user.lastName ?? '').trim()}
                      </div>
                      {blocked && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-[1px] text-[10px] font-semibold tracking-wide text-red-700 uppercase ring-1 ring-red-200">
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email: permitir partir palabras largas */}
                <td className="px-4 py-3 align-top text-sm break-all text-slate-600">
                  {user.email}
                </td>

                {/* Roles: ya hace wrap */}
                <td className="px-4 py-3 align-top text-sm text-slate-600">
                  {renderRoles(user.roles, user.roleIds)}
                </td>

                {/* Fecha: puede ir sin wrap, ocupa poco */}
                <td className="px-4 py-3 align-top text-sm whitespace-nowrap text-slate-600">
                  {formatDate((user.createdAt ?? '') as string | Date)}
                </td>

                {/* Acciones compactas */}
                <td className="px-4 py-3 text-right align-top text-sm font-medium whitespace-nowrap">
                  <div className="inline-flex gap-2">
                    <Can permission="UPDATE_USER">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                        Editar
                      </Button>
                    </Can>
                    <Can permission="DELETE_USER">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleBlock(user, !blocked)}
                        className={
                          blocked
                            ? 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        }
                        disabled={isSelf}
                        title={isSelf ? 'No puedes bloquearte a ti mismo' : undefined}
                      >
                        {blocked ? 'Desbloquear' : 'Bloquear'}
                      </Button>
                    </Can>
                  </div>
                </td>
              </tr>
            );
          })}

          {safeUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                No se encontraron usuarios.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
