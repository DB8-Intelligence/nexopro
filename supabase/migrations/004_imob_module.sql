-- ============================================================
-- NexoPro — Migration 004: Módulo Imob
-- Criado: Março 2026
-- ============================================================

-- Imóveis (fonte de verdade multi-tenant no Supabase)
CREATE TABLE IF NOT EXISTS properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES profiles(id),
  -- Dados básicos
  title             TEXT,
  description       TEXT,
  price             TEXT,
  city              TEXT,
  neighborhood      TEXT,
  property_type     TEXT,           -- apartamento, casa, comercial, terreno
  property_standard TEXT,           -- economico, padrao, alto, luxo
  investment_value  NUMERIC,
  built_area_m2     NUMERIC,
  highlights        TEXT,
  -- Mídia
  cover_url         TEXT,
  images            TEXT[] DEFAULT '{}',
  -- Status do fluxo IA
  status            TEXT NOT NULL DEFAULT 'new',
  -- new | uploading | processing | caption_ready | video_processing | ready | published | error
  source            TEXT DEFAULT 'manual',
  -- Referência no db8-agent (Railway)
  db8_agent_id      TEXT,
  -- Conteúdo gerado
  generated_caption TEXT,
  generated_video_url TEXT,
  generated_post_text TEXT,
  -- Metadados
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_tenant_isolation"
  ON properties FOR ALL
  USING (tenant_id = get_tenant_id());

-- Trigger updated_at
CREATE OR REPLACE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_properties_status     ON properties(status);

-- -------------------------------------------------------

-- Mídia dos imóveis
CREATE TABLE IF NOT EXISTS property_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'image',   -- image | video
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_media_tenant_isolation"
  ON property_media FOR ALL
  USING (tenant_id = get_tenant_id());

CREATE INDEX IF NOT EXISTS idx_property_media_property_id ON property_media(property_id);

-- -------------------------------------------------------

-- Templates de marca por tenant
CREATE TABLE IF NOT EXISTS brand_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  config      JSONB DEFAULT '{}',
  preview_url TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE brand_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_templates_tenant_isolation"
  ON brand_templates FOR ALL
  USING (tenant_id = get_tenant_id());

CREATE OR REPLACE TRIGGER brand_templates_updated_at
  BEFORE UPDATE ON brand_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
