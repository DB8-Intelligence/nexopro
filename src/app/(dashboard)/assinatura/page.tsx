'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, ExternalLink, Loader2, CreditCard, AlertCircle, Calendar } from 'lucide-react'
import { PricingTable } from '@/components/billing/PricingTable'
import { createClient } from '@/lib/supabase/client'
import type { Tenant, PlanType } from '@/types/database'
import { cn } from '@/lib/utils'

const PLAN_LABELS: Record<PlanType, string> = {
  trial: 'Trial gratuito',
  starter: 'Starter',
  pro: 'Pro',
  pro_plus: 'Pro Plus',
  enterprise: 'Enterprise',
}

const PLAN_COLORS: Record<PlanType, string> = {
  trial:      'bg-gray-100 text-gray-700',
  starter:    'bg-blue-50 text-blue-700',
  pro:        'bg-purple-50 text-purple-700',
  pro_plus:   'bg-orange-50 text-orange-700',
  enterprise: 'bg-teal-50 text-teal-700',
}

export default function AssinaturaPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    async function fetchTenant() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()
      if (!profile?.tenant_id) return
      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single()
      setTenant(data)
      setLoading(false)
    }
    fetchTenant()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (success) {
      setToast({ type: 'success', message: 'Assinatura ativada com sucesso! 🎉' })
      router.replace('/assinatura')
    } else if (canceled) {
      setToast({ type: 'error', message: 'Checkout cancelado.' })
      router.replace('/assinatura')
    }
  }, [success, canceled, router])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleSelectPlan(plan: PlanType) {
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json() as { url?: string; error?: string }
    if (data.url) {
      window.location.href = data.url
    } else {
      setToast({ type: 'error', message: data.error ?? 'Erro ao criar checkout' })
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json() as { url?: string; error?: string }
    if (data.url) {
      window.location.href = data.url
    } else {
      setToast({ type: 'error', message: data.error ?? 'Erro ao abrir portal' })
    }
    setPortalLoading(false)
  }

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  const isTrial = tenant.plan === 'trial'
  const hasBilling = !!tenant.stripe_subscription_id
  const cancelAtPeriod = tenant.cancel_at_period_end
  const expiresAt = tenant.plan_expires_at
    ? new Date(tenant.plan_expires_at).toLocaleDateString('pt-BR')
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-xl text-sm',
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-sm text-gray-500">Gerencie seu plano e faturamento.</p>
      </div>

      {/* Current plan */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">Plano atual</p>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', PLAN_COLORS[tenant.plan])}>
                  {PLAN_LABELS[tenant.plan]}
                </span>
                {cancelAtPeriod && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 font-semibold">
                    Cancelamento agendado
                  </span>
                )}
              </div>
              {isTrial && tenant.trial_ends_at && (
                <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <Calendar className="w-3 h-3" />
                  Trial expira em {new Date(tenant.trial_ends_at).toLocaleDateString('pt-BR')}
                </p>
              )}
              {expiresAt && !isTrial && (
                <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  {cancelAtPeriod ? 'Acesso até' : 'Renova em'} {expiresAt}
                </p>
              )}
            </div>
          </div>

          {hasBilling && (
            <button
              type="button"
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              {portalLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ExternalLink className="w-3.5 h-3.5" />}
              Gerenciar faturamento
            </button>
          )}
        </div>
      </div>

      {/* Plans */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-4">
          {isTrial ? 'Escolha um plano para continuar' : 'Planos disponíveis'}
        </p>
        <PricingTable currentPlan={tenant.plan} onSelectPlan={handleSelectPlan} />
      </div>
    </div>
  )
}
