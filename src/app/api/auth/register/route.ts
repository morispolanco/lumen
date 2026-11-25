import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo (al menos 2 caracteres).")
    .max(120),
  email: z.string().trim().email("Ingresa un correo electrónico válido.").max(255),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128),
  role: z.enum(["docente", "estudiante"]).default("docente"),
  educationLevelPref: z
    .enum(["primaria", "secundaria", "diversificado"])
    .default("secundaria"),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Datos de registro inválidos.",
        },
        { status: 400 }
      );
    }

    const { name, password, role, educationLevelPref } = parsed.data;
    const normalizedEmail = parsed.data.email.toLowerCase();

    const sql = getDb();
    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con ese correo electrónico." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const inserted = await sql`
      INSERT INTO users (name, email, password_hash, role, education_level_pref)
      VALUES (${name}, ${normalizedEmail}, ${passwordHash}, ${role}, ${educationLevelPref})
      RETURNING id, name, email, role, education_level_pref, created_at
    `;

    const user = inserted[0];
    setSessionCookie(String(user.id), String(user.email));

    return NextResponse.json(
      {
        user: {
          id: String(user.id),
          name: String(user.name),
          email: String(user.email),
          role: user.role,
          educationLevelPref: user.education_level_pref,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[/api/auth/register] Error:", error);
    return NextResponse.json(
      {
        error:
          "No fue posible completar el registro. Verifica la conexión con la base de datos.",
      },
      { status: 500 }
    );
  }
}
