"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  BookOpenText,
  Check,
  Compass,
  Copy,
  GraduationCap,
  Info,
  Link2,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  formatFragmentForClipboard,
  printPedagogicalSheet,
} from "@/lib/printSheet";
import {
  getCategoryShortLabel,
  getEducationLevelLabel,
  type ClassicalFragment,
  type EducationLevel,
  type FocusCategory,
} from "@/types/lumen";

interface FragmentCardProps {
  fragment: ClassicalFragment;
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
  index?: number;
  savedId?: string;
  onDeleteSaved?: (id: string) => Promise<void>;
}

export function FragmentCard({
  fragment,
  query,
  category,
  educationLevel,
  index,
  savedId,
  onDeleteSaved,
}: FragmentCardProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(savedId));
  const [deleting, setDeleting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [authPrompt, setAuthPrompt] = useState(false);

  const cleanQuote = fragment.fragmento.replace(/^«|»$/g, "").trim();

  const handleCopy = async () => {
    const formatted = formatFragmentForClipboard({
      fragment,
      query,
      category,
      educationLevel,
    });
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setSaveFeedback("No se pudo copiar automáticamente al portapapeles.");
    }
  };

  const handleSave = async () => {
    if (!user) {
      setAuthPrompt(true);
      return;
    }
    if (isSaved || saving) return;

    setSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          author: fragment.autor,
          work: fragment.obra,
          epoca: fragment.epoca,
          reference: fragment.referencia,
          fragmentText: fragment.fragmento,
          isParaphrase: fragment.es_parafrasis,
          explanation: fragment.explicacion_nivel,
          selectionJustification: fragment.justificacion_seleccion,
          relationExplanation: fragment.explicacion_relacion,
          didacticGuide: fragment.guia_didactica,
          category,
          educationLevel,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "No se pudo guardar el fragmento.");
      }

      setIsSaved(true);
      setSaveFeedback("Guardado en «Mi biblioteca».");
    } catch (err) {
      setSaveFeedback(
        err instanceof Error ? err.message : "Error al guardar el fragmento."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!savedId || !onDeleteSaved || deleting) return;
    setDeleting(true);
    try {
      await onDeleteSaved(savedId);
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    printPedagogicalSheet({
      fragment,
      query,
      category,
      educationLevel,
    });
  };

  return (
    <article className="bg-white border border-parchment-200 rounded-2xl shadow-editorial overflow-hidden transition-shadow hover:shadow-md">
      {/* Encabezado bibliográfico superior */}
      <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-parchment-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {typeof index === "number" && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-crimson-50 text-crimson-700 text-xs font-semibold border border-crimson-700/15">
              {index + 1}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-crimson-700">
            {fragment.epoca}
          </span>
          <span className="text-parchment-300">·</span>
          <span className="text-xs text-ink-500">
            {getCategoryShortLabel(category)}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-parchment-100 text-ink-700 text-xs font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-crimson-700" />
          {getEducationLevelLabel(educationLevel)}
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* 1. Fragmento clásico destacado + ficha bibliográfica */}
        <section>
          <blockquote className="relative border-l-4 border-crimson-700 bg-parchment-50 rounded-r-xl px-5 sm:px-7 py-5">
            <p className="font-serif text-xl sm:text-[22px] leading-relaxed text-ink-900 italic">
              «{cleanQuote}»
            </p>
          </blockquote>

          <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <p className="text-ink-900">
              <strong className="font-semibold">{fragment.autor}</strong>,{" "}
              <em className="font-serif text-base">{fragment.obra}</em>{" "}
              <span className="text-ink-500">({fragment.referencia})</span>
            </p>

            {fragment.es_parafrasis && (
              <span
                className="inline-flex items-center gap-1 text-xs text-ink-500 bg-parchment-100 border border-parchment-200 px-2.5 py-0.5 rounded-full"
                title="Traducción fiel del pasaje clásico original para claridad pedagógica"
              >
                <Info className="w-3.5 h-3.5 text-ochre-600" />
                Traducción fiel / paráfrasis rigurosa del pasaje real
              </span>
            )}
          </div>
        </section>

        {/* 2. Por qué este texto */}
        <section className="space-y-1.5">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson-700">
            <Compass className="w-4 h-4" />
            Por qué este texto
          </h3>
          <p className="text-sm sm:text-[15px] leading-relaxed text-ink-700">
            {fragment.justificacion_seleccion}
          </p>
        </section>

        {/* 3. Cómo se relaciona con [tema buscado] — Puente conceptual destacado */}
        <section className="rounded-xl bg-ochre-50 border border-ochre-100 border-l-4 border-l-ochre-600 p-4 sm:p-5 space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ochre-600">
            <Link2 className="w-4 h-4" />
            Cómo se relaciona con «{query || "el tema buscado"}»
          </h3>
          <p className="text-sm sm:text-[15px] leading-relaxed text-ink-900">
            {fragment.explicacion_relacion}
          </p>
        </section>

        {/* 4. Explicación adaptada al nivel + Guía didáctica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <section className="rounded-xl bg-parchment-50/80 border border-parchment-200/80 p-4 sm:p-5 space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
              <BookOpenText className="w-4 h-4 text-crimson-700" />
              Explicación adaptada al nivel
            </h3>
            <p className="text-sm leading-relaxed text-ink-700">
              {fragment.explicacion_nivel}
            </p>
          </section>

          <section className="rounded-xl bg-parchment-50/80 border border-parchment-200/80 p-4 sm:p-5 space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
              <Sparkles className="w-4 h-4 text-crimson-700" />
              Guía didáctica para el aula
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-ink-700">
              {fragment.guia_didactica.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </section>
        </div>

        {/* Aviso si intenta guardar sin sesión */}
        {authPrompt && !user && (
          <div className="rounded-xl bg-crimson-50 border border-crimson-700/20 px-4 py-3 text-sm text-ink-900 flex flex-wrap items-center justify-between gap-3">
            <span>
              Inicia sesión o crea una cuenta gratuita para guardar fragmentos en
              «Mi biblioteca».
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-crimson-700 text-white text-xs font-medium hover:bg-crimson-800"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="px-3 py-1.5 rounded-lg border border-crimson-700/30 text-crimson-700 text-xs font-medium hover:bg-white"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        )}

        {saveFeedback && (
          <p className="text-xs text-ink-500">{saveFeedback}</p>
        )}

        {/* 5. Acciones de la tarjeta */}
        <div className="no-print pt-4 border-t border-parchment-200 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-parchment-300 bg-white text-xs sm:text-sm font-medium text-ink-800 hover:bg-parchment-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                Cita y análisis copiados
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-ink-500" />
                Copiar cita con análisis
              </>
            )}
          </button>

          {!savedId ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isSaved}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isSaved
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                  : "bg-crimson-700 text-white hover:bg-crimson-800 disabled:opacity-60"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Guardado en «Mi biblioteca»
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  {saving ? "Guardando..." : "Guardar en «Mi biblioteca»"}
                </>
              )}
            </button>
          ) : (
            onDeleteSaved && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50/70 text-xs sm:text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Eliminando..." : "Quitar de Mi biblioteca"}
              </button>
            )
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-parchment-300 bg-parchment-50 text-xs sm:text-sm font-medium text-ink-800 hover:bg-parchment-100 transition-colors ml-auto"
          >
            <Printer className="w-4 h-4 text-ink-500" />
            Exportar / Imprimir ficha
          </button>
        </div>
      </div>
    </article>
  );
}
