'use client';

import React from 'react';
import type { Permission } from '@/src/lib/types';

interface PermissionsTableProps {
  permissions: Permission[];
}

export default function PermissionsTable({ permissions }: PermissionsTableProps) {
  const rows = Array.isArray(permissions) ? permissions : [];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">
                Descripción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {p.description || <span className="text-slate-400">Sin descripción</span>}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-sm text-slate-500">
                  No hay permisos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
