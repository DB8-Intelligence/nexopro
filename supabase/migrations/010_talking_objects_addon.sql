-- Migration 010 — Talking Objects Add-on + Novos Nichos
-- Adiciona addon de Objetos Falantes como produto separado do plano principal
-- e expande os nichos suportados com gastronomia, fitness e financas

-- ── Add-on Talking Objects na tabela tenants ─────────────────────────────────
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS addon_talking_objects BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS addon_talking_objects_stripe_sub TEXT;

-- ── Atualizar CHECK CONSTRAINT de nicho (se existir) ─────────────────────────
-- Remove constraint antiga e recria com os novos nichos
ALTER TABLE tenants
  DROP CONSTRAINT IF EXISTS tenants_niche_check;

ALTER TABLE tenants
  ADD CONSTRAINT tenants_niche_check CHECK (
    niche IN (
      'beleza', 'tecnico', 'saude', 'juridico', 'imoveis',
      'pet', 'educacao', 'nutricao', 'engenharia', 'fotografia',
      'gastronomia', 'fitness', 'financas'
    )
  );

-- ── Índice para consulta rápida de tenants com addon ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_tenants_addon_talking_objects
  ON tenants(addon_talking_objects)
  WHERE addon_talking_objects = TRUE;

-- ── Comentários para documentação ────────────────────────────────────────────
COMMENT ON COLUMN tenants.addon_talking_objects IS
  'Add-on Objetos Falantes: disponível como produto separado (qualquer plano) ou incluso no pro_plus+';
COMMENT ON COLUMN tenants.addon_talking_objects_stripe_sub IS
  'Stripe Subscription ID do add-on Objetos Falantes (separado da assinatura principal)';
