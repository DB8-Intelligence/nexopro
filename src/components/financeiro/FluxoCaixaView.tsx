'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Clock, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionType, TransactionStatus } from '@/types/database'
import type { FinanceiroSummary } from '@/hooks/useFinanceiro'

const MONTHS = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
]

const TYPE_COLORS: Record<TransactionType, string> = {
  receita:       'text-green-600 bg-green-50',
  despesa:       'text-red-600 bg-red-50',
  transferencia: 'text-blue-600 bg-blue-50',
}

const STATUS_BADGE: Record<TransactionStatus, string> = {
  pendente:  'bg-yellow-100 text-yellow-700',
  pago:      'bg-green-100 text-green-700',
  cancelado: 'bg-gray-100 text-gray-500',
  vencido:   'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<TransactionStatus, string> = {
  pendente:  'Pendente',
  pago:      'Pago',
  cancelado: 'Cancelado',
  vencido:   'Vencido',
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface FluxoCaixaViewProps {
  transactions: Transaction[]
  summary: FinanceiroSummary
  loading: boolean
  onPeriodChange: (year: number, month: number) => void
  onSelectTransaction: (transaction: Transaction) => void
  onNewTransaction: () => void
}

export function FluxoCaixaView({
  transactions,
  summary,
  loading,
  onPeriodChange,
  onSelectTransaction,
  onNewTransaction,
}: FluxoCaixaViewProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all')

  function navigate(direction: -1 | 1) {
    let newMonth = month + direction
    let newYear = year
    if (newMonth < 1) { newMonth = 12; newYear-- }
    if (newMonth > 12) { newMonth = 1; newYear++ }
    setMonth(newMonth)
    setYear(newYear)
    onPeriodChange(newYear, newMonth)
  }

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Navegação de período */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => {
              const now = new Date()
              setYear(now.getFullYear())
              setMonth(now.getMonth() + 1)
              onPeriodChange(now.getFullYear(), now.getMonth() + 1)
            }}
            className="ml-1 px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hoje
          </button>
        </div>
        {loading && <span className="text-xs text-gray-400 animate-pulse">Carregando...</span>}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Receitas</p>
            <p className="text-sm font-bold text-green-700">{formatBRL(summary.totalReceita)}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Despesas</p>
            <p className="text-sm font-bold text-red-700">{formatBRL(summary.totalDespesa)}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            summary.saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'
          )}>
            <Wallet className={cn('w-4 h-4', summary.saldo >= 0 ? 'text-blue-600' : 'text-orange-600')} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo</p>
            <p className={cn(
              'text-sm font-bold',
              summary.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'
            )}>
              {formatBRL(summary.saldo)}
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">A receber</p>
            <p className="text-sm font-bold text-yellow-700">{formatBRL(Math.max(summary.pendente, 0))}</p>
          </div>
        </div>
      </div>

      {/* Filtros + Botão novo */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
        </div>

        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs">
          {(['all', 'receita', 'despesa'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterType(opt)}
              className={cn(
                'px-3 py-1.5 transition-colors capitalize',
                filterType === opt
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt === 'all' ? 'Todos' : opt === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs">
          {(['all', 'pendente', 'pago'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt as TransactionStatus | 'all')}
              className={cn(
                'px-3 py-1.5 transition-colors',
                filterStatus === opt
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt === 'all' ? 'Todos' : opt === 'pendente' ? 'Pendentes' : 'Pagos'}
            </button>
          ))}
        </div>

        <button
          onClick={onNewTransaction}
          className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Lançamento
        </button>
      </div>

      {/* Lista de transações */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-sm text-gray-400">
            <span>{loading ? 'Carregando...' : 'Nenhum lançamento neste período'}</span>
            {!loading && (
              <button onClick={onNewTransaction} className="text-blue-600 hover:underline text-sm">
                Criar primeiro lançamento
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(t => (
              <div
                key={t.id}
                onClick={() => onSelectTransaction(t)}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Tipo */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold',
                  TYPE_COLORS[t.type]
                )}>
                  {t.type === 'receita' ? '+' : t.type === 'despesa' ? '−' : '↔'}
                </div>

                {/* Descrição */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.category && (
                      <span className="text-xs text-gray-400">{t.category.nome}</span>
                    )}
                    {t.client && (
                      <span className="text-xs text-gray-400">· {t.client.full_name}</span>
                    )}
                    {t.due_date && (
                      <span className="text-xs text-gray-400">
                        · {new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
                  STATUS_BADGE[t.status]
                )}>
                  {STATUS_LABELS[t.status]}
                </span>

                {/* Valor */}
                <span className={cn(
                  'text-sm font-bold flex-shrink-0 w-28 text-right',
                  t.type === 'receita' ? 'text-green-700' : t.type === 'despesa' ? 'text-red-700' : 'text-blue-700'
                )}>
                  {t.type === 'despesa' ? '- ' : '+ '}{formatBRL(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
