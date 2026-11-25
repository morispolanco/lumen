"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Clock, Lock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { FragmentCard } from "@/components/FragmentCard";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import {
  CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  TRADITION_OPTIONS,
  getCategoryLabel,
  getEducationLevelLabel,
  type ClassicalTradition,
  type EducationLevel,
  type FocusCategory,
  type SavedFragmentRecord,
  type SearchApiResponse,
  type SearchHistoryRecord,
} from "@/types/lumen";

export function SearchWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FocusCategory>("concepto");
  const [educationLevel, setEducationLevel] =
    useState<EducationLevel>("primaria");
  const [tradition, setTradition] = useState<ClassicalTradition>("todas");

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchApiResponse | null>(null);

  const [recentSaved, setRecentSaved] = useState<SavedFragmentRecord[]>([]);
  const [recentHistory, setRecentHistory] = useState<SearchHistoryRecord[]>([]);

  const isAuthorized = Boolean(
    user && (user.isAuthorized || user.role === "admin")
  );

  useEffect(() => {
    if (user?.educationLevelPref) {
      setEducationLevel(user.educationLevelPref);
    }
  }, [user?.educationLevelPref]);

  const loadPersonalSummary = useCallback(async () => {
    if (!user || !isAuthorized) {
      setRecentSaved([]);
      setRecentHistory([]);
      return;
    }
    try {
      const [savedRes, historyRes] = await Promise.all([
        fetch("/api/saved", { cache: "no-store" }),
        fetch("/api/history", { cache: "no-store" }),
      ]);
      if (savedRes.ok) {
        const savedData = (await savedRes.json()) as {
          fragments?: SavedFragmentRecord[];
        };
        setRecentSaved((savedData.fragments ?? []).slice(0, 4));
      }
      if (historyRes.ok) {
        const historyData = (await historyRes.json()) as {
          history?: SearchHistoryRecord[];
        };
        setRecentHistory((historyData.history ?? []).slice(0, 4));
      }
    } catch {
      // Silencioso en la vista resumida de inicio
    }
  }, [user, isAuthorized]);

  useEffect(() => {
    void loadPersonalSummary();
  }, [loadPersonalSummary]);

  const executeSearch = async (params?: {
    overrideQuery?: string;
    overrideCategory?: FocusCategory;
    overrideLevel?: EducationLevel;
  }) => {
    if (!user) {
      setError(
        "Debes iniciar sesión con una cuenta autorizada para utilizar el buscador."
      );
      return;
    }
    if (!isAuthorized) {
      setError(
        "Tu cuenta está pendiente de autorización por el administrador."
      );
      return;
    }

    const activeQuery = (params?.overrideQuery ?? query).trim();
    const activeCategory = params?.overrideCategory ?? category;
    const activeLevel = params?.overrideLevel ?? educationLevel;

    if (activeQuery.length < 2) {
      setError(
        "Escribe un tema, concepto, principio científico o virtud de al menos 2 caracteres."
      );
      return;
    }

    setError(null);
    setIsSearching(true);
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeQuery,
          category: activeCategory,
          educationLevel: activeLevel,
          tradition,
        }),
      });

      const data = (await response.json()) as SearchApiResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No fue posible recuperar fragmentos clásicos en este momento."
        );
      }

      setResult(data);
      void loadPersonalSummary();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al realizar la búsqueda."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void executeSearch();
  };

  const handleStartSearchClick = () => {
    const section = document.getElementById("buscar");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  const handleTryExample = () => {
    const exampleQuery = "la prudencia";
    setQuery(exampleQuery);
    setCategory("virtud");
    setEducationLevel("secundaria");
    const section = document.getElementById("resultados");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    void executeSearch({
      overrideQuery: exampleQuery,
      overrideCategory: "virtud",
      overrideLevel: "secundaria",
    });
  };

  const handleOpenHistoryItem = (item: SearchHistoryRecord) => {
    setQuery(item.query);
    setCategory(item.category);
    setEducationLevel(item.educationLevel);
    setTradition(item.tradition);
    setResult({
      query: item.query,
      category: item.category,
      educationLevel: item.educationLevel,
      tradition: item.tradition,
      modelUsed: item.modelUsed || "OpenRouter",
      usedFallback: false,
      historyId: item.id,
      fragmentos: item.resultsJson,
    });
    document
      .getElementById("resultados")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-16">
      {/* 1. HERO EDITORIAL DE DOS COLUMNAS */}
      <section className="no-print grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-4 sm:pt-8">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-600">
            EDTECH · HUMANIDADES · AULA
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-ink-900 leading-[1.06]">
            Textos clásicos explicados para cada etapa educativa.
          </h1>

          <p className="text-base sm:text-[17px] text-ink-500 leading-relaxed max-w-xl">
            Lumen Clásico ayuda a encontrar fragmentos auténticos de la
            tradición occidental y a convertirlos en fichas pedagógicas con
            contexto, justificación y actividades de reflexión.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleStartSearchClick}
              className="px-6 py-3 rounded-full bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
            >
              Comenzar búsqueda
            </button>
            <button
              type="button"
              onClick={handleTryExample}
              disabled={isSearching || !isAuthorized}
              className="px-6 py-3 rounded-full border border-parchment-300 bg-white text-ink-900 text-sm font-semibold hover:bg-parchment-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ver ejemplo
            </button>
          </div>
        </div>

        {/* Tarjeta destacada de Séneca (columna derecha) */}
        <div className="lg:col-span-5">
          <div className="rounded-[28px] bg-ivory border border-parchment-200 p-3 shadow-editorial">
            <div className="rounded-[22px] border border-parchment-200/90 bg-parchment-50/40 p-6 sm:p-7 space-y-5">
              <div className="space-y-2.5">
                <p className="font-serif italic text-xl sm:text-[22px] leading-snug text-ink-700">
                  «No aprendemos para la escuela, sino para la vida.»
                </p>
                <p className="font-serif text-base font-bold text-ink-900">
                  Séneca, Cartas morales a Lucilio
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-2xl bg-white border border-parchment-200 px-3 py-3 text-center">
                  <span className="text-xs font-semibold text-ink-900 leading-tight block">
                    Contexto
                  </span>
                </div>
                <div className="rounded-2xl bg-white border border-parchment-200 px-3 py-3 text-center">
                  <span className="text-xs font-semibold text-ink-900 leading-tight block">
                    Relación conceptual
                  </span>
                </div>
                <div className="rounded-2xl bg-white border border-parchment-200 px-3 py-3 text-center">
                  <span className="text-xs font-semibold text-ink-900 leading-tight block">
                    Guía didáctica
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aviso de estado de acceso / autorización */}
      {!authLoading && !user && (
        <div className="no-print rounded-2xl bg-gold-50 border border-gold-100 px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-sm text-ink-900">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
            <p>
              <strong>Acceso con cuenta autorizada.</strong> Inicia sesión o
              regístrate para solicitar autorización al administrador y utilizar
              el buscador pedagógico.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full border border-parchment-300 bg-white text-xs font-semibold text-ink-900 hover:bg-parchment-100"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-4 py-1.5 rounded-full bg-navy-700 text-white text-xs font-semibold hover:bg-navy-800"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      )}

      {!authLoading && user && !isAuthorized && (
        <div className="no-print rounded-2xl bg-gold-50 border border-gold-100 px-5 py-4 flex items-start gap-3 text-sm text-ink-900">
          <Clock className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-ink-900">
              Cuenta pendiente de autorización
            </p>
            <p className="text-ink-700 mt-0.5">
              Hola, {user.name}. Tu registro fue recibido correctamente, pero el
              administrador aún debe autorizar tu cuenta ({user.email}) para
              habilitar las búsquedas y la biblioteca personal.
            </p>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN BÚSQUEDA GUIADA */}
      <section id="buscar" className="no-print scroll-mt-24 space-y-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-600">
            BÚSQUEDA GUIADA
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 leading-tight">
            Encuentra un fragmento y su puente pedagógico
          </h2>
          <p className="text-sm sm:text-base text-ink-500 leading-relaxed">
            Indica el tema, enfoque, nivel y época. Recibirás tarjetas con cita,
            contexto, justificación y preguntas para el aula.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ivory border border-parchment-200 rounded-[26px] p-5 sm:p-7 shadow-editorial space-y-5"
        >
          {/* Fila 1: Tema (2/3) + Categoría (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label
                htmlFor="search-query"
                className="block text-xs font-bold text-ink-900 mb-2"
              >
                Tema o término de búsqueda
              </label>
              <input
                ref={inputRef}
                id="search-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!isAuthorized}
                placeholder="Ej.: la justicia, la prudencia, el método empírico"
                maxLength={180}
                required
                className="w-full px-4 py-3 rounded-2xl border border-parchment-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700 transition-colors disabled:opacity-60 disabled:bg-parchment-100/60"
              />
            </div>

            <div>
              <label
                htmlFor="category-select"
                className="block text-xs font-bold text-ink-900 mb-2"
              >
                Categoría del enfoque
              </label>
              <select
                id="category-select"
                value={category}
                disabled={!isAuthorized}
                onChange={(e) => setCategory(e.target.value as FocusCategory)}
                className="w-full px-4 py-3 rounded-2xl border border-parchment-200 bg-white text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700 transition-colors disabled:opacity-60"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Nivel educativo (1/3) + Tradición o época (1/3) + Botón (1/3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label
                htmlFor="level-select"
                className="block text-xs font-bold text-ink-900 mb-2"
              >
                Nivel educativo
              </label>
              <select
                id="level-select"
                value={educationLevel}
                disabled={!isAuthorized}
                onChange={(e) =>
                  setEducationLevel(e.target.value as EducationLevel)
                }
                className="w-full px-4 py-3 rounded-2xl border border-parchment-200 bg-white text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700 transition-colors disabled:opacity-60"
              >
                {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label} ({lvl.ages})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tradition-select"
                className="block text-xs font-bold text-ink-900 mb-2"
              >
                Tradición o época
              </label>
              <select
                id="tradition-select"
                value={tradition}
                disabled={!isAuthorized}
                onChange={(e) =>
                  setTradition(e.target.value as ClassicalTradition)
                }
                className="w-full px-4 py-3 rounded-2xl border border-parchment-200 bg-white text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700 transition-colors disabled:opacity-60"
              >
                {TRADITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSearching || !isAuthorized}
              className="w-full px-6 py-3 rounded-full bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-700/35 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Buscando fragmentos..." : "Buscar fragmentos"}
            </button>
          </div>
        </form>
      </section>

      {/* 3. SECCIÓN RESULTADOS */}
      <section id="resultados" className="scroll-mt-24 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-600">
              RESULTADOS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
              Fragmentos recomendados
            </h2>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={!result || isSearching}
            className="no-print px-5 py-2.5 rounded-full border border-parchment-300 bg-white text-xs sm:text-sm font-semibold text-ink-900 hover:bg-parchment-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Imprimir resultados
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3 text-sm text-red-900"
          >
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No se pudo completar la consulta</p>
              <p className="text-red-800 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Esqueletos */}
        {isSearching && <SearchSkeleton />}

        {/* Tarjetas de resultado */}
        {result && !isSearching && (
          <div className="space-y-6">
            {result.fragmentos.map((fragment, idx) => (
              <FragmentCard
                key={`${fragment.autor}-${fragment.obra}-${idx}`}
                fragment={fragment}
                query={result.query}
                category={result.category}
                educationLevel={result.educationLevel}
                index={idx}
                onSaved={() => void loadPersonalSummary()}
              />
            ))}
          </div>
        )}

        {/* Estado vacío con borde punteado igual a la referencia */}
        {!result && !isSearching && !error && (
          <div className="rounded-2xl border border-dashed border-parchment-300 bg-ivory/70 px-6 py-6 text-sm text-ink-500">
            Realiza una búsqueda para generar tarjetas pedagógicas.
          </div>
        )}
      </section>

      {/* 4. PANEL INFERIOR DE 2 COLUMNAS: MI BIBLIOTECA & HISTORIAL */}
      <section className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Tarjeta Mi biblioteca */}
        <div className="bg-ivory border border-parchment-200 rounded-[26px] p-6 shadow-editorial space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl font-bold text-ink-900">
              Mi biblioteca
            </h3>
            <Link
              href="/panel"
              className="px-4 py-1.5 rounded-full border border-parchment-300 bg-white text-xs font-semibold text-ink-900 hover:bg-parchment-100 transition-colors"
            >
              Ver todo
            </Link>
          </div>

          {!user ? (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-parchment-50/50 p-5 text-sm text-ink-500 flex flex-wrap items-center justify-between gap-3">
              <span>Inicia sesión para guardar fragmentos en tu biblioteca.</span>
              <Link
                href="/login"
                className="text-xs font-semibold text-navy-700 hover:underline"
              >
                Iniciar sesión →
              </Link>
            </div>
          ) : !isAuthorized ? (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-parchment-50/50 p-5 text-sm text-ink-500">
              Disponible una vez que el administrador autorice tu cuenta.
            </div>
          ) : recentSaved.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-parchment-50/50 p-5 text-sm text-ink-500">
              Aún no has guardado fragmentos.
            </div>
          ) : (
            <div className="space-y-3">
              {recentSaved.map((item) => (
                <Link
                  key={item.id}
                  href="/panel"
                  className="block rounded-2xl border border-parchment-200 bg-white px-4 py-3.5 hover:border-navy-700/40 transition-colors"
                >
                  <p className="text-sm font-bold text-ink-900">
                    {item.author} ·{" "}
                    <span className="font-serif italic font-semibold">
                      {item.work}
                    </span>
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">
                    {getCategoryLabel(item.category)} ·{" "}
                    {getEducationLevelLabel(item.educationLevel)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tarjeta Historial de búsquedas */}
        <div className="bg-ivory border border-parchment-200 rounded-[26px] p-6 shadow-editorial space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl font-bold text-ink-900">
              Historial de búsquedas
            </h3>
            <Link
              href="/panel?tab=history"
              className="px-4 py-1.5 rounded-full border border-parchment-300 bg-white text-xs font-semibold text-ink-900 hover:bg-parchment-100 transition-colors"
            >
              Ver todo
            </Link>
          </div>

          {!user ? (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-parchment-50/50 p-5 text-sm text-ink-500 flex flex-wrap items-center justify-between gap-3">
              <span>
                Inicia sesión para conservar tu historial de consultas.
              </span>
              <Link
                href="/login"
                className="text-xs font-semibold text-navy-700 hover:underline"
              >
                Iniciar sesión →
              </Link>
            </div>
          ) : !isAuthorized ? (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-parchment-50/50 p-5 text-sm text-ink-500">
              Disponible una vez que el administrador autorice tu cuenta.
            </div>
          ) : recentHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-parchment-50/50 p-5 text-sm text-ink-500">
              Todavía no hay búsquedas en tu historial.
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistory.map((item) => {
                const dateLabel = new Date(item.createdAt).toLocaleString(
                  "es-ES",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenHistoryItem(item)}
                    className="w-full text-left rounded-2xl border border-parchment-200 bg-white px-4 py-3.5 hover:border-navy-700/40 transition-colors"
                  >
                    <p className="text-sm font-bold text-ink-900">
                      {item.query}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {getCategoryLabel(item.category)} ·{" "}
                      {getEducationLevelLabel(item.educationLevel)} · {dateLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
