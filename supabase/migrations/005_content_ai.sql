-- ============================================================
-- NexoPro — Migration 005: ContentAI Module
-- Suporta: ReelCreator, ContentAI, Talking Objects
-- ============================================================

CREATE TABLE IF NOT EXISTS content_projects (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id                  UUID REFERENCES profiles(id),

  -- Source
  title                    TEXT,
  source_url               TEXT,
  source_description       TEXT,

  -- Config
  status                   TEXT NOT NULL DEFAULT 'pending',
  nicho                    TEXT,
  formato                  TEXT, -- 'reel' | 'post' | 'carrossel' | 'stories'
  plan_at_creation         TEXT,

  -- AI Outputs
  analysis                 JSONB,   -- { title, target_audience, key_messages, tone, suggested_format, scenes, hook, cta }
  generated_scenes         JSONB,   -- [{ id, description, duration_sec, image_prompt }]
  generated_images         JSONB,   -- [{ scene_id, url, prompt }]
  generated_voice_url      TEXT,
  generated_video_url      TEXT,

  -- Content
  generated_post_text      TEXT,
  generated_caption        TEXT,
  generated_hashtags       TEXT[] DEFAULT '{}',
  generated_ctas           JSONB,   -- [{ text, type: 'whatsapp'|'link'|'phone', value }]

  -- Talking Objects
  talking_object_options   JSONB,   -- [{ id, name, emoji, prompt, preview_url }]
  talking_object_selected  JSONB,   -- { id, name, emoji, ... }

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE content_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON content_projects
  USING (tenant_id = get_tenant_id());

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_content_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_projects_updated_at
  BEFORE UPDATE ON content_projects
  FOR EACH ROW EXECUTE FUNCTION update_content_projects_updated_at();
