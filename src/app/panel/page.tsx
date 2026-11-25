"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  LogIn,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { FragmentCard } from "@/components/FragmentCard";
import {
  CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  getCategoryShortLabel,
  getEducationLevelLabel,
  getTraditionLabel,
  type EducationLevel,
  type FocusCategory,
  type SavedFragmentRecord,
  type SearchHistoryRecord,
} from "@/types/lumen";

type PanelTab = "saved" | "history";

export default function UserPanelPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<PanelTab>("saved");
  const [levelFilter, setLevelFilter] = useState<EducationLevel | "todos">(
    "todos"
  );
  const [categoryFilter, setCategoryFilter] = useState<FocusCategory | "todas">(
    "todas"
  );
  const [searchFilter, setSearchFilter] = useState("");

  const [savedFragments, setSavedFragments] = useState<SavedFragmentRecord[]>(
    []
  );
  const [historyItems, setHistoryItems] = useState<SearchHistoryRecord[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null
  );

  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPanelData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (levelFilter !== "todos") params.set("educationLevel", levelFilter);
      if (categoryFilter !== "todas") params.set("category", categoryFilter);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const [savedRes, historyRes] = await Promise.all([
        fetch(`/api/saved${qs}`, { cache: "no-store" }),
        fetch(`/api/history${qs}`, { cache: "no-store" }),
      ]);

      if (!savedRes.ok || !historyRes.ok) {
        throw new Error(
          "No se pudieron cargar los datos de tu biblioteca e historial."
        );
      }

      const savedData = (await savedRes.json()) as {
        fragments: SavedFragmentRecord[];
      };
      const historyData = (await historyRes.json()) as {
        history: SearchHistoryRecord[];
      };

      setSavedFragments(savedData.fragments ?? []);
      setHistoryItems(historyData.history ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el panel."
      );
    } finally {
      setLoadingData(false);
    }
  }, [user, levelFilter, categoryFilter]);

  useEffect(() => {
    if (user) {
      void fetchPanelData();
    }
  }, [user, fetchPanelData]);

  const handleDeleteSaved = async (id: string) => {
    const res = await fetch(`/api/saved?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSavedFragments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (expandedHistoryId === id) setExpandedHistoryId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="h-32 rounded-2xl bg-parchment-200/60 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white border border-parchment-200 rounded-2xl p-8 shadow-editorial space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-700 mx-auto flex items-center justify-center">
            <BookMarked className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900">
            Mi biblioteca e historial
          </h1>
          <p className="text-sm text-ink-500 leading-relaxed">
            Inicia sesión para consultar tu historial de búsquedas pedagógicas y
            los fragmentos clásicos que hayas guardado por nivel educativo.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson-700 text-white text-sm font-semibold hover:bg-crimson-800"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-parchment-300 text-ink-800 text-sm font-medium hover:bg-parchment-100"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const normalizedTerm = searchFilter.trim().toLowerCase();

  const filteredSaved = savedFragments.filter((item) => {
    if (!normalizedTerm) return true;
    return (
      item.author.toLowerCase().includes(normalizedTerm) ||
      item.work.toLowerCase().includes(normalizedTerm) ||
      item.query.toLowerCase().includes(normalizedTerm) ||
      item.fragmentText.toLowerCase().includes(normalizedTerm)
    );
  });

  const filteredHistory = historyItems.filter((item) => {
    if (!normalizedTerm) return true;
    return item.query.toLowerCase().includes(normalizedTerm);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Cabecera de usuario */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-parchment-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-crimson-700">
            Panel personal · {user.role}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900 mt-1">
            Biblioteca de {user.name}
          </h1>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-crimson-700 text-white text-sm font-medium hover:bg-crimson-800 transition-colors"
        >
          <Search className="w-4 h-4" />
          Nueva búsqueda
        </Link>
      </div>

      {/* Pestañas + Filtros */}
      <div className="bg-white border border-parchment-200 rounded-2xl p-4 sm:p-5 shadow-editorial space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-parchment-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "saved"
                ? "bg-crimson-700 text-white"
                : "text-ink-700 hover:bg-parchment-100"
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Fragmentos guardados ({savedFragments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-crimson-700 text-white"
                : "text-ink-700 hover:bg-parchment-100"
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial de búsquedas ({historyItems.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label
              htmlFor="filter-level"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 mb-1"
            >
              <Filter className="w-3.5 h-3.5" />
              Nivel educativo
            </label>
            <select
              id="filter-level"
              value={levelFilter}
              onChange={(e) =>
                setLevelFilter(e.target.value as EducationLevel | "todos")
              }
              className="w-full px-3 py-2 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900"
            >
              <option value="todos">Todos los niveles</option>
              {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label} ({lvl.ages})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-category"
              className="block text-xs font-semibold text-ink-500 mb-1"
            >
              Categoría del enfoque
            </label>
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as FocusCategory | "todas")
              }
              className="w-full px-3 py-2 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-text"
              className="block text-xs font-semibold text-ink-500 mb-1"
            >
              Filtrar por autor, obra o tema
            </label>
            <input
              id="filter-text"
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Ej.: Aristóteles, justicia..."
              className="w-full px-3 py-2 rounded-xl border border-parchment-300 bg-parchment-50/50 text-sm text-ink-900"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2.5 text-sm text-red-900">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingData ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-parchment-200/50 animate-pulse"
            />
          ))}
        </div>
      ) : activeTab === "saved" ? (
        filteredSaved.length === 0 ? (
          <div className="bg-white border border-parchment-200 rounded-2xl p-10 text-center space-y-2">
            <p className="font-serif text-xl font-semibold text-ink-900">
              Aún no tienes fragmentos guardados con estos filtros
            </p>
            <p className="text-sm text-ink-500">
              Realiza una búsqueda en el explorador y pulsa «Guardar en Mi
              biblioteca» en cualquier ficha pedagógica.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSaved.map((item) => (
              <FragmentCard
                key={item.id}
                savedId={item.id}
                onDeleteSaved={handleDeleteSaved}
                query={item.query || "Consulta guardada"}
                category={item.category}
                educationLevel={item.educationLevel}
                fragment={{
                  fragmento: item.fragmentText,
                  autor: item.author,
                  obra: item.work,
                  epoca: item.epoca || "Tradición clásica",
                  referencia: item.reference,
                  es_parafrasis: item.isParaphrase,
                  explicacion_nivel: item.explanation,
                  justificacion_seleccion: item.selectionJustification,
                  explicacion_relacion: item.relationExplanation,
                  guia_didactica: item.didacticGuide,
                }}
              />
            ))}
          </div>
        )
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white border border-parchment-200 rounded-2xl p-10 text-center space-y-2">
          <p className="font-serif text-xl font-semibold text-ink-900">
            Sin búsquedas registradas para estos filtros
          </p>
          <p className="text-sm text-ink-500">
            Todas las consultas que realices con tu sesión iniciada se guardarán
            automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const isExpanded = expandedHistoryId === item.id;
            const dateStr = new Date(item.createdAt).toLocaleDateString(
              "es-ES",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={item.id}
                className="bg-white border border-parchment-200 rounded-2xl shadow-editorial overflow-hidden"
              >
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl font-semibold text-ink-900">
                        «{item.query}»
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-crimson-50 text-crimson-700 font-medium">
                        {getCategoryShortLabel(item.category)}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-parchment-100 text-ink-700">
                        {getEducationLevelLabel(item.educationLevel)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500">
                      {dateStr} · {getTraditionLabel(item.tradition)} ·{" "}
                      {item.resultsJson.length} fragmentos
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHistoryId(isExpanded ? null : item.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-300 text-xs font-medium text-ink-800 hover:bg-parchment-100"
                    >
                      {isExpanded ? (
                        <>
                          Ocultar fichas
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Ver fichas
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteHistory(item.id)}
                      aria-label="Eliminar búsqueda del historial"
                      className="p-2 rounded-lg text-ink-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-parchment-200 bg-parchment-50/70 p-4 sm:p-6 space-y-5">
                    {item.resultsJson.map((fragment, idx) => (
                      <FragmentCard
                        key={`${item.id}-${idx}`}
                        fragment={fragment}
                        query={item.query}
                        category={item.category}
                        educationLevel={item.educationLevel}
                        index={idx}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
