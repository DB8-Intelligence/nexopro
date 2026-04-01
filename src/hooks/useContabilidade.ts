'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NotaFiscal, ObrigacaoFiscal, DREData, NfseStatus } from '@/types/database'

interface UseContabilidadeReturn {
  notas: NotaFiscal[]
  obrigacoes: ObrigacaoFiscal[]
  dreAtual: DREData | null
  loading: boolean
  error: string | null
  createNota: (data: Omit<NotaFiscal, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'client'>) => Promise<NotaFiscal | null>
  updateNotaStatus: (id: string, status: NfseStatus) => Promise<void>
  pagarObrigacao: (id: string, valorPago: number) => Promise<void>
  calcularDRE: (mes: number, ano: number) => Promise<void>
  refresh: () => void
}

export function useContabilidade(): UseContabilidadeReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [obrigacoes, setObrigacoes] = useState<ObrigacaoFiscal[]>([])
  const [dreAtual, setDreAtual] = useState<DREData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tenant_id
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        .then(({ data }) => { if (data) setTenantId(data.tenant_id) })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    setError(null)

    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    const [notasRes, obrigacoesRes] = await Promise.all([
      supabase
        .from('notas_fiscais')
        .select('*, client:clients(full_name)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('obrigacoes_fiscais')
        .select('*')
        .order('vencimento', { ascending: true })
        .limit(30),
    ])

    if (notasRes.error) setError(notasRes.error.message)
    setNotas((notasRes.data ?? []) as NotaFiscal[])
    setObrigacoes((obrigacoesRes.data ?? []) as ObrigacaoFiscal[])

    // Calculate current month DRE
    await calcDRE(mes, ano, tenantId)
    setLoading(false)
  }, [tenantId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  async function calcDRE(mes: number, ano: number, tid: string) {
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fim = new Date(ano, mes, 0).toISOString().split('T')[0]

    const { data: txs } = await supabase
      .from('transactions')
      .select('type, amount, categoria:categorias_financeiras(grupo)')
      .eq('status', 'paid')
      .gte('paid_at', inicio)
      .lte('paid_at', fim + 'T23:59:59')

    const rows = (txs ?? []) as unknown as Array<{
      type: string
      amount: number
      categoria: { grupo: string } | null
    }>

    const receitas = rows.filter(r => r.type === 'receita')
    const despesas = rows.filter(r => r.type === 'despesa')

    const sumGrupo = (list: typeof rows, grupo: string) =>
      list.filter(r => r.categoria?.grupo === grupo).reduce((s, r) => s + r.amount, 0)

    const totalReceita = receitas.reduce((s, r) => s + r.amount, 0)
    const totalDespesa = despesas.reduce((s, r) => s + r.amount, 0)
    const resultado = totalReceita - totalDespesa

    setDreAtual({
      periodo: { mes, ano },
      receitas: {
        servicos: sumGrupo(receitas, 'servicos'),
        produtos: sumGrupo(receitas, 'produtos'),
        outros: sumGrupo(receitas, 'outros'),
        total: totalReceita,
      },
      despesas: {
        pessoal: sumGrupo(despesas, 'pessoal'),
        fixo: sumGrupo(despesas, 'fixo'),
        variavel: sumGrupo(despesas, 'variavel'),
        fiscal: sumGrupo(despesas, 'fiscal'),
        total: totalDespesa,
      },
      resultado_bruto: totalReceita - sumGrupo(despesas, 'variavel'),
      resultado_liquido: resultado,
      margem_liquida: totalReceita > 0 ? (resultado / totalReceita) * 100 : 0,
    })
    // satisfy lint - tid used for future RLS-bypass scenarios
    void tid
  }

  async function createNota(data: Omit<NotaFiscal, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'client'>) {
    if (!tenantId) return null
    const { data: nota, error: e } = await supabase
      .from('notas_fiscais')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
    if (e) { setError(e.message); return null }
    setNotas(prev => [nota as NotaFiscal, ...prev])
    return nota as NotaFiscal
  }

  async function updateNotaStatus(id: string, status: NfseStatus) {
    await supabase.from('notas_fiscais').update({ status }).eq('id', id)
    setNotas(prev => prev.map(n => n.id === id ? { ...n, status } : n))
  }

  async function pagarObrigacao(id: string, valorPago: number) {
    const now = new Date().toISOString()
    await supabase
      .from('obrigacoes_fiscais')
      .update({ status: 'pago', valor_pago: valorPago, pago_at: now })
      .eq('id', id)
    setObrigacoes(prev =>
      prev.map(o => o.id === id ? { ...o, status: 'pago' as const, valor_pago: valorPago, pago_at: now } : o)
    )
  }

  async function calcularDRE(mes: number, ano: number) {
    if (!tenantId) return
    await calcDRE(mes, ano, tenantId)
  }

  return {
    notas, obrigacoes, dreAtual, loading, error,
    createNota, updateNotaStatus, pagarObrigacao, calcularDRE,
    refresh: load,
  }
}
