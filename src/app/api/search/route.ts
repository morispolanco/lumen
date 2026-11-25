import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { searchClassicalFragments } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 60;

const searchInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Escribe un tema o concepto de al menos 2 caracteres.")
    .max(180, "La búsqueda es demasiado extensa (máximo 180 caracteres)."),
  category: z.enum(["concepto", "principio", "virtud", "ensenanza"]),
  educationLevel: z.enum(["primaria", "secundaria", "diversificado"]),
  tradition: z
    .enum(["todas", "antiguedad", "edad_media", "renacimiento", "ilustracion"])
    .default("todas"),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = searchInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Parámetros de búsqueda inválidos.",
        },
        { status: 400 }
      );
    }

    const { query, category, educationLevel, tradition } = parsed.data;

    const { fragmentos, modelUsed, usedFallback } =
      await searchClassicalFragments({
        query,
        category,
        educationLevel,
        tradition,
      });

    let historyId: string | undefined;

    const user = await getSessionUser();
    if (user) {
      try {
        const sql = getDb();
        const inserted = await sql`
          INSERT INTO search_history (
            user_id,
            query,
            category,
            education_level,
            tradition,
            results_json,
            model_used
          )
          VALUES (
            ${user.id},
            ${query},
            ${category},
            ${educationLevel},
            ${tradition},
            ${JSON.stringify(fragmentos)}::jsonb,
            ${modelUsed}
          )
          RETURNING id
        `;
        if (inserted[0]?.id) {
          historyId = String(inserted[0].id);
        }
      } catch (dbError) {
        console.error(
          "[/api/search] No se pudo guardar en search_history:",
          dbError
        );
      }
    }

    return NextResponse.json({
      query,
      category,
      educationLevel,
      tradition,
      modelUsed,
      usedFallback,
      historyId,
      fragmentos,
    });
  } catch (error) {
    console.error("[/api/search] Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Ocurrió un error al consultar los textos clásicos.";

    return NextResponse.json(
      {
        error:
          "No se pudieron recuperar fragmentos clásicos en este momento. Intenta de nuevo en unos segundos.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 502 }
    );
  }
}
