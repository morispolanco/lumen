"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { UserProfile } from "@/types/lumen";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        user?: UserProfile;
        error?: string;
      };

      if (!res.ok || !data.user) {
        throw new Error(data.error || "No se pudo iniciar sesión.");
      }

      setUser(data.user);
      router.push("/panel");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al iniciar sesión."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
      <div className="bg-white border border-parchment-200 rounded-2xl p-7 sm:p-8 shadow-editorial">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-semibold text-ink-900">
            Iniciar sesión
          </h1>
          <p className="text-sm text-ink-500 mt-1.5">
            Accede a tu historial de búsquedas y a tus fragmentos guardados en
            «Mi biblioteca».
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2.5 text-sm text-red-900">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-ink-900 mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="docente@institucion.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-ink-900 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-crimson-700 text-white text-sm font-semibold hover:bg-crimson-800 transition-colors disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {submitting ? "Verificando..." : "Entrar a Lumen Clásico"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-semibold text-crimson-700 hover:underline"
          >
            Crear cuenta gratuita
          </Link>
        </p>
      </div>
    </div>
  );
}
