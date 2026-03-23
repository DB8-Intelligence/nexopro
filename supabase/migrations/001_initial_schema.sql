-- ============================================================
-- NexoPro — Schema Inicial (001)
-- Multi-tenant SaaS com RLS completo
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- TIPOS ENUM
-- ============================================================

create type niche_type as enum (
  'beleza', 'tecnico', 'saude', 'juridico', 'imoveis',
  'pet', 'educacao', 'nutricao', 'engenharia', 'fotografia'
);

create type plan_type as enum (
  'trial', 'starter', 'pro', 'pro_plus', 'enterprise'
);

create type appointment_status as enum (
  'agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta'
);

create type transaction_type as enum ('receita', 'despesa', 'transferencia');

create type transaction_status as enum ('pendente', 'pago', 'cancelado', 'vencido');

create type document_status as enum ('rascunho', 'enviado', 'assinado', 'cancelado');

create type notification_type as enum (
  'agendamento', 'cobranca', 'fiscal', 'sistema', 'ia'
);

-- ============================================================
-- FUNÇÃO HELPER: tenant_id do usuário logado
-- ============================================================

create or replace function get_tenant_id()
returns uuid
language sql
stable
as $$
  select tenant_id from profiles
  where id = auth.uid()
  limit 1;
$$;

-- ============================================================
-- TABELA: tenants
-- ============================================================

create table tenants (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  niche           niche_type not null default 'beleza',
  plan            plan_type not null default 'trial',
  plan_expires_at timestamptz,
  -- Identificação
  cnpj            text,
  cpf             text,
  email           text,
  phone           text,
  whatsapp        text,
  -- Endereço
  address_street  text,
  address_number  text,
  address_city    text,
  address_state   char(2),
  address_zip     text,
  -- Branding
  logo_url        text,
  primary_color   text default '#6366f1',
  -- Status
  is_active       boolean not null default true,
  trial_ends_at   timestamptz default (now() + interval '14 days'),
  -- Metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: profiles
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  phone       text,
  avatar_url  text,
  role        text not null default 'owner', -- owner, admin, staff
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TABELA: tenant_settings
-- ============================================================

create table tenant_settings (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null unique references tenants(id) on delete cascade,
  -- Site público
  site_enabled     boolean not null default false,
  site_title       text,
  site_description text,
  site_hero_image  text,
  site_cta_text    text default 'Agendar agora',
  -- WhatsApp
  whatsapp_enabled boolean not null default false,
  whatsapp_number  text,
  -- Notificações
  notify_new_appointment  boolean not null default true,
  notify_payment_overdue  boolean not null default true,
  notify_tax_due          boolean not null default true,
  -- Aparência
  theme            text not null default 'light',
  -- Fiscal
  regime_tributario text default 'mei', -- mei, simples, lucro_presumido
  cnae             text,
  inscricao_municipal text,
  -- Integração NFS-e
  nfse_provider    text, -- focus_nfe, enotas
  nfse_token       text,
  nfse_environment text default 'homologacao',
  -- Metadata
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- TABELA: tenant_modules
-- ============================================================

create table tenant_modules (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  module_id   text not null,           -- agenda, clientes, financeiro, etc.
  is_enabled  boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(tenant_id, module_id)
);

-- ============================================================
-- TABELA: clients
-- ============================================================

create table clients (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  -- Dados básicos
  full_name       text not null,
  email           text,
  phone           text,
  whatsapp        text,
  cpf             text,
  birth_date      date,
  gender          text,
  -- Endereço
  address_street  text,
  address_number  text,
  address_city    text,
  address_state   char(2),
  address_zip     text,
  -- CRM
  tags            text[] default '{}',
  notes           text,
  source          text, -- indicacao, instagram, google, etc.
  -- Financeiro
  total_spent     numeric(12,2) default 0,
  last_visit_at   timestamptz,
  visits_count    integer default 0,
  -- Status
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: services
-- ============================================================

create table services (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null default 0,
  duration_min  integer not null default 60,    -- em minutos
  category      text,
  color         text default '#6366f1',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- TABELA: appointments
-- ============================================================

create table appointments (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  client_id       uuid references clients(id) on delete set null,
  service_id      uuid references services(id) on delete set null,
  professional_id uuid references profiles(id) on delete set null,
  -- Agendamento
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          appointment_status not null default 'agendado',
  -- Valores
  price           numeric(10,2),
  discount        numeric(10,2) default 0,
  total           numeric(10,2),
  -- Pagamento
  payment_method  text, -- dinheiro, pix, cartao_debito, cartao_credito
  payment_status  text default 'pendente',
  -- Notas
  notes           text,
  internal_notes  text,
  -- Recorrência
  is_recurring    boolean default false,
  recurrence_rule text,
  -- Metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: documents
-- ============================================================

create table documents (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  client_id   uuid references clients(id) on delete set null,
  title       text not null,
  type        text not null default 'contrato', -- contrato, orcamento, termo
  content     text,                              -- HTML do documento
  file_url    text,                              -- PDF gerado
  status      document_status not null default 'rascunho',
  signed_at   timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TABELA: transactions
-- ============================================================

create table transactions (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  client_id           uuid references clients(id) on delete set null,
  appointment_id      uuid references appointments(id) on delete set null,
  -- Dados financeiros
  type                transaction_type not null,
  description         text not null,
  amount              numeric(12,2) not null,
  status              transaction_status not null default 'pendente',
  -- Datas
  due_date            date,
  paid_at             timestamptz,
  -- Categorização (para DRE)
  category_id         uuid,  -- fk para categorias_financeiras (tabela 002)
  payment_method      text,
  -- Competência para DRE
  competencia_mes     integer check (competencia_mes between 1 and 12),
  competencia_ano     integer,
  -- Banco
  conta_bancaria_id   uuid,  -- fk para contas_bancarias (tabela 002)
  -- NFS-e
  nota_fiscal_id      uuid,  -- fk para notas_fiscais (tabela 002)
  -- Metadata
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- TABELA: notifications
-- ============================================================

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  profile_id  uuid references profiles(id) on delete cascade,
  type        notification_type not null default 'sistema',
  title       text not null,
  message     text not null,
  link        text,
  is_read     boolean not null default false,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TABELA: activity_logs
-- ============================================================

create table activity_logs (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  profile_id  uuid references profiles(id) on delete set null,
  action      text not null,  -- created, updated, deleted, etc.
  entity_type text not null,  -- client, appointment, transaction, etc.
  entity_id   uuid,
  metadata    jsonb default '{}',
  ip_address  inet,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_updated_at before update on tenants
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger tenant_settings_updated_at before update on tenant_settings
  for each row execute function update_updated_at();

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger services_updated_at before update on services
  for each row execute function update_updated_at();

create trigger appointments_updated_at before update on appointments
  for each row execute function update_updated_at();

create trigger documents_updated_at before update on documents
  for each row execute function update_updated_at();

create trigger transactions_updated_at before update on transactions
  for each row execute function update_updated_at();

-- ============================================================
-- ÍNDICES de performance
-- ============================================================

create index idx_profiles_tenant_id on profiles(tenant_id);
create index idx_clients_tenant_id on clients(tenant_id);
create index idx_clients_phone on clients(phone);
create index idx_appointments_tenant_id on appointments(tenant_id);
create index idx_appointments_starts_at on appointments(starts_at);
create index idx_appointments_client_id on appointments(client_id);
create index idx_transactions_tenant_id on transactions(tenant_id);
create index idx_transactions_due_date on transactions(due_date);
create index idx_transactions_competencia on transactions(competencia_ano, competencia_mes);
create index idx_notifications_tenant_id_unread on notifications(tenant_id) where is_read = false;
create index idx_activity_logs_tenant_id on activity_logs(tenant_id);
create index idx_tenants_slug on tenants(slug);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table tenants enable row level security;
alter table profiles enable row level security;
alter table tenant_settings enable row level security;
alter table tenant_modules enable row level security;
alter table clients enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table documents enable row level security;
alter table transactions enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;

-- tenants: usuário vê só o seu tenant
create policy "tenants_select" on tenants for select
  using (id = get_tenant_id());

create policy "tenants_update" on tenants for update
  using (id = get_tenant_id());

-- profiles: usuário vê profiles do seu tenant
create policy "profiles_select" on profiles for select
  using (tenant_id = get_tenant_id());

create policy "profiles_update" on profiles for update
  using (tenant_id = get_tenant_id());

-- tenant_settings
create policy "settings_all" on tenant_settings for all
  using (tenant_id = get_tenant_id());

-- tenant_modules
create policy "modules_all" on tenant_modules for all
  using (tenant_id = get_tenant_id());

-- clients
create policy "clients_all" on clients for all
  using (tenant_id = get_tenant_id());

-- services
create policy "services_all" on services for all
  using (tenant_id = get_tenant_id());

-- appointments
create policy "appointments_all" on appointments for all
  using (tenant_id = get_tenant_id());

-- documents
create policy "documents_all" on documents for all
  using (tenant_id = get_tenant_id());

-- transactions
create policy "transactions_all" on transactions for all
  using (tenant_id = get_tenant_id());

-- notifications
create policy "notifications_all" on notifications for all
  using (tenant_id = get_tenant_id());

-- activity_logs
create policy "activity_logs_select" on activity_logs for select
  using (tenant_id = get_tenant_id());

create policy "activity_logs_insert" on activity_logs for insert
  with check (tenant_id = get_tenant_id());

-- Site público: tenants acessível sem auth para leitura do slug
create policy "tenants_public_slug" on tenants for select
  using (is_active = true);

create policy "tenant_settings_public" on tenant_settings for select
  using (site_enabled = true);

-- ============================================================
-- FUNÇÃO: setup completo do tenant no onboarding
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

  -- 2. Criar profile para o usuário
  insert into profiles (id, tenant_id, full_name, email, phone, role)
  values (p_user_id, v_tenant_id, p_full_name, p_email, p_phone, 'owner');

  -- 3. Criar settings padrão
  insert into tenant_settings (tenant_id)
  values (v_tenant_id);

  -- 4. Ativar módulos padrão por plano
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

  return v_tenant_id;
end;
$$;
