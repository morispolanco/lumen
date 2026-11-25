import { z } from "zod";
import {
  getCategoryLabel,
  getEducationLevelLabel,
  getTraditionLabel,
  type ClassicalFragment,
  type ClassicalTradition,
  type EducationLevel,
  type FocusCategory,
} from "@/types/lumen";

const fragmentSchema = z.object({
  fragmento: z.string().min(10),
  autor: z.string().min(2),
  obra: z.string().min(2),
  epoca: z.string().min(2),
  referencia: z.string().min(2),
  es_parafrasis: z.boolean().default(false),
  explicacion_nivel: z.string().min(15),
  justificacion_seleccion: z.string().min(15),
  explicacion_relacion: z.string().min(15),
  guia_didactica: z.array(z.string().min(5)).min(1).max(4),
});

const openRouterResponseSchema = z.object({
  fragmentos: z.array(fragmentSchema).min(1).max(3),
});

const LEVEL_INSTRUCTIONS: Record<EducationLevel, string> = {
  primaria:
    "NIVEL PRIMARIA (6–12 años): Usa lenguaje claro, concreto, cálido y cercano. Elige fragmentos breves y comprensibles (25–65 palabras). Explica las ideas con ejemplos cotidianos de la escuela, la familia o los amigos. La guía didáctica debe incluir 2 o 3 preguntas sencillas o una breve actividad participativa.",
  secundaria:
    "NIVEL SECUNDARIA / CICLO BÁSICO (13–15 años): Usa vocabulario intermedio y preciso. Elige fragmentos de extensión moderada (50–100 palabras). Incluye el contexto histórico esencial del autor y la obra, y explica las metáforas o argumentos clave. La guía didáctica debe proponer 2 o 3 preguntas de análisis crítico.",
  diversificado:
    "NIVEL DIVERSIFICADO / BACHILLERATO (16–18 años): Usa rigor conceptual y terminología filosófica, histórica o científica adecuada. Elige fragmentos sustanciosos (75–140 palabras). Desarrolla el contexto intelectual y analiza las premisas del pasaje. La guía didáctica debe incluir 2 o 3 preguntas de discusión o comentario de texto.",
};

const SYSTEM_PROMPT = `Eres un filólogo clásico, historiador de las ideas y especialista en didáctica de las humanidades y de la ciencia en lengua española. Tu misión en «Lumen Clásico» es seleccionar, presentar con rigor textual, justificar y explicar pedagógicamente entre 2 y 3 fragmentos auténticos de textos clásicos de la cultura occidental que ilustren un tema buscado.

REGLAS ESTRICTAS DE VERACIDAD FILOLÓGICA:
1. Cita ÚNICAMENTE autores y obras reales de la cultura occidental (Homero, Esopo, Platón, Aristóteles, Cicerón, Séneca, Quintiliano, Marco Aurelio, San Agustín, Tomás de Aquino, Dante, Juan Luis Vives, Cervantes, Galileo, Descartes, Newton, Baltasar Gracián, Kant, etc.).
2. Indica SIEMPRE: autor, título de la obra, época o siglo, y ubicación aproximada verificable (libro, capítulo, carta, diálogo o canto).
3. PROHIBIDO INVENTAR CITAS. Si no recuerdas la traducción literal exacta, presenta una traducción fiel del pasaje real y marca "es_parafrasis": true.
4. En "fragmento", emplea comillas angulares « » cuando corresponda.

EXIGENCIA CENTRAL DE JUSTIFICACIÓN Y RELACIÓN PEDAGÓGICA:
5. Para cada fragmento debes incluir:
   - "justificacion_seleccion": por qué elegiste este pasaje y autor frente a otros posibles para enseñar el tema en ese nivel escolar.
   - "explicacion_relacion": cómo se conecta el fragmento con el tema y enfoque buscados, citando palabras clave, metáforas, premisas o acciones concretas del propio pasaje (entre comillas angulares « »).
   - "explicacion_nivel": sentido literal y contexto histórico/intelectual adaptado a la edad del estudiante.
   - "guia_didactica": arreglo de 2 o 3 preguntas de reflexión o actividad breve para el aula.

FORMATO DE SALIDA OBLIGATORIO:
Devuelve EXCLUSIVAMENTE un objeto JSON válido (sin texto antes ni después, sin bloques markdown) con esta estructura:
{
  "fragmentos": [
    {
      "fragmento": "Texto clásico...",
      "autor": "Nombre del autor",
      "obra": "Título de la obra",
      "epoca": "Época y siglo",
      "referencia": "Ubicación precisa",
      "es_parafrasis": false,
      "explicacion_nivel": "Explicación adaptada al nivel...",
      "justificacion_seleccion": "Por qué este pasaje...",
      "explicacion_relacion": "Cómo se relaciona citando expresiones del texto...",
      "guia_didactica": ["Pregunta 1", "Pregunta 2", "Pregunta 3"]
    }
  ]
}`;

function extractJsonObject(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch && fencedMatch[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function supportsJsonObjectFormat(model: string): boolean {
  const lower = model.toLowerCase();
  return (
    lower.startsWith("openai/") ||
    lower.startsWith("google/") ||
    lower.startsWith("deepseek/")
  );
}

async function callSingleOpenRouterModel(params: {
  model: string;
  apiKey: string;
  appUrl: string;
  userPrompt: string;
  timeoutMs: number;
}): Promise<ClassicalFragment[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    const payload: Record<string, unknown> = {
      model: params.model,
      temperature: 0.35,
      max_tokens: 2200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: params.userPrompt },
      ],
    };

    if (supportsJsonObjectFormat(params.model)) {
      payload.response_format = { type: "json_object" };
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": params.appUrl,
          "X-Title": "Lumen Clasico",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `OpenRouter devolvió HTTP ${response.status} con ${params.model}: ${errorBody.slice(0, 220)}`
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
      error?: { message?: string };
    };

    if (data.error?.message) {
      throw new Error(
        `OpenRouter (${params.model}): ${data.error.message}`
      );
    }

    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== "string") {
      throw new Error(`Respuesta vacía del modelo ${params.model}.`);
    }

    const jsonString = extractJsonObject(rawContent);
    const parsedJson: unknown = JSON.parse(jsonString);
    const validated = openRouterResponseSchema.parse(parsedJson);

    return validated.fragmentos;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `El modelo ${params.model} superó el tiempo de espera (${Math.round(params.timeoutMs / 1000)}s).`
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchClassicalFragments(params: {
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
  tradition: ClassicalTradition;
}): Promise<{
  fragmentos: ClassicalFragment[];
  modelUsed: string;
  usedFallback: boolean;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Falta la variable de entorno OPENROUTER_API_KEY en Vercel."
    );
  }

  const primaryModel =
    process.env.OPENROUTER_PRIMARY_MODEL?.trim() || "google/gemini-2.5-flash";
  const fallbackModel =
    process.env.OPENROUTER_FALLBACK_MODEL?.trim() || "openai/gpt-4o-mini";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://lumen-clasico.vercel.app";

  const traditionInstruction =
    params.tradition === "todas"
      ? "Puedes seleccionar autores de distintas épocas de la tradición occidental para ofrecer contraste histórico."
      : `Limita estrictamente la selección a autores de la época: ${getTraditionLabel(params.tradition)}.`;

  const userPrompt = [
    `Tema o término de búsqueda: «${params.query}»`,
    `Categoría del enfoque: ${getCategoryLabel(params.category)}`,
    `Nivel educativo destino: ${getEducationLevelLabel(params.educationLevel)}`,
    LEVEL_INSTRUCTIONS[params.educationLevel],
    `Filtro de tradición o época: ${traditionInstruction}`,
    `Devuelve entre 2 y 3 fragmentos clásicos distintos en el formato JSON especificado.`,
  ].join("\n\n");

  try {
    const fragmentos = await callSingleOpenRouterModel({
      model: primaryModel,
      apiKey,
      appUrl,
      userPrompt,
      timeoutMs: 24000,
    });
    return { fragmentos, modelUsed: primaryModel, usedFallback: false };
  } catch (primaryError) {
    if (!fallbackModel || fallbackModel === primaryModel) {
      throw primaryError;
    }

    console.warn(
      `[Lumen Clásico] Falló el modelo principal (${primaryModel}), intentando respaldo (${fallbackModel}):`,
      primaryError instanceof Error ? primaryError.message : primaryError
    );

    const fragmentos = await callSingleOpenRouterModel({
      model: fallbackModel,
      apiKey,
      appUrl,
      userPrompt,
      timeoutMs: 24000,
    });
    return { fragmentos, modelUsed: fallbackModel, usedFallback: true };
  }
}
