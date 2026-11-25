"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getEducationLevelLabel, type AdminUserRow } from "@/types/lumen";

type StatusFilter = "todos" | "pendientes" | "autorizados";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = (await res.json()) as {
        users?: AdminUserRow[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "No se pudo cargar la lista de usuarios.");
      }
      setUsers(data.users ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      void fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleToggleAuthorization = async (
    targetUser: AdminUserRow,
    nextState: boolean
  ) => {
    setBusyUserId(targetUser.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          isAuthorized: nextState,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo actualizar el estado del usuario."
        );
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, isAuthorized: nextState } : u
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar la autorización."
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (targetUser: AdminUserRow) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la cuenta de ${targetUser.name} (${targetUser.email})? Esta acción borrará también su historial y biblioteca.`
    );
    if (!confirmed) return;

    setBusyUserId(targetUser.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users?id=${encodeURIComponent(targetUser.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "No se pudo eliminar el usuario.");
      }
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el usuario."
      );
    } finally {
      setBusyUserId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="h-40 rounded-3xl bg-parchment-200/60 animate-pulse" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-ivory border border-parchment-200 rounded-[26px] p-8 shadow-editorial space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-700 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">
            Acceso restringido
          </h1>
          <p className="text-sm text-ink-500 leading-relaxed">
            Esta página es exclusiva para el administrador de Lumen Clásico.
            Inicia sesión con la cuenta administradora para gestionar las
            autorizaciones de usuarios.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full border border-parchment-300 bg-white text-ink-900 text-sm font-semibold hover:bg-parchment-100"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nonAdminUsers = users.filter((u) => u.role !== "admin");
  const pendingCount = nonAdminUsers.filter((u) => !u.isAuthorized).length;
  const authorizedCount = nonAdminUsers.filter((u) => u.isAuthorized).length;

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (statusFilter === "pendientes" && (u.isAuthorized || u.role === "admin"))
      return false;
    if (statusFilter === "autorizados" && !u.isAuthorized) return false;
    if (!normalizedTerm) return true;
    return (
      u.name.toLowerCase().includes(normalizedTerm) ||
      u.email.toLowerCase().includes(normalizedTerm) ||
      u.role.toLowerCase().includes(normalizedTerm)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-parchment-200 pb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-600">
            ADMINISTRACIÓN · CONTROL DE ACCESO
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 mt-1">
            Gestión de usuarios registrados
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Autoriza o desautoriza el uso de Lumen Clásico para los docentes y
            estudiantes registrados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchUsers()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-parchment-300 bg-white text-xs sm:text-sm font-semibold text-ink-900 hover:bg-parchment-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar lista
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-ivory border border-parchment-200 rounded-2xl p-5 shadow-editorial flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Usuarios registrados
            </p>
            <p className="font-serif text-3xl font-bold text-ink-900 mt-1">
              {nonAdminUsers.length}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-ivory border border-parchment-200 rounded-2xl p-5 shadow-editorial flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-700">
              Pendientes / Desautorizados
            </p>
            <p className="font-serif text-3xl font-bold text-ink-900 mt-1">
              {pendingCount}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-ivory border border-parchment-200 rounded-2xl p-5 shadow-editorial flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Usuarios autorizados
            </p>
            <p className="font-serif text-3xl font-bold text-ink-900 mt-1">
              {authorizedCount}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-ivory border border-parchment-200 rounded-[26px] p-5 shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "todos", label: `Todos (${users.length})` },
              { key: "pendientes", label: `Pendientes (${pendingCount})` },
              { key: "autorizados", label: `Autorizados (${authorizedCount + 1})` },
            ] as Array<{ key: StatusFilter; label: string }>
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === tab.key
                  ? "bg-navy-700 text-white"
                  : "border border-parchment-300 bg-white text-ink-900 hover:bg-parchment-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-parchment-200 bg-white text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2.5 text-sm text-red-900">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Listado de usuarios */}
      {loading && users.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 rounded-2xl bg-parchment-200/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-ivory border border-dashed border-parchment-300 rounded-3xl p-10 text-center text-sm text-ink-500">
          No se encontraron usuarios con los filtros seleccionados.
        </div>
      ) : (
        <div className="bg-ivory border border-parchment-200 rounded-[26px] shadow-editorial overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-parchment-200 bg-parchment-50/70 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  <th className="py-3.5 px-5">Usuario</th>
                  <th className="py-3.5 px-4">Perfil y nivel</th>
                  <th className="py-3.5 px-4">Actividad</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200/70 text-sm">
                {filteredUsers.map((row) => {
                  const isAdminRow = row.role === "admin";
                  const isBusy = busyUserId === row.id;
                  const regDate = row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <tr
                      key={row.id}
                      className="bg-white/60 hover:bg-white transition-colors"
                    >
                      <td className="py-4 px-5">
                        <p className="font-bold text-ink-900">{row.name}</p>
                        <p className="text-xs text-ink-500">{row.email}</p>
                        {regDate && (
                          <p className="text-[11px] text-ink-400 mt-0.5">
                            Registrado el {regDate}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block capitalize text-xs font-semibold text-ink-900">
                          {row.role}
                        </span>
                        <p className="text-xs text-ink-500">
                          {getEducationLevelLabel(row.educationLevelPref)}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-xs text-ink-500">
                        <p>{row.searchesCount} búsquedas</p>
                        <p>{row.savedCount} guardados</p>
                      </td>

                      <td className="py-4 px-4">
                        {isAdminRow ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            Administrador
                          </span>
                        ) : row.isAuthorized ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Autorizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 text-gold-700 border border-gold-100 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Sin autorizar
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {isAdminRow ? (
                          <span className="text-xs text-ink-400">
                            Cuenta principal
                          </span>
                        ) : (
                          <div className="inline-flex items-center justify-end gap-2">
                            {row.isAuthorized ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  void handleToggleAuthorization(row, false)
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-red-200 bg-red-50/70 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                {isBusy ? "Guardando..." : "Desautorizar"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  void handleToggleAuthorization(row, true)
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-navy-700 text-white text-xs font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 shadow-sm"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                {isBusy ? "Guardando..." : "Autorizar"}
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleDeleteUser(row)}
                              title="Eliminar usuario"
                              aria-label={`Eliminar usuario ${row.name}`}
                              className="p-2 rounded-full text-ink-400 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
