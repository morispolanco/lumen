-- =============================================================================
-- Lumen Clásico — Esquema inicial y migración idempotente para Neon (PostgreSQL)
-- Ejecuta este script completo en el SQL Editor de tu proyecto en Neon.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de usuarios registrados
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'docente'
    CHECK (role IN ('docente', 'estudiante', 'admin')),
  education_level_pref VARCHAR(32) NOT NULL DEFAULT 'secundaria'
    CHECK (education_level_pref IN ('primaria', 'secundaria', 'diversificado')),
  is_authorized BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migración segura si la tabla users ya existía previamente
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_authorized BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('docente', 'estudiante', 'admin'));

-- Cuenta administradora inicial (mp@ufm.edu)
INSERT INTO users (name, email, password_hash, role, education_level_pref, is_authorized)
VALUES (
  'Administrador',
  'mp@ufm.edu',
  crypt('Mita1962!', gen_salt('bf', 10)),
  'admin',
  'diversificado',
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_authorized = TRUE,
  password_hash = EXCLUDED.password_hash;

-- 2. Tabla de historial de búsquedas pedagógicas
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  category VARCHAR(64) NOT NULL
    CHECK (category IN ('concepto', 'principio', 'virtud', 'ensenanza')),
  education_level VARCHAR(32) NOT NULL
    CHECK (education_level IN ('primaria', 'secundaria', 'diversificado')),
  tradition VARCHAR(64) NOT NULL DEFAULT 'todas',
  results_json JSONB NOT NULL,
  model_used VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de fragmentos clásicos guardados en «Mi biblioteca»
CREATE TABLE IF NOT EXISTS saved_fragments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL DEFAULT '',
  author VARCHAR(180) NOT NULL,
  work VARCHAR(255) NOT NULL,
  epoca VARCHAR(120) NOT NULL DEFAULT '',
  reference VARCHAR(255) NOT NULL,
  fragment_text TEXT NOT NULL,
  is_paraphrase BOOLEAN NOT NULL DEFAULT FALSE,
  explanation TEXT NOT NULL,
  selection_justification TEXT NOT NULL,
  relation_explanation TEXT NOT NULL,
  didactic_guide JSONB NOT NULL DEFAULT '[]'::jsonb,
  category VARCHAR(64) NOT NULL
    CHECK (category IN ('concepto', 'principio', 'virtud', 'ensenanza')),
  education_level VARCHAR(32) NOT NULL
    CHECK (education_level IN ('primaria', 'secundaria', 'diversificado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para acelerar consultas del panel de usuario y administración
CREATE INDEX IF NOT EXISTS idx_users_authorized_created
  ON users (is_authorized, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_user_created
  ON search_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_filters
  ON search_history (user_id, education_level, category);

CREATE INDEX IF NOT EXISTS idx_saved_fragments_user_created
  ON saved_fragments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_fragments_filters
  ON saved_fragments (user_id, education_level, category);
