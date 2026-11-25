import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import type { EducationLevel, UserProfile, UserRole } from "@/types/lumen";

const SESSION_COOKIE_NAME = "lumen_clasico_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "Falta AUTH_SECRET o es demasiado corto (mínimo 16 caracteres). Configúralo en tus variables de entorno."
    );
  }
  return secret;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function createSessionToken(userId: string, email: string): string {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, providedSignature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", getAuthSecret())
      .update(encodedPayload)
      .digest("base64url");

    const providedBuf = Buffer.from(providedSignature, "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");

    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      !decoded ||
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.exp !== "number"
    ) {
      return null;
    }

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  userId: string,
  email: string
): Promise<void> {
  const token = createSessionToken(userId, email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    const sql = getDb();
    const rows = await sql`
      SELECT id, name, email, role, education_level_pref, is_authorized, created_at
      FROM users
      WHERE id = ${payload.userId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    const role = (row.role as UserRole) || "docente";
    return {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role,
      educationLevelPref:
        (row.education_level_pref as EducationLevel) || "secundaria",
      isAuthorized: role === "admin" ? true : Boolean(row.is_authorized),
      createdAt: row.created_at ? String(row.created_at) : undefined,
    };
  } catch {
    return null;
  }
}
