import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/dashboard/KpiCard'
import {
  Calendar, Users, DollarSign, TrendingUp,
  AlertCircle, Sparkles, ChevronRight, Clock
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getNicheConfig } from '@/lib/niche-config'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar dados do tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.tenants) redirect('/login')
  const tenant = Array.isArray(profile.tenants) ? profile.tenants[0] : profile.tenants
  const niche = getNicheConfig(tenant.niche)

  // KPIs — mês atual
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0]

  const [
    { count: appointmentsToday },
    { count: newClientsThisMonth },
    { data: revenueData },
    { data: upcomingAppointments },
    { data: overdueTransactions },
  ] = await Promise.all([
    // Atendimentos hoje
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .gte('starts_at', `${today}T00:00:00`)
      .lte('starts_at', `${today}T23:59:59`),

    // Novos clientes no mês
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .gte('created_at', startOfMonth),

    // Receita do mês
    supabase
      .from('transactions')
      .select('amount')
      .eq('tenant_id', tenant.id)
      .eq('type', 'receita')
      .eq('status', 'pago')
      .gte('paid_at', startOfMonth),

    // Próximos agendamentos
    supabase
      .from('appointments')
      .select('*, clients(full_name), services(name, duration_min)')
      .eq('tenant_id', tenant.id)
      .gte('starts_at', new Date().toISOString())
      .in('status', ['agendado', 'confirmado'])
      .order('starts_at', { ascending: true })
      .limit(5),

    // Transações vencidas
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('status', 'vencido'),
  ])

  const revenueThisMonth = revenueData?.reduce((acc, t) => acc + (t.amount ?? 0), 0) ?? 0
  const overdueCount = overdueTransactions ?? 0

  const isTrialExpiring = tenant.plan === 'trial' && tenant.trial_ends_at
    && new Date(tenant.trial_ends_at) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bom dia! 👋
        </h1>
        <p className="text-gray-500 mt-0.5">
          Aqui está um resumo do seu negócio hoje, {formatDate(new Date())}
        </p>
      </div>

      {/* Trial alert */}
      {isTrialExpiring && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Seu trial está acabando</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Assine um plano para não perder acesso ao seu histórico de clientes e dados financeiros.
            </p>
          </div>
          <button className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap flex items-center gap-1">
            Ver planos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Overdue alert */}
      {(overdueCount as number) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              {overdueCount} {(overdueCount as number) === 1 ? 'cobrança vencida' : 'cobranças vencidas'}
            </p>
            <p className="text-sm text-red-700 mt-0.5">
              Você tem recebíveis em atraso. Gere cobranças via WhatsApp agora.
            </p>
          </div>
          <a href="/financeiro?status=vencido" className="text-sm font-semibold text-red-700 hover:text-red-900 whitespace-nowrap flex items-center gap-1">
            Ver cobranças <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={niche.kpiLabels.primary}
          value={appointmentsToday ?? 0}
          icon={<Calendar className="w-4 h-4" />}
          accent
        />
        <KpiCard
          label={niche.kpiLabels.secondary}
          value={newClientsThisMonth ?? 0}
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          label={niche.kpiLabels.tertiary}
          value={formatCurrency(revenueThisMonth)}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          label={niche.kpiLabels.quaternary}
          value="—"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos agendamentos */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Próximos {niche.terms.appointments}
            </h2>
            <a href="/agenda" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {!upcomingAppointments || upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum {niche.terms.appointment} agendado</p>
              <a href="/agenda" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">
                Agendar agora
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => {
                const client = Array.isArray(apt.clients) ? apt.clients[0] : apt.clients
                const service = Array.isArray(apt.services) ? apt.services[0] : apt.services
                const aptTime = new Date(apt.starts_at)

                return (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                    <div
                      className="w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: niche.primaryColor }}
                    >
                      <span>{aptTime.getDate()}</span>
                      <span className="text-[9px] uppercase opacity-80">
                        {aptTime.toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {client?.full_name ?? 'Cliente não informado'}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {aptTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {service && ` · ${service.name}`}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      apt.status === 'confirmado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* IA Insight Banner */}
        <div className="space-y-4">
          <div
            className="card p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${niche.primaryColor}, ${niche.primaryColor}cc)` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold text-sm">IA Contador</span>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              &ldquo;Seu faturamento este mês está{' '}
              <strong>{revenueThisMonth > 0 ? 'em andamento' : 'zerado'}</strong>.{' '}
              {revenueThisMonth === 0
                ? 'Cadastre suas primeiras receitas para começar a análise.'
                : 'Continue registrando suas receitas para uma DRE precisa.'
              }
              &rdquo;
            </p>
            <a
              href="/ia-contador"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold opacity-90 hover:opacity-100"
            >
              Perguntar ao contador <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick actions */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Ações rápidas</h3>
            <div className="space-y-2">
              <a href="/agenda" className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50 transition-all">
                <Calendar className="w-4 h-4 text-gray-400" />
                Novo agendamento
              </a>
              <a href="/clientes/novo" className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50 transition-all">
                <Users className="w-4 h-4 text-gray-400" />
                Cadastrar {niche.terms.client}
              </a>
              <a href="/financeiro/novo" className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50 transition-all">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Registrar receita
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
