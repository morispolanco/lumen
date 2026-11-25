import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateAuthorizationSchema = z.object({
  userId: z.string().uuid("Identificador de usuario inválido."),
  isAuthorized: z.boolean(),
});

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Debes iniciar sesión como administrador." },
        { status: 401 }
      ),
      admin: null,
    };
  }
  if (user.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Acceso restringido únicamente al administrador." },
        { status: 403 }
      ),
      admin: null,
    };
  }
  return { error: null, admin: user };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.education_level_pref,
        u.is_authorized,
        u.created_at,
        (SELECT COUNT(*)::int FROM search_history sh WHERE sh.user_id = u.id) AS searches_count,
        (SELECT COUNT(*)::int FROM saved_fragments sf WHERE sf.user_id = u.id) AS saved_count
      FROM users u
      ORDER BY
        CASE WHEN u.role = 'admin' THEN 2 WHEN u.is_authorized = FALSE THEN 0 ELSE 1 END,
        u.created_at DESC
    `;

    const users = rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: row.role,
      educationLevelPref: row.education_level_pref,
      isAuthorized: row.role === "admin" ? true : Boolean(row.is_authorized),
      createdAt: String(row.created_at),
      searchesCount: Number(row.searches_count || 0),
      savedCount: Number(row.saved_count || 0),
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/admin/users] Error:", err);
    return NextResponse.json(
      { error: "No se pudo obtener la lista de usuarios registrados." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { error, admin } = await requireAdmin();
  if (error || !admin) return error!;

  try {
    const body: unknown = await request.json();
    const parsed = updateAuthorizationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Solicitud inválida." },
        { status: 400 }
      );
    }

    const { userId, isAuthorized } = parsed.data;
    if (userId === admin.id) {
      return NextResponse.json(
        { error: "No puedes modificar el estado de autorización del administrador." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const updated = await sql`
      UPDATE users
      SET is_authorized = ${isAuthorized}
      WHERE id = ${userId} AND role <> 'admin'
      RETURNING id, name, email, role, education_level_pref, is_authorized, created_at
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado o es una cuenta administradora." },
        { status: 404 }
      );
    }

    const row = updated[0];
    return NextResponse.json({
      user: {
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        role: row.role,
        educationLevelPref: row.education_level_pref,
        isAuthorized: Boolean(row.is_authorized),
        createdAt: String(row.created_at),
      },
    });
  } catch (err) {
    console.error("[PATCH /api/admin/users] Error:", err);
    return NextResponse.json(
      { error: "No se pudo actualizar la autorización del usuario." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { error, admin } = await requireAdmin();
  if (error || !admin) return error!;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Falta el identificador del usuario." },
        { status: 400 }
      );
    }
    if (id === admin.id) {
      return NextResponse.json(
        { error: "No puedes eliminar la cuenta administradora." },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      DELETE FROM users
      WHERE id = ${id} AND role <> 'admin'
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users] Error:", err);
    return NextResponse.json(
      { error: "No se pudo eliminar el usuario." },
      { status: 500 }
    );
  }
}
