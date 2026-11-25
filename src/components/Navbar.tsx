"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Shield, X } from "lucide-react";
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
    <header className="no-print sticky top-0 z-30 border-b border-parchment-200/90 bg-parchment-50/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={() => setMobileOpen(false)}
        >
          <span className="w-9 h-9 rounded-xl bg-navy-700 text-white font-serif text-base font-bold tracking-tight flex items-center justify-center shadow-sm group-hover:bg-navy-800 transition-colors">
            LC
          </span>
          <div className="leading-tight">
            <span className="text-sm sm:text-base font-bold tracking-tight text-ink-900 block">
              Lumen Clásico
            </span>
            <span className="text-[11px] text-ink-500 hidden sm:block">
              Humanidades con rigor pedagógico
            </span>
          </div>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/#buscar"
            className={`text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-ink-900"
                : "text-ink-500 hover:text-ink-900"
            }`}
          >
            Buscar
          </Link>

          <Link
            href="/panel"
            className={`text-sm font-medium transition-colors ${
              pathname === "/panel"
                ? "text-navy-700 font-semibold"
                : "text-ink-500 hover:text-ink-900"
            }`}
          >
            Mi biblioteca
          </Link>

          <Link
            href="/panel?tab=history"
            className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
          >
            Historial
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                pathname === "/admin"
                  ? "text-navy-700"
                  : "text-gold-700 hover:text-navy-700"
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}

          {loading ? (
            <div className="h-9 w-36 rounded-full bg-parchment-200/70 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2.5 pl-1">
              <Link
                href={user.role === "admin" ? "/admin" : "/panel"}
                className="px-4 py-2 rounded-full border border-parchment-300 bg-white text-xs font-semibold text-ink-900 hover:bg-parchment-100 transition-colors"
              >
                {user.name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-navy-700 text-white text-xs font-semibold hover:bg-navy-800 transition-colors shadow-sm"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 pl-1">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full border border-parchment-300 bg-white text-xs font-semibold text-ink-900 hover:bg-parchment-100 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="px-4 py-2 rounded-full bg-navy-700 text-white text-xs font-semibold hover:bg-navy-800 transition-colors shadow-sm"
              >
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
          className="md:hidden p-2 rounded-xl text-ink-700 hover:bg-parchment-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="md:hidden border-t border-parchment-200 bg-parchment-50 px-4 py-4 space-y-2">
          <Link
            href="/#buscar"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-ink-900 hover:bg-parchment-100"
          >
            Buscar
          </Link>
          <Link
            href="/panel"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-ink-900 hover:bg-parchment-100"
          >
            Mi biblioteca
          </Link>
          <Link
            href="/panel?tab=history"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-ink-900 hover:bg-parchment-100"
          >
            Historial
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-navy-700 hover:bg-parchment-100"
            >
              <Shield className="w-4 h-4" />
              Panel de administración
            </Link>
          )}
          <div className="border-t border-parchment-200 pt-3">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-ink-500">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-navy-700 text-white text-xs font-semibold"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 rounded-full border border-parchment-300 bg-white text-xs font-semibold text-ink-900"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 rounded-full bg-navy-700 text-white text-xs font-semibold"
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
