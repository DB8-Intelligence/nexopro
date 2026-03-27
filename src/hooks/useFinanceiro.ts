'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Transaction,
  TransactionType,
  TransactionStatus,
  ContaBancaria,
  CategoriaFinanceira,
  Client,
} from '@/types/database'

export interface TransactionFormData {
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
  client_id: string | null
  notes: string | null
}

export interface FinanceiroSummary {
  totalReceita: number
  totalDespesa: number
  saldo: number
  pendente: number
}

interface UseFinanceiroReturn {
  transactions: Transaction[]
  contas: ContaBancaria[]
  categorias: CategoriaFinanceira[]
  clients: Client[]
  loading: boolean
  error: string | null
  summary: FinanceiroSummary
  fetchByMonth: (year: number, month: number) => Promise<void>
  createTransaction: (data: TransactionFormData) => Promise<Transaction | null>
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  markAsPaid: (id: string, paidAt?: string) => Promise<boolean>
}

function calcSummary(transactions: Transaction[]): FinanceiroSummary {
  let totalReceita = 0
  let totalDespesa = 0
  let pendente = 0

  for (const t of transactions) {
    if (t.status === 'cancelado') continue
    if (t.type === 'receita') totalReceita += t.amount
    else if (t.type === 'despesa') totalDespesa += t.amount
    if (t.status === 'pendente') pendente += t.type === 'receita' ? t.amount : -t.amount
  }

  return {
    totalReceita,
    totalDespesa,
    saldo: totalReceita - totalDespesa,
    pendente,
  }
}

export function useFinanceiro(): UseFinanceiroReturn {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inicializa lookups
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: contasData }, { data: catData }, { data: clientsData }] =
        await Promise.all([
          supabase.from('profiles').select('tenant_id').eq('id', user.id).single(),
          supabase.from('contas_bancarias').select('*').eq('is_active', true).order('nome'),
          supabase.from('categorias_financeiras').select('*').eq('is_active', true).order('nome'),
          supabase.from('clients').select('id, full_name').eq('is_active', true).order('full_name'),
        ])

      setTenantId(profile?.tenant_id ?? null)
      setContas(contasData ?? [])
      setCategorias(catData ?? [])
      setClients((clientsData as Client[]) ?? [])
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchByMonth = useCallback(async (year: number, month: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*, client:clients(id, full_name), category:categorias_financeiras(id, nome, cor, grupo), conta_bancaria:contas_bancarias(id, nome)')
      .or(`competencia_ano.is.null,competencia_ano.eq.${year}`)
      .or(`competencia_mes.is.null,competencia_mes.eq.${month}`)
      .order('due_date', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTransactions(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  const createTransaction = useCallback(async (data: TransactionFormData): Promise<Transaction | null> => {
    if (!tenantId) {
      setError('Tenant não identificado. Faça login novamente.')
      return null
    }

    const { data: created, error: createError } = await supabase
      .from('transactions')
      .insert({ ...data, tenant_id: tenantId })
      .select('*, client:clients(id, full_name), category:categorias_financeiras(id, nome, cor, grupo), conta_bancaria:contas_bancarias(id, nome)')
      .single()

    if (createError) {
      setError(createError.message)
      return null
    }

    setTransactions(prev => [created, ...prev])
    return created
  }, [supabase, tenantId])

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>): Promise<boolean> => {
    const { data: updated, error: updateError } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)
      .select('*, client:clients(id, full_name), category:categorias_financeiras(id, nome, cor, grupo), conta_bancaria:contas_bancarias(id, nome)')
      .single()

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setTransactions(prev => prev.map(t => (t.id === id ? updated : t)))
    return true
  }, [supabase])

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setTransactions(prev => prev.filter(t => t.id !== id))
    return true
  }, [supabase])

  const markAsPaid = useCallback(async (id: string, paidAt?: string): Promise<boolean> => {
    return updateTransaction(id, {
      status: 'pago',
      paid_at: paidAt ?? new Date().toISOString(),
    })
  }, [updateTransaction])

  const summary = calcSummary(transactions)

  return {
    transactions,
    contas,
    categorias,
    clients,
    loading,
    error,
    summary,
    fetchByMonth,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
  }
}
