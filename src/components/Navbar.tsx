"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookMarked,
  BookOpen,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="no-print sticky top-0 z-30 border-b border-parchment-200 bg-parchment-50/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <span className="w-9 h-9 rounded-lg bg-crimson-700 text-parchment-50 flex items-center justify-center shadow-sm group-hover:bg-crimson-800 transition-colors">
            <BookOpen className="w-5 h-5" />
          </span>
          <div className="leading-tight">
            <span className="font-serif text-xl font-semibold tracking-tight text-ink-900 block">
              Lumen Clásico
            </span>
            <span className="text-[11px] text-ink-500 hidden sm:block">
              Biblioteca pedagógica de textos clásicos
            </span>
          </div>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-parchment-100 text-crimson-700"
                : "text-ink-700 hover:bg-parchment-100/70 hover:text-ink-900"
            }`}
          >
            Explorador
          </Link>

          <Link
            href="/panel"
            className={`px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
              pathname === "/panel"
                ? "bg-parchment-100 text-crimson-700"
                : "text-ink-700 hover:bg-parchment-100/70 hover:text-ink-900"
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Mi biblioteca
          </Link>

          <div className="w-px h-5 bg-parchment-200 mx-1" />

          {loading ? (
            <div className="h-8 w-28 rounded-lg bg-parchment-200/70 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="text-right pr-1">
                <p className="text-xs font-semibold text-ink-900 leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-ink-500 capitalize">
                  {user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-300 text-xs font-medium text-ink-700 hover:bg-parchment-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-parchment-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-crimson-700 text-white text-sm font-medium hover:bg-crimson-800 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>

        {/* Botón móvil */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Abrir menú"
          className="md:hidden p-2 rounded-lg text-ink-700 hover:bg-parchment-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="md:hidden border-t border-parchment-200 bg-parchment-50 px-4 py-3 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-900 hover:bg-parchment-100"
          >
            Explorador de textos
          </Link>
          <Link
            href="/panel"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-900 hover:bg-parchment-100"
          >
            Mi biblioteca e historial
          </Link>
          <div className="border-t border-parchment-200 pt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-ink-500">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-300 text-xs font-medium text-ink-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-lg border border-parchment-300 text-sm font-medium text-ink-800"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-lg bg-crimson-700 text-white text-sm font-medium"
                >
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
