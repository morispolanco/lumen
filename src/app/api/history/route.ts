import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para consultar tu historial." },
      { status: 401 }
    );
  }
  if (!user.isAuthorized && user.role !== "admin") {
    return NextResponse.json(
      { error: "Tu cuenta aún no ha sido autorizada por el administrador." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("educationLevel");
    const category = searchParams.get("category");

    const sql = getDb();
    const rows = await sql`
      SELECT id, user_id, query, category, education_level, tradition, results_json, model_used, created_at
      FROM search_history
      WHERE user_id = ${user.id}
        AND (${!level || level === "todos"} OR education_level = ${level})
        AND (${!category || category === "todas"} OR category = ${category})
      ORDER BY created_at DESC
      LIMIT 60
    `;

    const history = rows.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      query: String(row.query),
      category: row.category,
      educationLevel: row.education_level,
      tradition: row.tradition || "todas",
      resultsJson: Array.isArray(row.results_json) ? row.results_json : [],
      modelUsed: row.model_used ? String(row.model_used) : null,
      createdAt: String(row.created_at),
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[GET /api/history] Error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el historial de búsquedas." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!user.isAuthorized && user.role !== "admin") {
    return NextResponse.json(
      { error: "Tu cuenta aún no ha sido autorizada por el administrador." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Falta el identificador del registro." },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      DELETE FROM search_history
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/history] Error:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el registro del historial." },
      { status: 500 }
    );
  }
}
