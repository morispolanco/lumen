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
  fragmento: z.string().min(20),
  autor: z.string().min(2),
  obra: z.string().min(2),
  epoca: z.string().min(2),
  referencia: z.string().min(2),
  es_parafrasis: z.boolean(),
  explicacion_nivel: z.string().min(30),
  justificacion_seleccion: z.string().min(30),
  explicacion_relacion: z.string().min(40),
  guia_didactica: z.array(z.string().min(8)).min(2).max(4),
});

const openRouterResponseSchema = z.object({
  fragmentos: z.array(fragmentSchema).min(2).max(3),
});

const LEVEL_INSTRUCTIONS: Record<EducationLevel, string> = {
  primaria:
    "NIVEL PRIMARIA (6–12 años): Usa lenguaje claro, concreto, cálido y cercano. Elige fragmentos breves y comprensibles (aprox. 25–65 palabras). Explica las ideas con ejemplos cotidianos de la escuela, la familia o los amigos, evitando tecnicismos innecesarios. La guía didáctica debe incluir 2 o 3 preguntas sencillas o una breve actividad participativa.",
  secundaria:
    "NIVEL SECUNDARIA / CICLO BÁSICO (13–15 años): Usa vocabulario intermedio y preciso. Elige fragmentos de extensión moderada (aprox. 50–110 palabras). Incluye el contexto histórico esencial del autor y la obra, fomenta la comprensión crítica y explica las metáforas o argumentos clave. La guía didáctica debe proponer 2 o 3 preguntas de análisis crítico o un mini-debate en clase.",
  diversificado:
    "NIVEL DIVERSIFICADO / BACHILLERATO (16–18 años): Usa rigor conceptual y terminología filosófica, histórica o científica adecuada. Elige fragmentos más extensos y sustanciosos (aprox. 80–160 palabras). Desarrolla el contexto intelectual de la obra y realiza un análisis argumentativo preciso de las premisas del pasaje. La guía didáctica debe incluir 2 o 3 preguntas de discusión profunda o una consigna breve de comentario de texto.",
};

const SYSTEM_PROMPT = `Eres un filólogo clásico, historiador de las ideas y especialista en didáctica de las humanidades y de la ciencia en lengua española. Tu misión en la plataforma educativa «Lumen Clásico» es seleccionar, presentar con rigor textual, justificar y explicar pedagógicamente entre 2 y 3 fragmentos auténticos de textos clásicos de la cultura occidental que ilustren un tema buscado por un docente o estudiante.

REGLAS ESTRICTAS DE VERACIDAD FILOLÓGICA:
1. Cita ÚNICAMENTE autores y obras reales de la cultura occidental (por ejemplo: Homero, Esopo, Hesíodo, Heráclito, Sófocles, Eurípides, Tucídides, Hipócrates, Platón, Aristóteles, Euclides, Arquímedes, Cicerón, Lucrecio, Virgilio, Horacio, Séneca, Epicteto, Quintiliano, Plutarco, Marco Aurelio, San Agustín, Boecio, Tomás de Aquino, Dante Alighieri, Petrarca, Erasmo de Róterdam, Juan Luis Vives, Michel de Montaigne, Miguel de Cervantes, Francis Bacon, Galileo Galilei, René Descartes, Blaise Pascal, Baltasar Gracián, Isaac Newton, John Locke, Montesquieu, David Hume, Immanuel Kant, entre otros autores clásicos verificables).
2. Indica SIEMPRE: autor, título de la obra en español (y título original si ayuda), época o siglo, y ubicación aproximada verificable (libro, capítulo, carta, diálogo, sección o canto).
3. PROHIBIDO INVENTAR CITAS, OBRAS O ATRIBUCIONES FALSAS. Si no recuerdas con certeza la traducción literal exacta de una edición publicada, presenta una traducción fiel y rigurosa del pasaje real que sí conoces y marca OBLIGATORIAMENTE "es_parafrasis": true. Marca "es_parafrasis": false únicamente cuando se trate de una traducción literal fiel y reconocida del pasaje original.
4. En el campo "fragmento", emplea comillas angulares « » cuando corresponda (por ejemplo, para citas internas o diálogos) y cuida la ortografía y puntuación según la norma de la RAE.

EXIGENCIA CENTRAL DE JUSTIFICACIÓN Y RELACIÓN PEDAGÓGICA:
5. No basta con citar el texto y resumirlo. Para cada fragmento debes:
   - En "justificacion_seleccion": argumentar explícitamente POR QUÉ elegiste este autor y este pasaje concreto frente a otros posibles para enseñar el tema en ese nivel escolar.
   - En "explicacion_relacion": explicar con precisión CÓMO se conecta el fragmento con el tema y enfoque buscados, citando palabras clave, metáforas, premisas o acciones concretas del propio texto (entre comillas angulares « ») para demostrar el puente lógico, traducido al nivel educativo solicitado. Evita generalidades vagas.
   - En "explicacion_nivel": explicar claramente el sentido literal y el contexto histórico/intelectual del fragmento, redactado específicamente para la edad del estudiante.
   - En "guia_didactica": incluir un arreglo de 2 o 3 preguntas de reflexión o una actividad breve sugerida para el aula que refuerce precisamente ese puente conceptual.

FORMATO DE SALIDA OBLIGATORIO:
Devuelve EXCLUSIVAMENTE un objeto JSON válido (sin texto adicional antes ni después, sin bloques markdown) con esta estructura exacta:
{
  "fragmentos": [
    {
      "fragmento": "Texto clásico...",
      "autor": "Nombre del autor",
      "obra": "Título de la obra",
      "epoca": "Época y siglo (ej. Antigüedad clásica, s. IV a. C.)",
      "referencia": "Ubicación precisa (ej. Libro V, cap. 1, 1129b)",
      "es_parafrasis": false,
      "explicacion_nivel": "Explicación clara del sentido literal y contexto adaptada al nivel...",
      "justificacion_seleccion": "Argumento de por qué se eligió este pasaje frente a otros posibles...",
      "explicacion_relacion": "Análisis detallado del vínculo citando expresiones concretas del fragmento...",
      "guia_didactica": [
        "Pregunta o actividad 1...",
        "Pregunta o actividad 2...",
        "Pregunta o actividad 3..."
      ]
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

async function callSingleOpenRouterModel(params: {
  model: string;
  apiKey: string;
  appUrl: string;
  userPrompt: string;
}): Promise<ClassicalFragment[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
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
        body: JSON.stringify({
          model: params.model,
          temperature: 0.35,
          max_tokens: 3400,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: params.userPrompt },
          ],
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `OpenRouter respondió con estado ${response.status} (${params.model}): ${errorBody.slice(0, 240)}`
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
      error?: { message?: string };
    };

    if (data.error?.message) {
      throw new Error(`Error de OpenRouter (${params.model}): ${data.error.message}`);
    }

    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== "string") {
      throw new Error(`Respuesta vacía del modelo ${params.model}.`);
    }

    const jsonString = extractJsonObject(rawContent);
    const parsedJson: unknown = JSON.parse(jsonString);
    const validated = openRouterResponseSchema.parse(parsedJson);

    return validated.fragmentos;
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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la variable de entorno OPENROUTER_API_KEY en el servidor."
    );
  }

  const primaryModel =
    process.env.OPENROUTER_PRIMARY_MODEL?.trim() || "anthropic/claude-3.5-sonnet";
  const fallbackModel =
    process.env.OPENROUTER_FALLBACK_MODEL?.trim() || "google/gemini-2.5-pro";
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
    `Devuelve entre 2 y 3 fragmentos clásicos distintos (de autores diferentes cuando sea posible) en el formato JSON especificado.`,
  ].join("\n\n");

  try {
    const fragmentos = await callSingleOpenRouterModel({
      model: primaryModel,
      apiKey,
      appUrl,
      userPrompt,
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
    });
    return { fragmentos, modelUsed: fallbackModel, usedFallback: true };
  }
}
