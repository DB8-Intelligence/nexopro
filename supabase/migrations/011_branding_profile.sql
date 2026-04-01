-- Migration 011 — Perfil de Branding do Tenant
-- Campos salvos uma vez no primeiro acesso ao ReelCreator
-- Usados automaticamente em todos os prompts Claude subsequentes

ALTER TABLE tenant_settings
  ADD COLUMN IF NOT EXISTS branding_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS branding_about        TEXT,    -- O que você faz
  ADD COLUMN IF NOT EXISTS branding_audience     TEXT,    -- Para quem você trabalha
  ADD COLUMN IF NOT EXISTS branding_tone         TEXT,    -- Tom de comunicação
  ADD COLUMN IF NOT EXISTS branding_differential TEXT,    -- Maior diferencial
  ADD COLUMN IF NOT EXISTS branding_pain_point   TEXT,    -- Dor principal do cliente
  ADD COLUMN IF NOT EXISTS branding_colors       TEXT,    -- Cores da marca
  ADD COLUMN IF NOT EXISTS branding_phrase       TEXT,    -- Slogan / frase que define
  ADD COLUMN IF NOT EXISTS branding_updated_at   TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN tenant_settings.branding_completed    IS 'true após completar o questionário de branding';
COMMENT ON COLUMN tenant_settings.branding_about        IS 'Descrição do negócio (o que faz, especialidades)';
COMMENT ON COLUMN tenant_settings.branding_audience     IS 'Público-alvo (quem são os clientes)';
COMMENT ON COLUMN tenant_settings.branding_tone         IS 'Tom de comunicação: descontraído | formal | inspirador | emocional | educativo';
COMMENT ON COLUMN tenant_settings.branding_differential IS 'Principal diferencial competitivo';
COMMENT ON COLUMN tenant_settings.branding_pain_point   IS 'Dor principal que o negócio resolve';
COMMENT ON COLUMN tenant_settings.branding_colors       IS 'Cores da marca (ex: rosa e dourado)';
COMMENT ON COLUMN tenant_settings.branding_phrase       IS 'Slogan ou frase que define o negócio';
