"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  EDUCATION_LEVEL_OPTIONS,
  type EducationLevel,
  type UserProfile,
  type UserRole,
} from "@/types/lumen";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("docente");
  const [educationLevelPref, setEducationLevelPref] =
    useState<EducationLevel>("secundaria");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          educationLevelPref,
        }),
      });

      const data = (await res.json()) as {
        user?: UserProfile;
        error?: string;
      };

      if (!res.ok || !data.user) {
        throw new Error(data.error || "No se pudo completar el registro.");
      }

      setUser(data.user);
      router.push("/panel");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al crear tu cuenta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white border border-parchment-200 rounded-2xl p-7 sm:p-8 shadow-editorial">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-semibold text-ink-900">
            Crear cuenta
          </h1>
          <p className="text-sm text-ink-500 mt-1.5">
            Guarda tus fichas pedagógicas y organiza tu historial por nivel
            escolar.
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
              htmlFor="reg-name"
              className="block text-sm font-medium text-ink-900 mb-1.5"
            >
              Nombre completo
            </label>
            <input
              id="reg-name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej.: Elena Morales"
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium text-ink-900 mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-medium text-ink-900 mb-1.5"
            >
              Contraseña (mínimo 8 caracteres)
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reg-role"
                className="block text-sm font-medium text-ink-900 mb-1.5"
              >
                Perfil
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
              >
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-level"
                className="block text-sm font-medium text-ink-900 mb-1.5"
              >
                Nivel preferido
              </label>
              <select
                id="reg-level"
                value={educationLevelPref}
                onChange={(e) =>
                  setEducationLevelPref(e.target.value as EducationLevel)
                }
                className="w-full px-3 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
              >
                {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-crimson-700 text-white text-sm font-semibold hover:bg-crimson-800 transition-colors disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-crimson-700 hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
