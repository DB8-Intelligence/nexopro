'use client'

import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionType, TransactionStatus, ContaBancaria, CategoriaFinanceira, Client } from '@/types/database'
import type { TransactionFormData } from '@/hooks/useFinanceiro'

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'receita',       label: 'Receita',       color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'despesa',       label: 'Despesa',       color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'transferencia', label: 'Transferência', color: 'bg-blue-100 text-blue-700 border-blue-300' },
]

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: 'pendente',  label: 'Pendente' },
  { value: 'pago',      label: 'Pago / Recebido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'vencido',   label: 'Vencido' },
]

const PAYMENT_METHODS = [
  { value: 'dinheiro',        label: 'Dinheiro' },
  { value: 'pix',             label: 'Pix' },
  { value: 'cartao_debito',   label: 'Cartão Débito' },
  { value: 'cartao_credito',  label: 'Cartão Crédito' },
  { value: 'boleto',          label: 'Boleto' },
  { value: 'transferencia',   label: 'Transferência' },
]

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function buildDefaultForm(): TransactionFormData {
  const now = new Date()
  return {
    type: 'receita',
    description: '',
    amount: 0,
    status: 'pendente',
    due_date: now.toISOString().slice(0, 10),
    paid_at: null,
    category_id: null,
    payment_method: null,
    competencia_mes: now.getMonth() + 1,
    competencia_ano: now.getFullYear(),
    conta_bancaria_id: null,
    client_id: null,
    notes: null,
  }
}

interface TransactionFormProps {
  open: boolean
  transaction: Transaction | null
  contas: ContaBancaria[]
  categorias: CategoriaFinanceira[]
  clients: Client[]
  onSave: (data: TransactionFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onMarkPaid: (id: string) => Promise<void>
  onClose: () => void
}

export function TransactionForm({
  open,
  transaction,
  contas,
  categorias,
  clients,
  onSave,
  onDelete,
  onMarkPaid,
  onClose,
}: TransactionFormProps) {
  const isEditing = transaction !== null
  const [form, setForm] = useState<TransactionFormData>(buildDefaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        due_date: transaction.due_date,
        paid_at: transaction.paid_at,
        category_id: transaction.category_id,
        payment_method: transaction.payment_method,
        competencia_mes: transaction.competencia_mes,
        competencia_ano: transaction.competencia_ano,
        conta_bancaria_id: transaction.conta_bancaria_id,
        client_id: transaction.client_id,
        notes: transaction.notes,
      })
    } else {
      setForm(buildDefaultForm())
    }
  }, [transaction])

  function set<K extends keyof TransactionFormData>(key: K, value: TransactionFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Filtrar categorias por tipo
  const filteredCats = categorias.filter(c => {
    if (form.type === 'receita') return c.grupo.startsWith('receita')
    if (form.type === 'despesa') return c.grupo.startsWith('despesa')
    return true
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  async function handleDelete() {
    if (!transaction) return
    if (!confirm('Excluir esta transação?')) return
    setDeleting(true)
    await onDelete(transaction.id)
    setDeleting(false)
  }

  async function handleMarkPaid() {
    if (!transaction) return
    await onMarkPaid(transaction.id)
    onClose()
  }

  if (!open) return null

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { set('type', opt.value); set('category_id', null) }}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                    form.type === opt.value
                      ? opt.color
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ex: Serviço de corte, Aluguel..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Valor e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Valor (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount || ''}
                onChange={e => set('amount', Number(e.target.value))}
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as TransactionStatus)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vencimento</label>
              <input
                type="date"
                value={form.due_date ?? ''}
                onChange={e => set('due_date', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            {form.status === 'pago' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data do pagamento</label>
                <input
                  type="date"
                  value={form.paid_at ? form.paid_at.slice(0, 10) : ''}
                  onChange={e => set('paid_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
            <select
              value={form.category_id ?? ''}
              onChange={e => set('category_id', e.target.value || null)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Sem categoria</option>
              {filteredCats.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Conta bancária e Pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Conta</label>
              <select
                value={form.conta_bancaria_id ?? ''}
                onChange={e => set('conta_bancaria_id', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Selecionar...</option>
                {contas.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Forma</label>
              <select
                value={form.payment_method ?? ''}
                onChange={e => set('payment_method', e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Selecionar...</option>
                {PAYMENT_METHODS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Competência */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Competência (mês)</label>
              <select
                value={form.competencia_mes ?? ''}
                onChange={e => set('competencia_mes', e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">Sem competência</option>
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
              <select
                value={form.competencia_ano ?? ''}
                onChange={e => set('competencia_ano', e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="">—</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cliente (opcional)</label>
            <select
              value={form.client_id ?? ''}
              onChange={e => set('client_id', e.target.value || null)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="">Nenhum</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value || null)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3 pt-1">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Excluir"
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {isEditing && transaction?.status === 'pendente' && (
              <button
                type="button"
                onClick={handleMarkPaid}
                className="px-3 py-2.5 rounded-xl border border-green-300 bg-green-50 text-sm text-green-700 font-medium hover:bg-green-100 transition-colors"
              >
                Marcar pago
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Lançar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
