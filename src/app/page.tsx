import { SearchWorkspace } from "@/components/SearchWorkspace";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
      <section className="no-print text-center max-w-3xl mx-auto mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-crimson-700 mb-3">
          Humanidades · Ciencia · Pedagogía clásica
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900 leading-tight">
          Encuentra el texto clásico exacto para enseñar una gran idea
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-500 leading-relaxed">
          Explora fragmentos auténticos de la tradición occidental con su ficha
          bibliográfica, la justificación de su selección y una explicación clara
          del puente conceptual adaptada a la edad de tus estudiantes.
        </p>
      </section>

      <SearchWorkspace />
    </div>
  );
}
