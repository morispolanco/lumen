"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { FragmentCard } from "@/components/FragmentCard";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import {
  CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EXAMPLE_QUERIES,
  TRADITION_OPTIONS,
  getCategoryLabel,
  getEducationLevelLabel,
  getTraditionLabel,
  type ClassicalTradition,
  type EducationLevel,
  type FocusCategory,
  type SearchApiResponse,
} from "@/types/lumen";

export function SearchWorkspace() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FocusCategory>("virtud");
  const [educationLevel, setEducationLevel] =
    useState<EducationLevel>("secundaria");
  const [tradition, setTradition] = useState<ClassicalTradition>("todas");

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchApiResponse | null>(null);

  useEffect(() => {
    if (user?.educationLevelPref) {
      setEducationLevel(user.educationLevelPref);
    }
  }, [user?.educationLevelPref]);

  const executeSearch = async (params?: {
    overrideQuery?: string;
    overrideCategory?: FocusCategory;
  }) => {
    const activeQuery = (params?.overrideQuery ?? query).trim();
    const activeCategory = params?.overrideCategory ?? category;

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
          educationLevel,
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

  const handleExampleClick = (example: {
    query: string;
    category: FocusCategory;
  }) => {
    setQuery(example.query);
    setCategory(example.category);
    void executeSearch({
      overrideQuery: example.query,
      overrideCategory: example.category,
    });
  };

  return (
    <div className="space-y-10">
      {/* Formulario de búsqueda pedagógica */}
      <section className="no-print bg-white border border-parchment-200 rounded-2xl p-6 sm:p-8 shadow-editorial">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Tema o término de búsqueda */}
          <div>
            <label
              htmlFor="search-query"
              className="block text-sm font-semibold text-ink-900 mb-2"
            >
              1. Tema o término de búsqueda
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej.: la justicia, el método empírico, la prudencia, el origen del movimiento, la amistad..."
                maxLength={180}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-parchment-300 bg-parchment-50/50 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700 transition-colors"
              />
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-ink-500 mr-1">Sugerencias:</span>
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex.query}
                  type="button"
                  onClick={() => handleExampleClick(ex)}
                  disabled={isSearching}
                  className="text-xs px-2.5 py-1 rounded-full bg-parchment-100 text-ink-700 hover:bg-parchment-200 hover:text-ink-900 transition-colors disabled:opacity-50"
                >
                  {ex.query}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Categoría del enfoque */}
          <div>
            <span className="block text-sm font-semibold text-ink-900 mb-2.5">
              2. Categoría del enfoque
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((option) => {
                const selected = category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      selected
                        ? "border-crimson-700 bg-crimson-50/70 ring-1 ring-crimson-700/20"
                        : "border-parchment-200 bg-parchment-50/40 hover:border-parchment-300 hover:bg-parchment-50"
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold ${
                        selected ? "text-crimson-700" : "text-ink-900"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="block text-xs text-ink-500 mt-0.5 leading-snug">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Nivel educativo */}
          <div>
            <span className="block text-sm font-semibold text-ink-900 mb-2.5">
              3. Nivel educativo del estudiante
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EDUCATION_LEVEL_OPTIONS.map((level) => {
                const selected = educationLevel === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setEducationLevel(level.value)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      selected
                        ? "border-crimson-700 bg-crimson-50/70 ring-1 ring-crimson-700/20"
                        : "border-parchment-200 bg-parchment-50/40 hover:border-parchment-300 hover:bg-parchment-50"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          selected ? "text-crimson-700" : "text-ink-900"
                        }`}
                      >
                        {level.label}
                      </span>
                      <span className="text-[11px] font-medium text-ink-500">
                        {level.ages}
                      </span>
                    </div>
                    <span className="block text-xs text-ink-500 mt-1 leading-snug">
                      {level.summary}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Tradición o época (opcional) + Botón de búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-t border-parchment-100">
            <div className="sm:w-72">
              <label
                htmlFor="tradition-select"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5"
              >
                4. Tradición o época (opcional)
              </label>
              <select
                id="tradition-select"
                value={tradition}
                onChange={(e) =>
                  setTradition(e.target.value as ClassicalTradition)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-parchment-50/60 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-700/25 focus:border-crimson-700"
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
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-crimson-700 text-white text-sm font-semibold hover:bg-crimson-800 focus:outline-none focus:ring-2 focus:ring-crimson-700/40 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {isSearching
                ? "Buscando fragmentos clásicos..."
                : "Buscar y explicar fragmentos"}
            </button>
          </div>
        </form>
      </section>

      {/* Estado de error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3 text-sm text-red-900"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">No se pudo completar la consulta</p>
            <p className="text-red-800 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Esqueletos de carga */}
      {isSearching && <SearchSkeleton />}

      {/* Resultados */}
      {result && !isSearching && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-200 pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">
                Fragmentos sobre «{result.query}»
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                {getCategoryLabel(result.category)} ·{" "}
                {getEducationLevelLabel(result.educationLevel)} ·{" "}
                {getTraditionLabel(result.tradition)}
              </p>
            </div>

            <span className="text-xs text-ink-500 bg-parchment-100 border border-parchment-200 px-3 py-1.5 rounded-full">
              {result.fragmentos.length} fragmentos seleccionados
            </span>
          </div>

          <div className="space-y-6">
            {result.fragmentos.map((fragment, idx) => (
              <FragmentCard
                key={`${fragment.autor}-${fragment.obra}-${idx}`}
                fragment={fragment}
                query={result.query}
                category={result.category}
                educationLevel={result.educationLevel}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* Estado inicial vacío */}
      {!result && !isSearching && !error && (
        <section className="text-center py-8 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-parchment-100 border border-parchment-200 text-crimson-700 mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-ink-900">
            Un puente riguroso entre los clásicos y el aula
          </h2>
          <p className="text-sm text-ink-500 max-w-xl mx-auto mt-1.5 leading-relaxed">
            Cada resultado incluye el pasaje con su ficha bibliográfica, la
            justificación de por qué se eligió ese texto, el puente conceptual
            hacia tu tema y una guía didáctica lista para imprimir o guardar.
          </p>
        </section>
      )}
    </div>
  );
}
