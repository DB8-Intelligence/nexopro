-- ============================================================
-- Migration 008: Content Personas
-- Adds content_persona_id to tenant_settings so each tenant can
-- have a persistent AI content strategy persona.
-- ============================================================

ALTER TABLE tenant_settings
  ADD COLUMN IF NOT EXISTS content_persona_id text;

COMMENT ON COLUMN tenant_settings.content_persona_id IS
  'ID da persona de conteúdo selecionada pelo tenant (financeiro, nutricao, casa, etc.)';
