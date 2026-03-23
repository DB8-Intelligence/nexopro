// ============================================================
// NexoPro — TypeScript Types
// Auto-sincronizados com o schema Supabase
// Rodar: npx supabase gen types typescript --local > src/types/database.ts
// ============================================================

export type NicheType =
  | 'beleza'
  | 'tecnico'
  | 'saude'
  | 'juridico'
  | 'imoveis'
  | 'pet'
  | 'educacao'
  | 'nutricao'
  | 'engenharia'
  | 'fotografia'

export type PlanType = 'trial' | 'starter' | 'pro' | 'pro_plus' | 'enterprise'

export type AppointmentStatus =
  | 'agendado'
  | 'confirmado'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
  | 'falta'

export type TransactionType = 'receita' | 'despesa' | 'transferencia'

export type TransactionStatus = 'pendente' | 'pago' | 'cancelado' | 'vencido'

export type DocumentStatus = 'rascunho' | 'enviado' | 'assinado' | 'cancelado'

export type NotificationType = 'agendamento' | 'cobranca' | 'fiscal' | 'sistema' | 'ia'

export type ContaTipo = 'corrente' | 'poupanca' | 'caixa' | 'cartao_credito' | 'outros'

export type CategoriaGrupo =
  | 'receita_servico'
  | 'receita_produto'
  | 'receita_outros'
  | 'despesa_pessoal'
  | 'despesa_fixo'
  | 'despesa_variavel'
  | 'despesa_fiscal'
  | 'despesa_investimento'

export type NfseStatus = 'pendente' | 'emitida' | 'cancelada' | 'erro'

export type ObrigacaoTipo = 'das' | 'iss' | 'inss' | 'irpf' | 'outros'

export type ObrigacaoStatus = 'pendente' | 'pago' | 'vencido' | 'dispensado'

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin'

export type ContentType = 'post' | 'reel' | 'carrossel' | 'stories'

export type ContentStatus = 'rascunho' | 'agendado' | 'publicado' | 'arquivado'

// ============================================================
// CORE TABLES
// ============================================================

export interface Tenant {
  id: string
  name: string
  slug: string
  niche: NicheType
  plan: PlanType
  plan_expires_at: string | null
  cnpj: string | null
  cpf: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_number: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  logo_url: string | null
  primary_color: string
  is_active: boolean
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: 'owner' | 'admin' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantSettings {
  id: string
  tenant_id: string
  site_enabled: boolean
  site_title: string | null
  site_description: string | null
  site_hero_image: string | null
  site_cta_text: string
  whatsapp_enabled: boolean
  whatsapp_number: string | null
  notify_new_appointment: boolean
  notify_payment_overdue: boolean
  notify_tax_due: boolean
  theme: string
  regime_tributario: string | null
  cnae: string | null
  inscricao_municipal: string | null
  nfse_provider: string | null
  nfse_token: string | null
  nfse_environment: string
  created_at: string
  updated_at: string
}

export interface TenantModule {
  id: string
  tenant_id: string
  module_id: string
  is_enabled: boolean
  created_at: string
}

// ============================================================
// OPERATIONAL TABLES
// ============================================================

export interface Client {
  id: string
  tenant_id: string
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  cpf: string | null
  birth_date: string | null
  gender: string | null
  address_street: string | null
  address_number: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  tags: string[]
  notes: string | null
  source: string | null
  total_spent: number
  last_visit_at: string | null
  visits_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  tenant_id: string
  name: string
  description: string | null
  price: number
  duration_min: number
  category: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  tenant_id: string
  client_id: string | null
  service_id: string | null
  professional_id: string | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  price: number | null
  discount: number
  total: number | null
  payment_method: string | null
  payment_status: string
  notes: string | null
  internal_notes: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  created_at: string
  updated_at: string
  // Joins opcionais
  client?: Client
  service?: Service
  professional?: Profile
}

export interface Document {
  id: string
  tenant_id: string
  client_id: string | null
  title: string
  type: string
  content: string | null
  file_url: string | null
  status: DocumentStatus
  signed_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  client?: Client
}

// ============================================================
// FINANCIAL TABLES
// ============================================================

export interface Transaction {
  id: string
  tenant_id: string
  client_id: string | null
  appointment_id: string | null
  type: TransactionType
  description: string
  amount: number
  status: TransactionStatus
  due_date: string | null
  paid_at: string | null
  category_id: string | null
  payment_method: string | null
  competencia_mes: number | null
  competencia_ano: number | null
  conta_bancaria_id: string | null
  nota_fiscal_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joins opcionais
  client?: Client
  category?: CategoriaFinanceira
  conta_bancaria?: ContaBancaria
}

// ============================================================
// ACCOUNTING MODULE (002)
// ============================================================

export interface ContaBancaria {
  id: string
  tenant_id: string
  nome: string
  tipo: ContaTipo
  banco: string | null
  agencia: string | null
  conta: string | null
  saldo_inicial: number
  saldo_atual: number
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CategoriaFinanceira {
  id: string
  tenant_id: string
  nome: string
  grupo: CategoriaGrupo
  cor: string
  is_system: boolean
  is_active: boolean
  created_at: string
}

export interface NotaFiscal {
  id: string
  tenant_id: string
  transaction_id: string | null
  client_id: string | null
  numero: string | null
  serie: string | null
  codigo_verificacao: string | null
  status: NfseStatus
  valor_servico: number
  aliquota_iss: number
  valor_iss: number
  valor_deducoes: number
  valor_liquido: number | null
  descricao_servico: string
  codigo_servico: string | null
  tomador_cpf_cnpj: string | null
  tomador_nome: string | null
  tomador_email: string | null
  provider: string | null
  provider_id: string | null
  provider_response: Record<string, unknown> | null
  xml_url: string | null
  pdf_url: string | null
  emitida_at: string | null
  cancelada_at: string | null
  created_at: string
  updated_at: string
  client?: Client
}

export interface ObrigacaoFiscal {
  id: string
  tenant_id: string
  tipo: ObrigacaoTipo
  descricao: string
  competencia_mes: number
  competencia_ano: number
  valor_base: number | null
  aliquota: number | null
  valor_calculado: number | null
  valor_pago: number | null
  vencimento: string
  pago_at: string | null
  status: ObrigacaoStatus
  codigo_barras: string | null
  linha_digitavel: string | null
  alerta_7d_at: string | null
  alerta_1d_at: string | null
  created_at: string
  updated_at: string
}

export interface RelatorioContabil {
  id: string
  tenant_id: string
  tipo: 'dre' | 'fluxo_caixa' | 'balancete'
  titulo: string
  periodo_inicio: string
  periodo_fim: string
  dados: Record<string, unknown>
  pdf_url: string | null
  gerado_por_ia: boolean
  ia_insights: string | null
  created_at: string
}

// ============================================================
// SOCIAL MEDIA TABLES
// ============================================================

export interface SocialProfile {
  id: string
  tenant_id: string
  platform: SocialPlatform
  username: string
  display_name: string | null
  profile_url: string | null
  access_token: string | null
  is_connected: boolean
  connected_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface SocialContent {
  id: string
  tenant_id: string
  type: ContentType
  status: ContentStatus
  caption: string | null
  hashtags: string[]
  media_urls: string[]
  platforms: SocialPlatform[]
  scheduled_at: string | null
  published_at: string | null
  generated_by_ai: boolean
  prompt_used: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EditorialCalendar {
  id: string
  tenant_id: string
  content_id: string | null
  scheduled_date: string
  theme: string | null
  notes: string | null
  created_at: string
  content?: SocialContent
}

export interface MediaLibrary {
  id: string
  tenant_id: string
  file_name: string
  file_url: string
  mime_type: string
  file_size: number | null
  width: number | null
  height: number | null
  tags: string[]
  used_in: string[]
  created_at: string
}

// ============================================================
// SYSTEM TABLES
// ============================================================

export interface Notification {
  id: string
  tenant_id: string
  profile_id: string | null
  type: NotificationType
  title: string
  message: string
  link: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  tenant_id: string
  profile_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// ============================================================
// HELPER TYPES
// ============================================================

/** DRE calculado para exibição */
export interface DREData {
  periodo: { mes: number; ano: number }
  receitas: {
    servicos: number
    produtos: number
    outros: number
    total: number
  }
  despesas: {
    pessoal: number
    fixo: number
    variavel: number
    fiscal: number
    total: number
  }
  resultado_bruto: number
  resultado_liquido: number
  margem_liquida: number // percentual
}

/** Fluxo de caixa para exibição */
export interface FluxoCaixaData {
  saldo_inicial: number
  entradas: number
  saidas: number
  saldo_final: number
  por_dia: Array<{
    data: string
    entradas: number
    saidas: number
    saldo: number
  }>
}

/** Dashboard KPIs */
export interface DashboardKPIs {
  primary: { label: string; value: string | number; trend?: number }
  secondary: { label: string; value: string | number; trend?: number }
  tertiary: { label: string; value: string | number; trend?: number }
  quaternary: { label: string; value: string | number; trend?: number }
}

// Database type para Supabase client
export interface Database {
  public: {
    Tables: {
      tenants: { Row: Tenant; Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Tenant> }
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> }
      tenant_settings: { Row: TenantSettings; Insert: Omit<TenantSettings, 'id' | 'created_at' | 'updated_at'>; Update: Partial<TenantSettings> }
      tenant_modules: { Row: TenantModule; Insert: Omit<TenantModule, 'id' | 'created_at'>; Update: Partial<TenantModule> }
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Client> }
      services: { Row: Service; Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Service> }
      appointments: { Row: Appointment; Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Appointment> }
      documents: { Row: Document; Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Document> }
      transactions: { Row: Transaction; Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Transaction> }
      contas_bancarias: { Row: ContaBancaria; Insert: Omit<ContaBancaria, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ContaBancaria> }
      categorias_financeiras: { Row: CategoriaFinanceira; Insert: Omit<CategoriaFinanceira, 'id' | 'created_at'>; Update: Partial<CategoriaFinanceira> }
      notas_fiscais: { Row: NotaFiscal; Insert: Omit<NotaFiscal, 'id' | 'created_at' | 'updated_at'>; Update: Partial<NotaFiscal> }
      obrigacoes_fiscais: { Row: ObrigacaoFiscal; Insert: Omit<ObrigacaoFiscal, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ObrigacaoFiscal> }
      relatorios_contabeis: { Row: RelatorioContabil; Insert: Omit<RelatorioContabil, 'id' | 'created_at'>; Update: Partial<RelatorioContabil> }
      social_profiles: { Row: SocialProfile; Insert: Omit<SocialProfile, 'id' | 'created_at' | 'updated_at'>; Update: Partial<SocialProfile> }
      social_content: { Row: SocialContent; Insert: Omit<SocialContent, 'id' | 'created_at' | 'updated_at'>; Update: Partial<SocialContent> }
      editorial_calendar: { Row: EditorialCalendar; Insert: Omit<EditorialCalendar, 'id' | 'created_at'>; Update: Partial<EditorialCalendar> }
      media_library: { Row: MediaLibrary; Insert: Omit<MediaLibrary, 'id' | 'created_at'>; Update: Partial<MediaLibrary> }
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> }
      activity_logs: { Row: ActivityLog; Insert: Omit<ActivityLog, 'id' | 'created_at'>; Update: Partial<ActivityLog> }
    }
    Functions: {
      get_tenant_id: { Args: Record<string, never>; Returns: string }
      setup_tenant: {
        Args: {
          p_user_id: string
          p_name: string
          p_slug: string
          p_niche: NicheType
          p_plan: PlanType
          p_full_name: string
          p_email: string
          p_phone?: string
          p_whatsapp?: string
        }
        Returns: string
      }
    }
    Enums: {
      niche_type: NicheType
      plan_type: PlanType
      appointment_status: AppointmentStatus
      transaction_type: TransactionType
      transaction_status: TransactionStatus
    }
  }
}
