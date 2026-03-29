-- Migration 012 — Agent Skills + Skill Factory System
-- Sistema de Skills especializadas por nicho para os 7 agentes de IA no n8n

-- ─── Tabela principal de Skills ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_skills (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nicho           TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  app_name        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'ativo'
                  CHECK (status IN ('ativo', 'pausado', 'arquivado', 'pendente_geracao')),

  -- Blocos de conteúdo da Skill
  skill_header        TEXT NOT NULL DEFAULT '',
  pilares             JSONB NOT NULL DEFAULT '[]',
  mix_conteudo        JSONB NOT NULL DEFAULT '{}',
  tom_por_subsegmento JSONB NOT NULL DEFAULT '{}',
  hooks_banco         JSONB NOT NULL DEFAULT '[]',
  templates_legenda   JSONB NOT NULL DEFAULT '[]',
  templates_roteiro   JSONB NOT NULL DEFAULT '[]',
  prompts_ai          JSONB NOT NULL DEFAULT '[]',
  talking_objects     JSONB NOT NULL DEFAULT '[]',
  hashtags            JSONB NOT NULL DEFAULT '{}',
  ctas_banco          JSONB NOT NULL DEFAULT '[]',
  gaps_comuns         JSONB NOT NULL DEFAULT '[]',
  ideias_conteudo     JSONB NOT NULL DEFAULT '[]',
  audiencias_ads      JSONB NOT NULL DEFAULT '{}',

  -- Metadados
  gerado_por  TEXT DEFAULT 'skill-factory-agent',
  gerado_em   TIMESTAMPTZ DEFAULT NOW(),
  versao      INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_nicho  ON agent_skills(nicho);
CREATE INDEX IF NOT EXISTS idx_agent_skills_status ON agent_skills(status);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_agent_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_skills_updated_at
  BEFORE UPDATE ON agent_skills
  FOR EACH ROW EXECUTE FUNCTION update_agent_skills_updated_at();

-- RLS
ALTER TABLE agent_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON agent_skills
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_active" ON agent_skills
  FOR SELECT TO authenticated
  USING (status = 'ativo');

-- ─── Log de geração ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skill_generation_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nicho      TEXT NOT NULL,
  evento     TEXT NOT NULL CHECK (evento IN ('gerado', 'ativado', 'pausado', 'regenerado', 'erro')),
  detalhe    TEXT,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE skill_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON skill_generation_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read" ON skill_generation_log
  FOR SELECT TO authenticated USING (true);

-- ─── Seeds — 13 nichos NexoOmnix ────────────────────────────────────────────
-- Nichos entram como pendente_geracao; o Skill Factory Agent preenche os campos

INSERT INTO agent_skills (nicho, display_name, app_name, status, skill_header,
  pilares, mix_conteudo, tom_por_subsegmento, hooks_banco, templates_legenda,
  templates_roteiro, prompts_ai, talking_objects, hashtags, ctas_banco,
  gaps_comuns, ideias_conteudo, audiencias_ads)
VALUES
  ('beleza',      'Salão de Beleza',             'Salão Pro',      'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('saude',       'Clínica de Saúde',             'Clínica Pro',    'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('juridico',    'Escritório Jurídico',           'Juris Pro',      'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('educacao',    'Educação e Cursos',             'Edu Pro',        'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('nutricao',    'Nutrição e Personal Trainer',   'Nutri Pro',      'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('pet',         'Pet e Veterinário',             'Pet Pro',        'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('engenharia',  'Engenharia e Arquitetura',      'Obra Pro',       'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('fotografia',  'Fotografia e Audiovisual',      'Foto Pro',       'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('tecnico',     'Serviços Técnicos',             'Técnico Pro',    'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('imoveis',     'Imobiliária',                   'Imob Pro',       'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('gastronomia', 'Restaurante e Bar',             'Gastro Pro',     'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('fitness',     'Academia e Personal',           'Fitness Pro',    'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}'),
  ('financas',    'Contabilidade e Finanças',      'Finanças Pro',   'pendente_geracao', '', '[]', '{}', '{}', '[]', '[]', '[]', '[]', '[]', '{}', '[]', '[]', '[]', '{}')
ON CONFLICT (nicho) DO NOTHING;