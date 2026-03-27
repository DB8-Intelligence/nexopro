'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Loader2, CheckCircle2, Building2, Bell, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tenant, TenantSettings } from '@/types/database'

type Tab = 'negocio' | 'notificacoes' | 'fiscal'

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('negocio')
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Business form
  const [negocioForm, setNegocioForm] = useState({ name: '', whatsapp: '' })
  // Notifications form
  const [notifForm, setNotifForm] = useState({
    notify_new_appointment: true,
    notify_payment_overdue: true,
    notify_tax_due: true,
  })
  // Fiscal form
  const [fiscalForm, setFiscalForm] = useState({
    regime_tributario: '',
    cnae: '',
    inscricao_municipal: '',
    nfse_environment: 'homologacao',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('tenant_id').eq('id', user.id).single()
      if (!profile) return

      const [tenantRes, settingsRes] = await Promise.all([
        supabase.from('tenants').select('*').eq('id', profile.tenant_id).single(),
        supabase.from('tenant_settings').select('*').eq('tenant_id', profile.tenant_id).single(),
      ])

      const t = tenantRes.data as Tenant | null
      const s = settingsRes.data as TenantSettings | null
      setTenant(t)
      setSettings(s)

      if (t) setNegocioForm({ name: t.name, whatsapp: t.whatsapp ?? '' })
      if (s) {
        setNotifForm({
          notify_new_appointment: s.notify_new_appointment,
          notify_payment_overdue: s.notify_payment_overdue,
          notify_tax_due: s.notify_tax_due,
        })
        setFiscalForm({
          regime_tributario: s.regime_tributario ?? '',
          cnae: s.cnae ?? '',
          inscricao_municipal: s.inscricao_municipal ?? '',
          nfse_environment: s.nfse_environment ?? 'homologacao',
        })
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!tenant || !settings) return
    setSaving(true)

    await Promise.all([
      supabase.from('tenants')
        .update({ name: negocioForm.name, whatsapp: negocioForm.whatsapp || null } as unknown as Record<string, unknown>)
        .eq('id', tenant.id),
      supabase.from('tenant_settings')
        .update({
          ...notifForm,
          ...fiscalForm,
        } as unknown as Record<string, unknown>)
        .eq('id', settings.id),
    ])

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6">
        <div className="flex gap-1">
          {([
            { key: 'negocio', label: 'Negócio', icon: Building2 },
            { key: 'notificacoes', label: 'Notificações', icon: Bell },
            { key: 'fiscal', label: 'Fiscal / NFS-e', icon: Shield },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Negócio */}
        {tab === 'negocio' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do negócio</label>
              <input
                type="text"
                value={negocioForm.name}
                onChange={e => setNegocioForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={negocioForm.whatsapp}
                onChange={e => setNegocioForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano atual</label>
              <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 capitalize">
                {tenant?.plan ?? 'trial'}
              </div>
            </div>
          </>
        )}

        {/* Notificações */}
        {tab === 'notificacoes' && (
          <div className="space-y-4">
            {[
              { key: 'notify_new_appointment', label: 'Novos agendamentos', desc: 'Alerta quando um cliente agenda online' },
              { key: 'notify_payment_overdue', label: 'Pagamentos vencidos', desc: 'Lembrete de cobranças em atraso' },
              { key: 'notify_tax_due', label: 'Obrigações fiscais', desc: 'Alerta 7 dias antes do vencimento' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifForm[key as keyof typeof notifForm] ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifForm[key as keyof typeof notifForm] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Fiscal */}
        {tab === 'fiscal' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regime tributário</label>
              <select
                value={fiscalForm.regime_tributario}
                onChange={e => setFiscalForm(f => ({ ...f, regime_tributario: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecionar...</option>
                <option value="mei">MEI</option>
                <option value="simples_nacional">Simples Nacional</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                <input
                  type="text"
                  value={fiscalForm.cnae}
                  onChange={e => setFiscalForm(f => ({ ...f, cnae: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9602-5/01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição municipal</label>
                <input
                  type="text"
                  value={fiscalForm.inscricao_municipal}
                  onChange={e => setFiscalForm(f => ({ ...f, inscricao_municipal: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente NFS-e</label>
              <select
                value={fiscalForm.nfse_environment}
                onChange={e => setFiscalForm(f => ({ ...f, nfse_environment: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="homologacao">Homologação (testes)</option>
                <option value="producao">Produção</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvo!' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  )
}
