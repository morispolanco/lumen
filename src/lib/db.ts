import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Configúrala con tu cadena de conexión de Neon."
    );
  }
  return neon(databaseUrl);
}
