-- ============================================================
-- NexoPro — Módulo Contábil-Financeiro (002)
-- 5 novas tabelas + Social Media + Media Library
-- ============================================================

-- ============================================================
-- TIPOS ENUM ADICIONAIS
-- ============================================================

create type conta_tipo as enum ('corrente', 'poupanca', 'caixa', 'cartao_credito', 'outros');

create type categoria_grupo as enum (
  'receita_servico', 'receita_produto', 'receita_outros',
  'despesa_pessoal', 'despesa_fixo', 'despesa_variavel',
  'despesa_fiscal', 'despesa_investimento'
);

create type nfse_status as enum ('pendente', 'emitida', 'cancelada', 'erro');

create type obrigacao_tipo as enum ('das', 'iss', 'inss', 'irpf', 'outros');

create type obrigacao_status as enum ('pendente', 'pago', 'vencido', 'dispensado');

create type social_platform as enum ('instagram', 'facebook', 'tiktok', 'youtube', 'linkedin');

create type content_type as enum ('post', 'reel', 'carrossel', 'stories');

create type content_status as enum ('rascunho', 'agendado', 'publicado', 'arquivado');

-- ============================================================
-- TABELA: contas_bancarias
-- ============================================================

create table contas_bancarias (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  nome          text not null,
  tipo          conta_tipo not null default 'corrente',
  banco         text,
  agencia       text,
  conta         text,
  saldo_inicial numeric(12,2) not null default 0,
  saldo_atual   numeric(12,2) not null default 0,
  is_active     boolean not null default true,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- TABELA: categorias_financeiras
-- ============================================================

create table categorias_financeiras (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  nome        text not null,
  grupo       categoria_grupo not null,
  cor         text default '#6366f1',
  is_system   boolean not null default false,  -- categorias padrão do sistema
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TABELA: notas_fiscais
-- ============================================================

create table notas_fiscais (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  transaction_id    uuid references transactions(id) on delete set null,
  client_id         uuid references clients(id) on delete set null,
  -- Dados da NFS-e
  numero            text,
  serie             text,
  codigo_verificacao text,
  status            nfse_status not null default 'pendente',
  -- Valores
  valor_servico     numeric(12,2) not null,
  aliquota_iss      numeric(5,2) default 0,
  valor_iss         numeric(12,2) default 0,
  valor_deducoes    numeric(12,2) default 0,
  valor_liquido     numeric(12,2),
  -- Serviço
  descricao_servico text not null,
  codigo_servico    text,  -- código LC 116/2003
  -- Tomador (cliente)
  tomador_cpf_cnpj  text,
  tomador_nome      text,
  tomador_email     text,
  -- Integração
  provider          text,  -- focus_nfe, enotas
  provider_id       text,  -- ID no provider externo
  provider_response jsonb,
  xml_url           text,
  pdf_url           text,
  -- Datas
  emitida_at        timestamptz,
  cancelada_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- TABELA: obrigacoes_fiscais
-- ============================================================

create table obrigacoes_fiscais (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  tipo              obrigacao_tipo not null,
  descricao         text not null,
  -- Competência
  competencia_mes   integer not null check (competencia_mes between 1 and 12),
  competencia_ano   integer not null,
  -- Valores
  valor_base        numeric(12,2),  -- faturamento base para cálculo
  aliquota          numeric(5,2),
  valor_calculado   numeric(12,2),
  valor_pago        numeric(12,2),
  -- Datas
  vencimento        date not null,
  pago_at           timestamptz,
  status            obrigacao_status not null default 'pendente',
  -- Código de barras / PIX do DARE/DAS
  codigo_barras     text,
  linha_digitavel   text,
  -- Alertas enviados
  alerta_7d_at      timestamptz,
  alerta_1d_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- TABELA: relatorios_contabeis
-- ============================================================

create table relatorios_contabeis (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  tipo            text not null,  -- dre, fluxo_caixa, balancete
  titulo          text not null,
  -- Período
  periodo_inicio  date not null,
  periodo_fim     date not null,
  -- Conteúdo
  dados           jsonb not null default '{}',  -- dados calculados
  pdf_url         text,                          -- PDF gerado
  -- Geração
  gerado_por_ia   boolean not null default false,
  ia_insights     text,                          -- insights do Agente Contador
  created_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: social_profiles
-- ============================================================

create table social_profiles (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  platform        social_platform not null,
  username        text not null,
  display_name    text,
  profile_url     text,
  access_token    text,  -- criptografado em produção
  is_connected    boolean not null default false,
  connected_at    timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(tenant_id, platform)
);

-- ============================================================
-- TABELA: social_content
-- ============================================================

create table social_content (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  type            content_type not null default 'post',
  status          content_status not null default 'rascunho',
  -- Conteúdo
  caption         text,
  hashtags        text[],
  media_urls      text[],
  -- Publicação
  platforms       social_platform[] not null default '{}',
  scheduled_at    timestamptz,
  published_at    timestamptz,
  -- IA
  generated_by_ai boolean not null default false,
  prompt_used     text,
  -- Metadata
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: editorial_calendar
-- ============================================================

create table editorial_calendar (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  content_id      uuid references social_content(id) on delete cascade,
  scheduled_date  date not null,
  theme           text,  -- tema do dia/semana
  notes           text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: media_library
-- ============================================================

create table media_library (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  mime_type   text not null,
  file_size   integer,       -- bytes
  width       integer,
  height      integer,
  tags        text[] default '{}',
  used_in     uuid[],        -- IDs de conteúdo que usam esta mídia
  created_at  timestamptz not null default now()
);

-- ============================================================
-- FK adicionais nas transactions
-- ============================================================

alter table transactions
  add constraint fk_transactions_categoria
    foreign key (category_id) references categorias_financeiras(id) on delete set null;

alter table transactions
  add constraint fk_transactions_conta
    foreign key (conta_bancaria_id) references contas_bancarias(id) on delete set null;

alter table transactions
  add constraint fk_transactions_nfse
    foreign key (nota_fiscal_id) references notas_fiscais(id) on delete set null;

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================

create trigger contas_bancarias_updated_at before update on contas_bancarias
  for each row execute function update_updated_at();

create trigger notas_fiscais_updated_at before update on notas_fiscais
  for each row execute function update_updated_at();

create trigger obrigacoes_fiscais_updated_at before update on obrigacoes_fiscais
  for each row execute function update_updated_at();

create trigger social_profiles_updated_at before update on social_profiles
  for each row execute function update_updated_at();

create trigger social_content_updated_at before update on social_content
  for each row execute function update_updated_at();

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_contas_bancarias_tenant on contas_bancarias(tenant_id);
create index idx_categorias_tenant on categorias_financeiras(tenant_id);
create index idx_nfse_tenant on notas_fiscais(tenant_id);
create index idx_nfse_status on notas_fiscais(status);
create index idx_obrigacoes_tenant on obrigacoes_fiscais(tenant_id);
create index idx_obrigacoes_vencimento on obrigacoes_fiscais(vencimento) where status = 'pendente';
create index idx_relatorios_tenant on relatorios_contabeis(tenant_id);
create index idx_social_content_tenant on social_content(tenant_id);
create index idx_social_content_scheduled on social_content(scheduled_at) where status = 'agendado';
create index idx_media_library_tenant on media_library(tenant_id);

-- ============================================================
-- RLS
-- ============================================================

alter table contas_bancarias enable row level security;
alter table categorias_financeiras enable row level security;
alter table notas_fiscais enable row level security;
alter table obrigacoes_fiscais enable row level security;
alter table relatorios_contabeis enable row level security;
alter table social_profiles enable row level security;
alter table social_content enable row level security;
alter table editorial_calendar enable row level security;
alter table media_library enable row level security;

create policy "contas_bancarias_all" on contas_bancarias for all using (tenant_id = get_tenant_id());
create policy "categorias_all" on categorias_financeiras for all using (tenant_id = get_tenant_id());
create policy "nfse_all" on notas_fiscais for all using (tenant_id = get_tenant_id());
create policy "obrigacoes_all" on obrigacoes_fiscais for all using (tenant_id = get_tenant_id());
create policy "relatorios_all" on relatorios_contabeis for all using (tenant_id = get_tenant_id());
create policy "social_profiles_all" on social_profiles for all using (tenant_id = get_tenant_id());
create policy "social_content_all" on social_content for all using (tenant_id = get_tenant_id());
create policy "editorial_calendar_all" on editorial_calendar for all using (tenant_id = get_tenant_id());
create policy "media_library_all" on media_library for all using (tenant_id = get_tenant_id());

-- ============================================================
-- CATEGORIAS PADRÃO do sistema (inserção via service role)
-- ============================================================

-- Será populado via seed function chamada no setup_tenant()
create or replace function seed_default_categories(p_tenant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Receitas
  insert into categorias_financeiras (tenant_id, nome, grupo, cor, is_system) values
    (p_tenant_id, 'Serviços prestados',    'receita_servico',   '#22c55e', true),
    (p_tenant_id, 'Venda de produtos',     'receita_produto',   '#16a34a', true),
    (p_tenant_id, 'Outras receitas',       'receita_outros',    '#4ade80', true);

  -- Despesas fixas
  insert into categorias_financeiras (tenant_id, nome, grupo, cor, is_system) values
    (p_tenant_id, 'Aluguel',              'despesa_fixo',      '#ef4444', true),
    (p_tenant_id, 'Internet e telefone',  'despesa_fixo',      '#dc2626', true),
    (p_tenant_id, 'Sistemas/Softwares',   'despesa_fixo',      '#b91c1c', true);

  -- Despesas pessoal
  insert into categorias_financeiras (tenant_id, nome, grupo, cor, is_system) values
    (p_tenant_id, 'Pró-labore',           'despesa_pessoal',   '#f97316', true),
    (p_tenant_id, 'Salários/Comissões',   'despesa_pessoal',   '#ea580c', true),
    (p_tenant_id, 'INSS Patronal',        'despesa_pessoal',   '#c2410c', true);

  -- Despesas variáveis
  insert into categorias_financeiras (tenant_id, nome, grupo, cor, is_system) values
    (p_tenant_id, 'Materiais/Insumos',    'despesa_variavel',  '#8b5cf6', true),
    (p_tenant_id, 'Marketing',            'despesa_variavel',  '#7c3aed', true),
    (p_tenant_id, 'Manutenção',           'despesa_variavel',  '#6d28d9', true);

  -- Fiscal
  insert into categorias_financeiras (tenant_id, nome, grupo, cor, is_system) values
    (p_tenant_id, 'DAS/Simples Nacional', 'despesa_fiscal',    '#64748b', true),
    (p_tenant_id, 'ISS',                  'despesa_fiscal',    '#475569', true),
    (p_tenant_id, 'INSS',                 'despesa_fiscal',    '#334155', true);
end;
$$;

-- ============================================================
-- ATUALIZAR setup_tenant para incluir categorias + conta caixa
-- ============================================================

create or replace function setup_tenant(
  p_user_id     uuid,
  p_name        text,
  p_slug        text,
  p_niche       niche_type,
  p_plan        plan_type,
  p_full_name   text,
  p_email       text,
  p_phone       text default null,
  p_whatsapp    text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
begin
  -- 1. Criar tenant
  insert into tenants (name, slug, niche, plan, email, phone, whatsapp)
  values (p_name, p_slug, p_niche, p_plan, p_email, p_phone, p_whatsapp)
  returning id into v_tenant_id;

  -- 2. Criar profile
  insert into profiles (id, tenant_id, full_name, email, phone, role)
  values (p_user_id, v_tenant_id, p_full_name, p_email, p_phone, 'owner');

  -- 3. Criar settings padrão
  insert into tenant_settings (tenant_id) values (v_tenant_id);

  -- 4. Ativar módulos por plano
  insert into tenant_modules (tenant_id, module_id) values
    (v_tenant_id, 'agenda'),
    (v_tenant_id, 'clientes'),
    (v_tenant_id, 'financeiro');

  if p_plan in ('pro', 'pro_plus', 'enterprise') then
    insert into tenant_modules (tenant_id, module_id) values
      (v_tenant_id, 'documentos'),
      (v_tenant_id, 'social'),
      (v_tenant_id, 'site');
  end if;

  if p_plan in ('pro_plus', 'enterprise') then
    insert into tenant_modules (tenant_id, module_id) values
      (v_tenant_id, 'contabilidade'),
      (v_tenant_id, 'nfe'),
      (v_tenant_id, 'obrigacoes');
  end if;

  if p_plan = 'enterprise' then
    insert into tenant_modules (tenant_id, module_id) values
      (v_tenant_id, 'ia_contador');
  end if;

  -- 5. Criar conta Caixa padrão
  insert into contas_bancarias (tenant_id, nome, tipo, is_default)
  values (v_tenant_id, 'Caixa', 'caixa', true);

  -- 6. Seed categorias financeiras padrão
  perform seed_default_categories(v_tenant_id);

  return v_tenant_id;
end;
$$;
