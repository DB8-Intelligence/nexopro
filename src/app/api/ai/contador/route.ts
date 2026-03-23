import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { AI_CONFIG, buildContadorSystemPrompt, type ContadorMessage } from '@/lib/ai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Rate limit simples por tenant (em produção usar Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(tenantId: string): boolean {
  const now = Date.now()
  const window = 60 * 1000 // 1 minuto
  const maxReqs = 10

  const entry = rateLimitMap.get(tenantId)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(tenantId, { count: 1, resetAt: now + window })
    return true
  }
  if (entry.count >= maxReqs) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Buscar tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenants(name, niche, plan)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  const tenant = Array.isArray(profile.tenants) ? profile.tenants[0] : profile.tenants
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
  }

  // Verificar plano (IA Contador = enterprise, mas deixar pro_plus ter acesso básico)
  const allowedPlans = ['pro_plus', 'enterprise']
  if (!allowedPlans.includes(tenant.plan)) {
    return NextResponse.json(
      { error: 'Recurso disponível nos planos Pro Plus e Enterprise' },
      { status: 403 }
    )
  }

  // Rate limit
  if (!checkRateLimit(profile.tenant_id)) {
    return NextResponse.json(
      { error: 'Limite de 10 perguntas por minuto atingido' },
      { status: 429 }
    )
  }

  const body = await request.json() as { messages: ContadorMessage[] }

  if (!body.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
  }

  // Buscar contexto financeiro do tenant
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [revenueRes, expenseRes, overdueRes, balanceRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount')
      .eq('tenant_id', profile.tenant_id)
      .eq('type', 'receita')
      .eq('status', 'pago')
      .gte('paid_at', startOfMonth),
    supabase
      .from('transactions')
      .select('amount')
      .eq('tenant_id', profile.tenant_id)
      .eq('type', 'despesa')
      .eq('status', 'pago')
      .gte('paid_at', startOfMonth),
    supabase
      .from('transactions')
      .select('amount')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'vencido'),
    supabase
      .from('contas_bancarias')
      .select('saldo_atual')
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true),
  ])

  const revenue = revenueRes.data?.reduce((s, t) => s + t.amount, 0) ?? 0
  const expenses = expenseRes.data?.reduce((s, t) => s + t.amount, 0) ?? 0
  const overdue = overdueRes.data?.reduce((s, t) => s + t.amount, 0) ?? 0
  const balance = balanceRes.data?.reduce((s, c) => s + c.saldo_atual, 0) ?? 0

  const systemPrompt = buildContadorSystemPrompt({
    tenantName: tenant.name,
    niche: tenant.niche,
    plan: tenant.plan,
    revenueThisMonth: revenue,
    expensesThisMonth: expenses,
    profitThisMonth: revenue - expenses,
    overdueReceivables: overdue,
    cashBalance: balance,
  })

  try {
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokensCountador,
      system: systemPrompt,
      messages: body.messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 })
    }

    return NextResponse.json({ message: content.text })
  } catch (err) {
    console.error('Anthropic error:', err)
    return NextResponse.json({ error: 'Erro ao processar pergunta' }, { status: 500 })
  }
}
