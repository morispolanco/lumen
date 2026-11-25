export type FocusCategory =
  | "concepto"
  | "principio"
  | "virtud"
  | "ensenanza";

export type EducationLevel = "primaria" | "secundaria" | "diversificado";

export type ClassicalTradition =
  | "todas"
  | "antiguedad"
  | "edad_media"
  | "renacimiento"
  | "ilustracion";

export type UserRole = "docente" | "estudiante" | "admin";

export interface ClassicalFragment {
  fragmento: string;
  autor: string;
  obra: string;
  epoca: string;
  referencia: string;
  es_parafrasis: boolean;
  explicacion_nivel: string;
  justificacion_seleccion: string;
  explicacion_relacion: string;
  guia_didactica: string[];
}

export interface SearchRequestPayload {
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
  tradition: ClassicalTradition;
}

export interface SearchApiResponse {
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
  tradition: ClassicalTradition;
  modelUsed: string;
  usedFallback: boolean;
  historyId?: string;
  fragmentos: ClassicalFragment[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  educationLevelPref: EducationLevel;
  isAuthorized: boolean;
  createdAt?: string;
}

export interface AdminUserRow extends UserProfile {
  searchesCount: number;
  savedCount: number;
}

export interface SavedFragmentRecord {
  id: string;
  userId: string;
  query: string;
  author: string;
  work: string;
  epoca: string;
  reference: string;
  fragmentText: string;
  isParaphrase: boolean;
  explanation: string;
  selectionJustification: string;
  relationExplanation: string;
  didacticGuide: string[];
  category: FocusCategory;
  educationLevel: EducationLevel;
  createdAt: string;
}

export interface SearchHistoryRecord {
  id: string;
  userId: string;
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
  tradition: ClassicalTradition;
  resultsJson: ClassicalFragment[];
  modelUsed: string | null;
  createdAt: string;
}

export const CATEGORY_OPTIONS: Array<{
  value: FocusCategory;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    value: "concepto",
    label: "Concepto filosófico o humanístico",
    shortLabel: "Concepto humanístico",
    description:
      "Ideas sobre el ser, el conocimiento, la libertad, el lenguaje o la ciudad.",
  },
  {
    value: "principio",
    label: "Principio o idea científica",
    shortLabel: "Principio científico",
    description:
      "Observación de la naturaleza, método empírico, causalidad o leyes físicas.",
  },
  {
    value: "virtud",
    label: "Virtud ética o cívica",
    shortLabel: "Virtud ética / cívica",
    description:
      "Hábitos del carácter, justicia, prudencia, templanza, amistad o deber cívico.",
  },
  {
    value: "ensenanza",
    label: "Enseñanza o lección práctica",
    shortLabel: "Enseñanza práctica",
    description:
      "Sabiduría vital, consejo prudencial, formación del criterio y vida cotidiana.",
  },
];

export const EDUCATION_LEVEL_OPTIONS: Array<{
  value: EducationLevel;
  label: string;
  ages: string;
  summary: string;
}> = [
  {
    value: "primaria",
    label: "Primaria",
    ages: "6–12 años",
    summary:
      "Lenguaje claro, concreto y cercano; fragmentos breves y accesibles.",
  },
  {
    value: "secundaria",
    label: "Secundaria / Ciclo Básico",
    ages: "13–15 años",
    summary:
      "Vocabulario intermedio, contexto histórico esencial y comprensión crítica.",
  },
  {
    value: "diversificado",
    label: "Diversificado / Bachillerato",
    ages: "16–18 años",
    summary:
      "Rigor conceptual, lectura más extensa y análisis argumentativo.",
  },
];

export const TRADITION_OPTIONS: Array<{
  value: ClassicalTradition;
  label: string;
}> = [
  { value: "todas", label: "Todas" },
  { value: "antiguedad", label: "Antigüedad grecolatina" },
  { value: "edad_media", label: "Edad Media" },
  { value: "renacimiento", label: "Renacimiento y Siglo de Oro" },
  { value: "ilustracion", label: "Ilustración y Modernidad" },
];

export const EXAMPLE_QUERIES: Array<{
  query: string;
  category: FocusCategory;
}> = [
  { query: "la justicia", category: "virtud" },
  { query: "el método empírico", category: "principio" },
  { query: "la prudencia", category: "virtud" },
  { query: "el origen del movimiento", category: "principio" },
  { query: "la amistad", category: "concepto" },
  { query: "el valor del estudio", category: "ensenanza" },
];

export function getCategoryLabel(value: FocusCategory): string {
  return (
    CATEGORY_OPTIONS.find((item) => item.value === value)?.label ?? value
  );
}

export function getCategoryShortLabel(value: FocusCategory): string {
  return (
    CATEGORY_OPTIONS.find((item) => item.value === value)?.shortLabel ?? value
  );
}

export function getEducationLevelLabel(value: EducationLevel): string {
  const found = EDUCATION_LEVEL_OPTIONS.find((item) => item.value === value);
  return found ? `${found.label} (${found.ages})` : value;
}

export function getTraditionLabel(value: ClassicalTradition): string {
  return (
    TRADITION_OPTIONS.find((item) => item.value === value)?.label ?? value
  );
}
