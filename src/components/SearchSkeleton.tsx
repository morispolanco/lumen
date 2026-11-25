"use client";

export function SearchSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-live="polite"
      aria-busy="true"
      aria-label="Buscando fragmentos clásicos..."
    >
      <div className="flex items-center gap-3 text-sm text-ink-500 bg-parchment-100/80 border border-parchment-200 rounded-xl px-4 py-3">
        <span className="w-2.5 h-2.5 rounded-full bg-crimson-700 animate-ping" />
        <span>
          Consultando fuentes clásicas, verificando referencias y preparando la
          justificación pedagógica...
        </span>
      </div>

      {[1, 2].map((index) => (
        <article
          key={index}
          className="bg-white border border-parchment-200 rounded-2xl p-6 sm:p-8 shadow-editorial space-y-6 animate-pulse"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="h-5 w-44 rounded bg-parchment-200" />
            <div className="h-5 w-28 rounded-full bg-parchment-100" />
          </div>

          <div className="border-l-4 border-parchment-300 bg-parchment-50 rounded-r-xl p-5 space-y-2.5">
            <div className="h-4 w-full rounded bg-parchment-200" />
            <div className="h-4 w-11/12 rounded bg-parchment-200" />
            <div className="h-4 w-4/5 rounded bg-parchment-200" />
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-36 rounded bg-parchment-200" />
            <div className="h-3.5 w-full rounded bg-parchment-100" />
            <div className="h-3.5 w-5/6 rounded bg-parchment-100" />
          </div>

          <div className="rounded-xl bg-ochre-50/70 border border-ochre-100 p-4 space-y-2">
            <div className="h-3.5 w-52 rounded bg-ochre-100" />
            <div className="h-3.5 w-full rounded bg-ochre-100/70" />
            <div className="h-3.5 w-10/12 rounded bg-ochre-100/70" />
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-parchment-200">
            <div className="h-9 w-40 rounded-lg bg-parchment-100" />
            <div className="h-9 w-44 rounded-lg bg-parchment-100" />
            <div className="h-9 w-36 rounded-lg bg-parchment-100" />
          </div>
        </article>
      ))}
    </div>
  );
}
