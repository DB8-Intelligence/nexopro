-- ============================================================
-- Migration 007 — Estoque (Técnico/Pet) + Cursos (Educação)
-- ============================================================

-- --------------------------------------------------------
-- PRODUTOS / ESTOQUE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  sku               TEXT,
  category          TEXT,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost              NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity    INTEGER NOT NULL DEFAULT 0,
  min_quantity      INTEGER NOT NULL DEFAULT 5,
  unit              TEXT DEFAULT 'un',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_products"
  ON products USING (tenant_id = get_tenant_id());

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products (tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (tenant_id, name);

-- updated_at trigger
CREATE OR REPLACE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------
-- CURSOS / TURMAS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT,
  instructor        TEXT,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_hours    INTEGER,
  capacity          INTEGER,
  enrolled          INTEGER NOT NULL DEFAULT 0,
  starts_at         DATE,
  ends_at           DATE,
  schedule          TEXT,
  modality          TEXT DEFAULT 'presencial',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_courses"
  ON courses USING (tenant_id = get_tenant_id());

CREATE INDEX IF NOT EXISTS idx_courses_tenant ON courses (tenant_id);

CREATE OR REPLACE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------
-- MATRICULAS (clientes inscritos em cursos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'ativo',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, client_id)
);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_enrollments"
  ON course_enrollments USING (tenant_id = get_tenant_id());
