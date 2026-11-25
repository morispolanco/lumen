# Lumen Clásico

**Lumen Clásico** es una aplicación web educativa (*EdTech*) diseñada para docentes y estudiantes de humanidades y ciencias. Permite buscar, presentar con rigor filológico, justificar y explicar pedagógicamente fragmentos auténticos de textos clásicos de la cultura occidental adaptados a **Primaria (6–12 años)**, **Secundaria / Ciclo Básico (13–15 años)** y **Diversificado / Bachillerato (16–18 años)**.

## Características principales

- **Búsqueda pedagógica con enfoque:** Filtra por tema libre, categoría (*Concepto filosófico o humanístico*, *Principio o idea científica*, *Virtud ética o cívica* o *Enseñanza o lección práctica*), nivel educativo y época o tradición clásica.
- **Rigor filológico y transparencia:** Selección estricta de autores y obras reales de la tradición occidental con ficha bibliográfica completa y aviso automático si se presenta una traducción fiel adaptada (`es_parafrasis`).
- **Puente conceptual explícito:** Cada tarjeta destaca de forma diferenciada **«Por qué este texto»**, **«Cómo se relaciona con [tema buscado]»**, la **explicación adaptada al nivel** y una **guía didáctica** con preguntas o actividades para el aula.
- **Integración segura con OpenRouter (solo servidor):** Consulta mediante `/api/search` con modelo principal configurable (`OPENROUTER_PRIMARY_MODEL`) y respaldo automático (`OPENROUTER_FALLBACK_MODEL`).
- **Autenticación y biblioteca personal en Neon:** Registro e inicio de sesión con `bcryptjs` y cookies `httpOnly` firmadas (`HMAC-SHA256`), historial automático de búsquedas, biblioteca de fragmentos guardados filtrable por nivel y categoría, copiado estructurado e impresión de fichas pedagógicas.

## Pila tecnológica

- **Framework:** Next.js 14 (App Router), TypeScript y Tailwind CSS
- **Base de datos:** Neon (PostgreSQL serverless) mediante `@neondatabase/serverless`
- **IA:** OpenRouter API (Route Handler de servidor)
- **Despliegue:** Optimizado para Vercel (Node.js 20+)

---

## Guía de despliegue paso a paso (Neon → GitHub → Vercel)

### Paso 1. Crear la base de datos en Neon y ejecutar `schema.sql`

1. Inicia sesión en [Neon](https://neon.tech) y crea un nuevo proyecto (por ejemplo, `lumen-clasico`).
2. En el panel izquierdo de tu proyecto en Neon, abre **SQL Editor**.
3. Abre el archivo `schema.sql` incluido en la raíz de este repositorio, copia todo su contenido y pégalo en el editor SQL de Neon.
4. Haz clic en **Run** para crear las tablas `users`, `search_history`, `saved_fragments` y sus índices.
5. Ve a **Dashboard → Connection Details**, selecciona la cadena de conexión **Pooled connection** (formato `postgresql://...sslmode=require`) y guárdala para el Paso 3 (`DATABASE_URL`).

### Paso 2. Subir el código a un repositorio nuevo en GitHub

Descomprime `lumen-clasico.zip` en una carpeta local (por ejemplo, `lumen-clasico`). Verifica que `package.json`, `schema.sql` y `README.md` queden en la raíz de esa carpeta.

#### Opción A: Usando comandos `git` desde la terminal

1. Crea un repositorio vacío en [GitHub](https://github.com/new) llamado `lumen-clasico` (sin marcar *Add a README* ni *.gitignore*).
2. En tu terminal, dentro de la carpeta descomprimida, ejecuta:

```bash
git init
git add .
git commit -m "Versión inicial de Lumen Clásico"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/lumen-clasico.git
git push -u origin main
```

#### Opción B: Desde la interfaz web de GitHub

1. Crea un repositorio vacío en [GitHub](https://github.com/new).
2. Haz clic en **uploading an existing file**, arrastra todos los archivos y carpetas de la raíz del proyecto (asegurándote de no incluir `node_modules` ni `.env.local`) y confirma con **Commit changes**.

### Paso 3. Importar en Vercel y configurar variables de entorno

1. Inicia sesión en [Vercel](https://vercel.com) y haz clic en **Add New… → Project**.
2. Selecciona tu repositorio `lumen-clasico` de GitHub y pulsa **Import**.
3. En **Framework Preset**, Vercel detectará automáticamente **Next.js**. No necesitas modificar el comando de compilación (`next build`).
4. Abre la sección **Environment Variables** y agrega las siguientes variables (puedes usar `.env.example` como referencia):

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL de Neon | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `OPENROUTER_API_KEY` | Tu clave de API de [OpenRouter](https://openrouter.ai/keys) | `sk-or-v1-...` |
| `OPENROUTER_PRIMARY_MODEL` | Modelo principal en OpenRouter | `anthropic/claude-3.5-sonnet` |
| `OPENROUTER_FALLBACK_MODEL` | Modelo de respaldo si el principal falla | `google/gemini-2.5-pro` |
| `AUTH_SECRET` | Cadena aleatoria segura (mín. 32 caracteres) para firmar sesiones | Genera con `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | URL pública de tu despliegue en Vercel | `https://lumen-clasico.vercel.app` |

5. Haz clic en **Deploy**. En 1–2 minutos tu aplicación quedará publicada en producción.
6. *(Opcional)* Una vez que Vercel te asigne el dominio final, actualiza `NEXT_PUBLIC_APP_URL` en **Settings → Environment Variables** si cambió respecto al valor inicial y realiza un **Redeploy**.

---

## Desarrollo local

Si deseas ejecutar el proyecto en tu equipo antes de desplegar:

```bash
# 1. Instala dependencias (requiere Node.js 20+)
npm install

# 2. Crea tu archivo local de variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales reales de Neon, OpenRouter y AUTH_SECRET

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del proyecto

```text
.
├── .env.example
├── .eslintrc.json
├── .gitignore
├── README.md
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── schema.sql
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── login/route.ts
    │   │   │   ├── logout/route.ts
    │   │   │   ├── me/route.ts
    │   │   │   └── register/route.ts
    │   │   ├── history/route.ts
    │   │   ├── saved/route.ts
    │   │   └── search/route.ts
    │   ├── login/page.tsx
    │   ├── panel/page.tsx
    │   ├── registro/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── AuthProvider.tsx
    │   ├── FragmentCard.tsx
    │   ├── Navbar.tsx
    │   ├── SearchSkeleton.tsx
    │   └── SearchWorkspace.tsx
    ├── lib/
    │   ├── auth.ts
    │   ├── db.ts
    │   ├── openrouter.ts
    │   └── printSheet.ts
    └── types/
        └── lumen.ts
```
