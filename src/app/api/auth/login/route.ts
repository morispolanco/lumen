import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Credenciales inválidas.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const sql = getDb();

    const rows = await sql`
      SELECT id, name, email, password_hash, role, education_level_pref, created_at
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Correo electrónico o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const user = rows[0];
    const valid = await verifyPassword(
      parsed.data.password,
      String(user.password_hash)
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Correo electrónico o contraseña incorrectos." },
        { status: 401 }
      );
    }

    setSessionCookie(String(user.id), String(user.email));

    return NextResponse.json({
      user: {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        role: user.role,
        educationLevelPref: user.education_level_pref,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("[/api/auth/login] Error:", error);
    return NextResponse.json(
      {
        error:
          "No fue posible iniciar sesión. Verifica la configuración del servidor.",
      },
      { status: 500 }
    );
  }
}
