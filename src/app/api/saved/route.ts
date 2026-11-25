import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const saveFragmentSchema = z.object({
  query: z.string().trim().max(180).default(""),
  author: z.string().trim().min(1).max(180),
  work: z.string().trim().min(1).max(255),
  epoca: z.string().trim().max(120).default(""),
  reference: z.string().trim().min(1).max(255),
  fragmentText: z.string().trim().min(10),
  isParaphrase: z.boolean().default(false),
  explanation: z.string().trim().min(10),
  selectionJustification: z.string().trim().min(10),
  relationExplanation: z.string().trim().min(10),
  didacticGuide: z.array(z.string()).default([]),
  category: z.enum(["concepto", "principio", "virtud", "ensenanza"]),
  educationLevel: z.enum(["primaria", "secundaria", "diversificado"]),
});

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para acceder a tu biblioteca." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("educationLevel");
    const category = searchParams.get("category");

    const sql = getDb();
    const rows = await sql`
      SELECT
        id,
        user_id,
        query,
        author,
        work,
        epoca,
        reference,
        fragment_text,
        is_paraphrase,
        explanation,
        selection_justification,
        relation_explanation,
        didactic_guide,
        category,
        education_level,
        created_at
      FROM saved_fragments
      WHERE user_id = ${user.id}
        AND (${!level || level === "todos"} OR education_level = ${level})
        AND (${!category || category === "todas"} OR category = ${category})
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const fragments = rows.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      query: String(row.query || ""),
      author: String(row.author),
      work: String(row.work),
      epoca: String(row.epoca || ""),
      reference: String(row.reference),
      fragmentText: String(row.fragment_text),
      isParaphrase: Boolean(row.is_paraphrase),
      explanation: String(row.explanation),
      selectionJustification: String(row.selection_justification),
      relationExplanation: String(row.relation_explanation),
      didacticGuide: Array.isArray(row.didactic_guide)
        ? row.didactic_guide.map(String)
        : [],
      category: row.category,
      educationLevel: row.education_level,
      createdAt: String(row.created_at),
    }));

    return NextResponse.json({ fragments });
  } catch (error) {
    console.error("[GET /api/saved] Error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar tus fragmentos guardados." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión para guardar fragmentos en «Mi biblioteca»." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = saveFragmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos del fragmento incompletos o inválidos." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const sql = getDb();

    const inserted = await sql`
      INSERT INTO saved_fragments (
        user_id,
        query,
        author,
        work,
        epoca,
        reference,
        fragment_text,
        is_paraphrase,
        explanation,
        selection_justification,
        relation_explanation,
        didactic_guide,
        category,
        education_level
      )
      VALUES (
        ${user.id},
        ${d.query},
        ${d.author},
        ${d.work},
        ${d.epoca},
        ${d.reference},
        ${d.fragmentText},
        ${d.isParaphrase},
        ${d.explanation},
        ${d.selectionJustification},
        ${d.relationExplanation},
        ${JSON.stringify(d.didacticGuide)}::jsonb,
        ${d.category},
        ${d.educationLevel}
      )
      RETURNING id, created_at
    `;

    return NextResponse.json(
      {
        id: String(inserted[0].id),
        createdAt: String(inserted[0].created_at),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/saved] Error:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el fragmento en tu biblioteca." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Falta el identificador del fragmento." },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      DELETE FROM saved_fragments
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/saved] Error:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el fragmento." },
      { status: 500 }
    );
  }
}
