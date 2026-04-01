-- Migration 009 — Meta API Auto-post (PRO MAX)
-- Tabelas para conexão de contas Meta e agendamento de posts

-- Conexões de redes sociais (Instagram + Facebook via Meta OAuth)
CREATE TABLE IF NOT EXISTS social_media_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Meta OAuth tokens
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook')),
  account_id TEXT NOT NULL,          -- Instagram Business Account ID / Facebook Page ID
  account_name TEXT,                 -- Display name
  account_username TEXT,             -- @handle
  account_avatar_url TEXT,

  -- Tokens (criptografados em produção via Supabase Vault)
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  page_access_token TEXT,            -- Page token para Facebook

  -- Metadados
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, platform, account_id)
);

ALTER TABLE social_media_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON social_media_connections
  USING (tenant_id = get_tenant_id());

-- Posts agendados/publicados via Meta API
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES social_media_connections(id) ON DELETE SET NULL,

  -- Conteúdo do post
  caption TEXT,
  media_urls TEXT[] DEFAULT '{}',    -- URLs das imagens/vídeos
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'carousel', 'reel')),
  hashtags TEXT[] DEFAULT '{}',

  -- Agendamento
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ,         -- NULL = publicar imediatamente
  published_at TIMESTAMPTZ,

  -- Resultado da publicação
  platform_post_id TEXT,             -- ID do post no Instagram/Facebook
  platform_permalink TEXT,           -- URL do post publicado
  error_message TEXT,

  -- Referência ao conteúdo gerado (opcional)
  reel_creator_content JSONB,        -- snapshot do conteúdo gerado

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON scheduled_posts
  USING (tenant_id = get_tenant_id());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_media_connections_updated_at
  BEFORE UPDATE ON social_media_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_social_media_connections_tenant ON social_media_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_tenant ON scheduled_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for) WHERE status = 'scheduled';

COMMENT ON TABLE social_media_connections IS 'Contas Meta (Instagram/Facebook) conectadas via OAuth — feature PRO MAX';
COMMENT ON TABLE scheduled_posts IS 'Posts agendados ou publicados via Meta Graph API — feature PRO MAX';
