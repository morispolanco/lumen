"use client";

export function SearchSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-live="polite"
      aria-busy="true"
      aria-label="Buscando fragmentos clásicos..."
    >
      <div className="flex items-center gap-3 text-sm text-ink-500 bg-ivory border border-parchment-200 rounded-2xl px-5 py-3.5 shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-navy-700 animate-ping" />
        <span>
          Consultando fuentes clásicas, verificando referencias y preparando el
          puente pedagógico...
        </span>
      </div>

      {[1, 2].map((index) => (
        <article
          key={index}
          className="bg-ivory border border-parchment-200 rounded-3xl p-6 sm:p-8 shadow-editorial space-y-6 animate-pulse"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="h-4 w-44 rounded-full bg-parchment-200" />
            <div className="h-6 w-32 rounded-full bg-parchment-100" />
          </div>

          <div className="border-l-4 border-navy-700/30 bg-parchment-50 rounded-r-2xl p-5 space-y-2.5">
            <div className="h-4 w-full rounded bg-parchment-200" />
            <div className="h-4 w-11/12 rounded bg-parchment-200" />
            <div className="h-4 w-4/5 rounded bg-parchment-200" />
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-36 rounded bg-parchment-200" />
            <div className="h-3.5 w-full rounded bg-parchment-100" />
            <div className="h-3.5 w-5/6 rounded bg-parchment-100" />
          </div>

          <div className="rounded-2xl bg-gold-50 border border-gold-100 p-4 space-y-2">
            <div className="h-3.5 w-52 rounded bg-gold-100" />
            <div className="h-3.5 w-full rounded bg-gold-100/70" />
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-parchment-200">
            <div className="h-9 w-40 rounded-full bg-parchment-100" />
            <div className="h-9 w-44 rounded-full bg-parchment-100" />
            <div className="h-9 w-36 rounded-full bg-parchment-100" />
          </div>
        </article>
      ))}
    </div>
  );
}
