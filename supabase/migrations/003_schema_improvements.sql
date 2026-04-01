-- ============================================================
-- NexoPro — Schema Improvements (003)
-- Melhorias seletivas baseadas no schema revisado
-- Não remove nada das migrations 001 e 002
-- ============================================================

-- ============================================================
-- 1. tenant_settings — campos operacionais adicionais
-- ============================================================

ALTER TABLE tenant_settings
  ADD COLUMN IF NOT EXISTS working_hours JSONB NOT NULL DEFAULT '{
    "monday":    {"open": "08:00", "close": "18:00", "active": true},
    "tuesday":   {"open": "08:00", "close": "18:00", "active": true},
    "wednesday": {"open": "08:00", "close": "18:00", "active": true},
    "thursday":  {"open": "08:00", "close": "18:00", "active": true},
    "friday":    {"open": "08:00", "close": "18:00", "active": true},
    "saturday":  {"open": "08:00", "close": "13:00", "active": false},
    "sunday":    {"open": "00:00", "close": "00:00", "active": false}
  }',
  ADD COLUMN IF NOT EXISTS appointment_duration INT NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo';

-- ============================================================
-- 2. appointments — suporte a reuniões online e localização
-- ============================================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS location   TEXT,
  ADD COLUMN IF NOT EXISTS is_online  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS meeting_url TEXT;

-- ============================================================
-- 3. clients — meta JSONB e campo de status explícito
-- ============================================================

-- Adiciona meta JSONB para campos extras por nicho
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}';

-- Status explícito (active/inactive/blocked) — mais granular que is_active
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'blocked'));

-- Sincroniza status com is_active existente via trigger
CREATE OR REPLACE FUNCTION sync_client_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    NEW.is_active := TRUE;
  ELSE
    NEW.is_active := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_client_status
  BEFORE INSERT OR UPDATE OF status ON clients
  FOR EACH ROW EXECUTE FUNCTION sync_client_status();

-- ============================================================
-- 4. transactions — receipt_url e meta JSONB
-- ============================================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS meta        JSONB NOT NULL DEFAULT '{}';

-- ============================================================
-- 5. documents — tags, meta e flag de geração por IA
-- ============================================================

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS tags           TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meta           JSONB   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 6. profiles — last_seen_at para presença online
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- ============================================================
-- 7. Novos índices de performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_appointments_is_online
  ON appointments(tenant_id, is_online) WHERE is_online = TRUE;

CREATE INDEX IF NOT EXISTS idx_clients_status
  ON clients(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_clients_meta
  ON clients USING GIN(meta);

CREATE INDEX IF NOT EXISTS idx_transactions_meta
  ON transactions USING GIN(meta);

CREATE INDEX IF NOT EXISTS idx_documents_tags
  ON documents USING GIN(tags);

-- ============================================================
-- 8. SEED — tenants de demonstração
-- ============================================================

DO $$
DECLARE
  t_imoveis  UUID := uuid_generate_v4();
  t_saude    UUID := uuid_generate_v4();
BEGIN

  -- Tenants demo
  INSERT INTO tenants (id, name, slug, niche, plan, primary_color, is_active)
  VALUES
    (t_imoveis, 'ImóvelPro Demo',  'imovel-pro-demo',  'imoveis', 'pro',     '#C9A84C', TRUE),
    (t_saude,   'ClínicaPro Demo', 'clinica-pro-demo', 'saude',   'starter', '#1A9E6E', TRUE)
  ON CONFLICT (slug) DO NOTHING;

  -- Settings padrão para os demos
  INSERT INTO tenant_settings (tenant_id, business_name, business_email, timezone)
  VALUES
    (t_imoveis, 'ImóvelPro Demo',  'demo@imovel.pro',   'America/Sao_Paulo'),
    (t_saude,   'ClínicaPro Demo', 'demo@clinica.pro',  'America/Sao_Paulo')
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Módulos ativos
  INSERT INTO tenant_modules (tenant_id, module_id, is_enabled)
  VALUES
    -- ImóvelPro (Pro): todos os módulos base + documentos + social + site
    (t_imoveis, 'dashboard',   TRUE),
    (t_imoveis, 'clientes',    TRUE),
    (t_imoveis, 'agenda',      TRUE),
    (t_imoveis, 'financeiro',  TRUE),
    (t_imoveis, 'documentos',  TRUE),
    (t_imoveis, 'social',      TRUE),
    (t_imoveis, 'site',        TRUE),
    -- ClínicaPro (Starter): módulos básicos
    (t_saude,   'dashboard',   TRUE),
    (t_saude,   'clientes',    TRUE),
    (t_saude,   'agenda',      TRUE),
    (t_saude,   'financeiro',  TRUE)
  ON CONFLICT (tenant_id, module_id) DO NOTHING;

  -- Clientes demo para ImóvelPro
  INSERT INTO clients (tenant_id, full_name, email, phone, source, status)
  VALUES
    (t_imoveis, 'Ana Souza',     'ana@email.com',     '(11) 99999-0001', 'instagram', 'active'),
    (t_imoveis, 'Carlos Lima',   'carlos@email.com',  '(11) 99999-0002', 'indicação',  'active'),
    (t_imoveis, 'Mariana Costa', 'mari@email.com',    '(11) 99999-0003', 'google',     'active');

  -- Clientes demo para ClínicaPro
  INSERT INTO clients (tenant_id, full_name, email, phone, source, status)
  VALUES
    (t_saude, 'Pedro Alves',   'pedro@email.com',  '(21) 98888-0001', 'google',    'active'),
    (t_saude, 'Juliana Melo',  'ju@email.com',     '(21) 98888-0002', 'indicação', 'active');

END $$;

-- ============================================================
-- 9. Comentários de documentação nas novas colunas
-- ============================================================

COMMENT ON COLUMN tenant_settings.working_hours
  IS 'Horário de funcionamento por dia da semana em formato JSON';

COMMENT ON COLUMN tenant_settings.appointment_duration
  IS 'Duração padrão dos agendamentos em minutos';

COMMENT ON COLUMN appointments.is_online
  IS 'TRUE para reuniões online (Google Meet, Zoom, etc.)';

COMMENT ON COLUMN clients.meta
  IS 'Campos extras específicos por nicho (ex: CRM de imóveis, prontuário médico)';

COMMENT ON COLUMN clients.status
  IS 'Status do cliente: active, inactive, blocked. Sincronizado com is_active.';

COMMENT ON COLUMN documents.generated_by_ai
  IS 'TRUE quando o conteúdo foi gerado pelo Agente IA Contador ou assistente de documentos';
